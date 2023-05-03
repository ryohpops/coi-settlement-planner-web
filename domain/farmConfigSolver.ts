import highsLoader, { Highs, HighsLinearSolutionColumn, HighsMixedIntegerLinearSolutionColumn } from "highs"
import { generateCropRotations } from "./cropRotation"
import { Item, MEDICAL_SUPPLIES, VIRTUAL_ITEM, allFoods, allItems } from "./item"
import { FarmVariant, Recipe, farmingRecipes, productRecipesByName, productRecipesByPrimaryProduct } from "./recipe"

const TIME_SCALE = 60

export interface ItemStatus {
  item: Item
  ins: Map<string, number>
  outs: Map<string, number>
}
export interface RecipeStatus {
  recipe: Recipe
  times: number
}
export interface FarmConfigSolution {
  feasible: boolean
  itemStatus: Map<string, ItemStatus>
  recipeStatus: Map<string, RecipeStatus>
}

let highs: Highs
export async function solveFarmConfig(
  populationForFood: number, foodsInUse: string[],
  populationForMedicalSupplies: number, medicalSuppliesInUse: string,
  recipesInUse: string[],
  farmVariant: FarmVariant, fertilityTarget: number
): Promise<FarmConfigSolution> {
  if (!highs) {
    highs = await highsLoader({
      locateFile: (file) => "https://lovasoa.github.io/highs-js/" + file
    })
  }

  const itemStatus = new Map<string, ItemStatus>()
  allItems.forEach((item, itemName) =>
    itemStatus.set(itemName, { item: item, ins: new Map(), outs: new Map() })
  )
  const recipeStatus = new Map<string, RecipeStatus>()

  const isProductSolved = await solveProduct(
    itemStatus, recipeStatus, populationForFood, foodsInUse,
    populationForMedicalSupplies, medicalSuppliesInUse, recipesInUse, highs
  )
  if (!isProductSolved) {
    return {
      feasible: false, itemStatus: new Map(), recipeStatus: new Map()
    }
  }

  const isFarmSolved = await solveFarm(itemStatus, recipeStatus, farmVariant, fertilityTarget, highs)
  if (!isFarmSolved) {
    return {
      feasible: false, itemStatus: new Map(), recipeStatus: new Map()
    }
  }

  const activeItemStatus = new Map(
    Array.from(itemStatus).filter(([itemName, item]) => item.ins.size + item.outs.size > 0)
  )
  const activeRecipeStatus = new Map(
    Array.from(recipeStatus).filter(([recipeName, recipe]) => recipe.times > 0)
  )
  return {
    feasible: true,
    itemStatus: activeItemStatus,
    recipeStatus: activeRecipeStatus
  }
}

async function solveProduct(
  itemStatus: Map<string, ItemStatus>, recipeStatus: Map<string, RecipeStatus>,
  populationForFood: number, foodsInUse: string[], populationForMedicalSupplies: number, medicalSuppliesInUse: string,
  recipesInUse: string[], highs: Highs
): Promise<boolean> {
  const foodDemands = calculateFoodDemands(populationForFood, foodsInUse)
  foodDemands.forEach((demand, foodName) => {
    const food = getMapItem(itemStatus, foodName)
    food.outs.set(VIRTUAL_ITEM.Demand, demand)
  })
  const medicalSuppliesDemand = calculateMedicalSuppliesDemand(populationForMedicalSupplies, medicalSuppliesInUse)
  medicalSuppliesDemand.forEach((demand, medicalSuppliesName) => {
    const medicalSupplies = getMapItem(itemStatus, medicalSuppliesName)
    medicalSupplies.outs.set(VIRTUAL_ITEM.Demand, demand)
  })

  const selectedRecipes: Array<string> = []
  const subjects = new Map<string, string>()
  productRecipesByPrimaryProduct.forEach((recipes, primaryProductName) => {
    let recipe: Recipe
    if (recipes.length === 1) {
      recipe = recipes[0]
    } else {
      recipe = recipes.filter((recipe) => recipesInUse.includes(recipe.name))[0]
    }
    selectedRecipes.push(ToVariableName(recipe.name))

    recipe.products.forEach((amount, productName) => {
      setOrConcatItem(subjects, ToVariableName(productName), ` + ${amount / recipe.production_time * TIME_SCALE} ${ToVariableName(recipe.name)}`)
    })
    recipe.ingredients.forEach((amount, ingredientName) => {
      setOrConcatItem(subjects, ToVariableName(ingredientName), ` - ${amount / recipe.production_time * TIME_SCALE} ${ToVariableName(recipe.name)}`)
    })
  })

  allItems.forEach((item, itemName) => {
    if (!item.isCrop && subjects.has(ToVariableName(itemName))) {
      if (foodDemands.has(itemName)) {
        setOrConcatItem(subjects, ToVariableName(itemName), ` >= ${getMapItem(foodDemands, itemName)}`)
      } else if (medicalSuppliesDemand.has(itemName)) {
        setOrConcatItem(subjects, ToVariableName(itemName), ` >= ${getMapItem(medicalSuppliesDemand, itemName)}`)
      } else {
        setOrConcatItem(subjects, ToVariableName(itemName), ` >= 0`)
      }
    }
  })

  let productProblem = "Minimize\n"
  productProblem += ` Factories: ${selectedRecipes.join(" + ")}\n`
  productProblem += "Subject To\n"
  subjects.forEach((subject, subjectName) => {
    if (subject.includes(">=")) {
      productProblem += ` ${subjectName}:${subject}\n`
    }
  })
  productProblem += "End"

  const solution = highs.solve(productProblem)
  if (solution.Status != "Optimal") {
    return false
  }

  Object.values(solution.Columns).forEach((solutionColumn: HighsLinearSolutionColumn) => {
    const recipeName = FromVariableName(solutionColumn.Name)

    const recipe = getMapItem(productRecipesByName, recipeName)
    recipeStatus.set(recipeName, { recipe: recipe, times: solutionColumn.Primal })

    recipe.products.forEach((amount, itemName) => {
      setOrSumItem(
        getMapItem(itemStatus, itemName).ins,
        recipeName,
        amount * solutionColumn.Primal / recipe.production_time * TIME_SCALE
      )
    })
    recipe.ingredients.forEach((amount, itemName) => {
      const item = getMapItem(itemStatus, itemName)
      const normalizedDemand = amount * solutionColumn.Primal / recipe.production_time * TIME_SCALE
      setOrSumItem(item.outs, recipeName, normalizedDemand)
    })
  })
  return true
}

function calculateFoodDemands(population: number, foodsInUse: string[]): Map<string, number> {
  const demands = new Map<string, number>()
  const foods = foodsInUse.map((foodName) => getMapItem(allFoods, foodName))

  const categoriesInUse = new Set(foods.map((food) => food.category))
  foods.forEach((food) => demands.set(
    food.name,
    population
    / food.feeds
    / categoriesInUse.size
    / foods.filter((food2) => food2.category === food.category).length
  ))

  return demands
}

function calculateMedicalSuppliesDemand(population: number, medicalSuppliesInUse: string): Map<string, number> {
  const demands = new Map<string, number>()
  if (medicalSuppliesInUse !== MEDICAL_SUPPLIES.None) {
    demands.set(
      medicalSuppliesInUse,
      population / 1000 * 5.4
    )
  }
  return demands
}

async function solveFarm(
  itemStatus: Map<string, ItemStatus>, recipeStatus: Map<string, RecipeStatus>,
  farmVariant: FarmVariant, fertilityTarget: number, highs: Highs
): Promise<boolean> {
  const cropWithDemands = Array.from(itemStatus.values())
    .filter((item) => item.item.isCrop && item.outs.size > 0)
  const farmingRecipesOfVariant = Array.from(farmingRecipes[farmVariant].values())
  const cropRecipes = cropWithDemands
    .map((item) => farmingRecipesOfVariant.find((recipe) => recipe.products.has(item.item.name))!)
  const cropRotations = generateCropRotations(cropRecipes, fertilityTarget) //TODO: is this needed to be a Map?
  cropRotations.forEach((cropRotation, cropRotationName) =>
    recipeStatus.set(cropRotationName, { recipe: cropRotation, times: 0 })
  )

  const subjects = new Map<string, string>()
  cropRotations.forEach((cropRotation, cropRotationName) => {
    cropRotation.products.forEach((amount, productName) => {
      setOrConcatItem(subjects, ToVariableName(productName), ` + ${amount / cropRotation.production_time * TIME_SCALE} ${ToVariableName(cropRotationName)} `)
    })
  })

  cropWithDemands.forEach((crop) => {
    const amount = Array.from(crop.outs.values()).reduce((sum, amount) => sum + amount, 0)
    setOrConcatItem(subjects, ToVariableName(crop.item.name), ` >= ${amount} `)
  })

  const variables = Array.from(cropRotations.keys()).map((name) => ToVariableName(name))
  let farmProblem = "Minimize\n"
  farmProblem += ` Farms: ${variables.join(" + ")}\n`
  farmProblem += "Subject To\n"
  subjects.forEach((subject, subjectName) => {
    if (subject.includes(">=")) {
      farmProblem += ` ${subjectName}:${subject}\n`
    }
  })
  farmProblem += "General\n"
  farmProblem += ` ${variables.join(" ")}`
  farmProblem += "\nEnd"

  const solution = highs.solve(farmProblem)
  if (solution.Status != "Optimal") {
    return false
  }

  Object.values(solution.Columns).forEach((solutionColumn: HighsMixedIntegerLinearSolutionColumn) => {
    const cropRotationName = FromVariableName(solutionColumn.Name)

    const recipe = getMapItem(cropRotations, cropRotationName)
    recipeStatus.set(cropRotationName, { recipe: recipe, times: solutionColumn.Primal })

    recipe.products.forEach((amount, itemName) => {
      setOrSumItem(
        getMapItem(itemStatus, itemName).ins,
        cropRotationName,
        amount * solutionColumn.Primal / recipe.production_time * TIME_SCALE
      )
    })
  })
  return true
}

function getMapItem<T>(map: Map<string, T>, key: string): T {
  if (map.has(key)) {
    return map.get(key)!
  } else {
    throw new Error(`Key ${key} does not exist. Item data and/or recipe data might be broken.`)
  }
}

function setOrSumItem(map: Map<string, number>, key: string, value: number) {
  if (map.has(key)) {
    map.set(key, map.get(key)! + value)
  } else {
    map.set(key, value)
  }
}

function setOrConcatItem(map: Map<string, string>, key: string, value: string) {
  if (map.has(key)) {
    map.set(key, map.get(key)! + value)
  } else {
    map.set(key, value)
  }
}

function ToVariableName(value: string) {
  return value.replaceAll("/", "&").replaceAll(" ", "_")
}

function FromVariableName(value: string) {
  return value.replaceAll("&", "/").replaceAll("_", " ")
}
