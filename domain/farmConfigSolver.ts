import { HighsLinearSolutionColumn, HighsMixedIntegerLinearSolutionColumn } from "highs"
import { generateCropRotations } from "./cropRotation"
import { solve } from "./highsWorkerManager"
import { Item, MEDICAL_SUPPLIES, VIRTUAL_ITEM, allFoods, allItems } from "./item"
import { FarmVariant, Recipe, farmingRecipes, productRecipesByPrimaryProduct } from "./recipe"

const TIME_SCALE = 60

export interface SolverContext {
  itemStatus: Map<string, ItemStatus>
  recipeStatus: Map<string, RecipeStatus>
}
export interface ItemStatus {
  itemSpec: Item
  ins: Map<string, number>
  outs: Map<string, number>
}
export interface RecipeStatus {
  recipeSpec: Recipe
  times: number
}

export interface FarmConfigSolution {
  feasible: boolean
  itemStatus: Map<string, ItemStatus>
  recipeStatus: Map<string, RecipeStatus>
}

/**
 * Solves the entire production chain to meet the population's demands for food and medical supplies.
 * This function first calculates the required products and then solves for the farm configuration needed to grow the necessary crops.
 * @param population The total population to support.
 * @param foodsInUse A list of food items that are part of the population's diet.
 * @param foodConsumptionChange A percentage change in food consumption.
 * @param medicalSuppliesInUse The type of medical supplies in use.
 * @param diseaseProportion The proportion of the population affected by disease, influencing medical supply demand.
 * @param recipesInUse A list of specific recipes to be used for production.
 * @param farmVariant The type of farm to be used.
 * @param fertilityTarget The desired soil fertility to be maintained on farms.
 * @returns A promise that resolves to a `FarmConfigSolution` object, indicating if a feasible solution was found, and detailing the required items and recipes.
 */
export async function solveFarmConfig(
  population: number,
  foodsInUse: string[], foodConsumptionChange: number,
  medicalSuppliesInUse: string, diseaseProportion: number,
  recipesInUse: string[],
  farmVariant: FarmVariant, fertilityTarget: number
): Promise<FarmConfigSolution> {
  const context: SolverContext = {
    itemStatus: new Map(),
    recipeStatus: new Map()
  }
  allItems.forEach((item, itemName) =>
    context.itemStatus.set(itemName, { itemSpec: item, ins: new Map(), outs: new Map() })
  )

  const isProductSolved = await solveProduct(
    context, population, foodsInUse, foodConsumptionChange,
    medicalSuppliesInUse, diseaseProportion, recipesInUse
  )
  if (!isProductSolved) {
    return {
      feasible: false, itemStatus: new Map(), recipeStatus: new Map()
    }
  }

  const isFarmSolved = await solveFarm(context, farmVariant, fertilityTarget)
  if (!isFarmSolved) {
    return {
      feasible: false, itemStatus: new Map(), recipeStatus: new Map()
    }
  }

  const activeItemStatus = new Map(
    Array.from(context.itemStatus).filter(([itemName, item]) => item.ins.size + item.outs.size > 0)
  )
  const activeRecipeStatus = new Map(
    Array.from(context.recipeStatus).filter(([recipeName, recipe]) => recipe.times > 0)
  )
  return {
    feasible: true,
    itemStatus: activeItemStatus,
    recipeStatus: activeRecipeStatus
  }
}

/**
 * Solves for the required production of all non-crop items based on population demands.
 * It constructs and solves a linear programming problem to determine the necessary recipe execution counts.
 * @param context The solver context, which will be populated with the results.
 * @param population The total population to support.
 * @param foodsInUse A list of food items that are part of the population's diet.
 * @param foodConsumptionChange A percentage change in food consumption.
 * @param medicalSuppliesInUse The type of medical supplies in use.
 * @param diseaseProportion The proportion of the population affected by disease.
 * @param recipesInUse A list of specific recipes to be used for production.
 * @returns A promise that resolves to `true` if an optimal solution is found, otherwise `false`.
 */
async function solveProduct(
  context: SolverContext,
  population: number, foodsInUse: string[], foodConsumptionChange: number,
  medicalSuppliesInUse: string, diseaseProportion: number,
  recipesInUse: string[]
): Promise<boolean> {
  registerFoodDemands(context, population, foodsInUse, foodConsumptionChange)
  registerMedicalSuppliesDemand(context, population, medicalSuppliesInUse, diseaseProportion)

  const subjects = new Map<string, string>()
  productRecipesByPrimaryProduct.forEach((recipes, primaryProductName) => {
    let recipe: Recipe
    if (recipes.length === 1) {
      recipe = recipes[0]
    } else {
      recipe = recipes.filter((recipe) => recipesInUse.includes(recipe.name))[0]
    }

    context.recipeStatus.set(recipe.name, { recipeSpec: recipe, times: 0 })
    recipe.products.forEach((amount, productName) => {
      setOrConcatItem(subjects, ToVariableName(productName), ` + ${amount / recipe.production_time * TIME_SCALE} ${ToVariableName(recipe.name)}`)
    })
    recipe.ingredients.forEach((amount, ingredientName) => {
      setOrConcatItem(subjects, ToVariableName(ingredientName), ` - ${amount / recipe.production_time * TIME_SCALE} ${ToVariableName(recipe.name)}`)
    })
  })

  context.itemStatus.forEach((item, itemName) => {
    if (!item.itemSpec.isCrop) {
      if (item.outs.has(VIRTUAL_ITEM.Demand)) {
        setOrConcatItem(subjects, ToVariableName(itemName), ` >= ${getMapItem(item.outs, VIRTUAL_ITEM.Demand)}`)
      } else {
        setOrConcatItem(subjects, ToVariableName(itemName), ` >= 0`)
      }
    }
  })

  let productProblem = "Minimize\n"
  productProblem += " Factories:"
  context.recipeStatus.forEach((recipe, recipeName) => {
    productProblem += ` + ${ToVariableName(recipeName)}`
  })
  productProblem += "\nSubject To\n"
  subjects.forEach((subject, subjectName) => {
    if (subject.includes(">=")) {
      productProblem += ` ${subjectName}:${subject}\n`
    }
  })
  productProblem += "End"

  const solution = await solve(productProblem)
  if (solution.Status != "Optimal") {
    return false
  }

  Object.values(solution.Columns)
    .filter((solutionColumn: HighsLinearSolutionColumn) => solutionColumn.Primal > 0)
    .forEach((solutionColumn: HighsLinearSolutionColumn) => {
      const recipe = getMapItem(context.recipeStatus, FromVariableName(solutionColumn.Name))
      recipe.times = solutionColumn.Primal
      recipe.recipeSpec.products.forEach((amount, itemName) => {
        setOrSumItem(
          getMapItem(context.itemStatus, itemName).ins,
          recipe.recipeSpec.name,
          amount * solutionColumn.Primal / recipe.recipeSpec.production_time * TIME_SCALE
        )
      })
      recipe.recipeSpec.ingredients.forEach((amount, itemName) => {
        const item = getMapItem(context.itemStatus, itemName)
        const normalizedDemand = amount * solutionColumn.Primal / recipe.recipeSpec.production_time * TIME_SCALE
        setOrSumItem(item.outs, recipe.recipeSpec.name, normalizedDemand)
      })
    })
  return true
}

/**
 * Calculates and registers the demand for each food item based on population and dietary choices.
 * The demand is distributed among the selected food items and their categories.
 * @param context The solver context to update with food demands.
 * @param population The total population to feed.
 * @param foodsInUse A list of food items that are part of the population's diet.
 * @param foodConsumptionChange A percentage change in food consumption.
 */
function registerFoodDemands(context: SolverContext, population: number, foodsInUse: string[], foodConsumptionChange: number) {
  const foods = foodsInUse.map((foodName) => getMapItem(allFoods, foodName))
  const categoriesInUse = new Set(foods.map((food) => food.category))

  foods.forEach((food) => {
    getMapItem(context.itemStatus, food.name).outs.set(
      VIRTUAL_ITEM.Demand,
      population
      * (1 + foodConsumptionChange)
      / food.feeds
      / categoriesInUse.size
      / foods.filter((food2) => food2.category === food.category).length
    )
  })
}

/**
 * Calculates and registers the demand for medical supplies based on population and disease prevalence.
 * @param context The solver context to update with medical supply demands.
 * @param population The total population.
 * @param medicalSuppliesInUse The type of medical supply being used.
 * @param diseaseProportion The proportion of the population affected by disease.
 */
function registerMedicalSuppliesDemand(context: SolverContext, population: number, medicalSuppliesInUse: string, diseaseProportion: number) {
  if (medicalSuppliesInUse !== MEDICAL_SUPPLIES.None) {
    getMapItem(context.itemStatus, medicalSuppliesInUse).outs.set(
      VIRTUAL_ITEM.Demand,
      population / 1000 * 5.4 * (1 + diseaseProportion / 2)
    )
  }
}

/**
 * Solves for the required number of farms and their crop rotations to meet crop demands.
 * This function uses mixed-integer linear programming to find the optimal number of farms.
 * @param context The solver context, containing crop demands from the product solver.
 * @param farmVariant The type of farm to be used (e.g., Farm, Farm (Hydroponic)).
 * @param fertilityTarget The desired soil fertility to be maintained on farms.
 * @returns A promise that resolves to `true` if an optimal solution is found, otherwise `false`.
 */
async function solveFarm(context: SolverContext, farmVariant: FarmVariant, fertilityTarget: number): Promise<boolean> {
  const cropWithDemands = Array.from(context.itemStatus.values())
    .filter((item) => item.itemSpec.isCrop && item.outs.size > 0)
  const farmingRecipesOfVariant = Array.from(farmingRecipes[farmVariant].values())
  const cropRecipes = cropWithDemands
    .map((item) => farmingRecipesOfVariant.find((recipe) => recipe.products.has(item.itemSpec.name))!)
  const cropRotations = generateCropRotations(cropRecipes, fertilityTarget) //TODO: is this needed to be a Map?
  cropRotations.forEach((cropRotation, cropRotationName) =>
    context.recipeStatus.set(cropRotationName, { recipeSpec: cropRotation, times: 0 })
  )

  const subjects = new Map<string, string>()
  cropRotations.forEach((cropRotation, cropRotationName) => {
    cropRotation.products.forEach((amount, productName) => {
      setOrConcatItem(subjects, ToVariableName(productName), ` + ${amount / cropRotation.production_time * TIME_SCALE} ${ToVariableName(cropRotationName)} `)
    })
  })

  cropWithDemands.forEach((crop) => {
    const amount = Array.from(crop.outs.values()).reduce((sum, amount) => sum + amount, 0)
    setOrConcatItem(subjects, ToVariableName(crop.itemSpec.name), ` >= ${amount} `)
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

  const solution = await solve(farmProblem)
  if (solution.Status != "Optimal") {
    return false
  }

  Object.values(solution.Columns).forEach((solutionColumn: HighsMixedIntegerLinearSolutionColumn) => {
    const cropRotationName = FromVariableName(solutionColumn.Name)

    const recipe = getMapItem(cropRotations, cropRotationName)
    context.recipeStatus.set(cropRotationName, { recipeSpec: recipe, times: solutionColumn.Primal })

    recipe.products.forEach((amount, itemName) => {
      setOrSumItem(
        getMapItem(context.itemStatus, itemName).ins,
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
