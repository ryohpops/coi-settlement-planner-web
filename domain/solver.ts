import { generateCropRotations } from "./cropRotation"
import { allFoods, allItems, Food, Item, VIRTUAL_ITEM } from "./item"
import { farmingRecipes, FarmVariant, productRecipes, Recipe } from "./recipe"
import * as SolverAPI from "./solverApi"

const TIME_SCALE = 60

export interface ItemResult {
  item: Item
  ins: Map<string, number>
  outs: Map<string, number>
  transientDemand: number
}
export interface RecipeResult {
  recipe: Recipe
  times: number
}
export interface Result {
  feasible: boolean
  itemResults: Map<string, ItemResult>
  recipeResults: Map<string, RecipeResult>
}

export async function solve(
  population: number, demandAdjustment: number,
  foodsInUse: string[], farmVariant: FarmVariant, fertilityTarget: number
): Promise<Result> {
  const itemResults = new Map<string, ItemResult>()
  allItems.forEach((item, itemName) =>
    itemResults.set(itemName, { item: item, ins: new Map(), outs: new Map(), transientDemand: 0 })
  )
  const recipeResults = new Map<string, RecipeResult>()

  const foodDemands = calculateFoodDemands(population, demandAdjustment, foodsInUse)
  foodDemands.forEach((demand, foodName) => {
    const food = getMapItem(itemResults, foodName)
    food.transientDemand = demand
    food.outs.set(VIRTUAL_ITEM.Demand, demand)
  })

  const productSolverRecipes: SolverAPI.Recipe[] = []
  productRecipes.forEach((recipe, recipeName) => {
    const apiRecipe: SolverAPI.Recipe = { name: recipeName, products: {}, ingredients: {} }
    recipe.products.forEach((amount, productName) => {
      apiRecipe.products[productName] = amount / recipe.production_time * TIME_SCALE
    })
    recipe.ingredients.forEach((amount, ingredientName) => {
      apiRecipe.ingredients[ingredientName] = amount / recipe.production_time * TIME_SCALE
    })
    productSolverRecipes.push(apiRecipe)
  })

  const productSolverDemands: { [name: string]: number } = {}
  foodDemands.forEach((amount, foodName) => productSolverDemands[foodName] = amount)

  const productSolverCrops = Array.from(allItems.values())
    .filter((item) => item.isCrop)
    .map((item) => item.name)

  const productSolverAnswer = await SolverAPI.callProductSolver(productSolverRecipes, productSolverDemands, productSolverCrops)
  if (!productSolverAnswer.isSolved) {
    return {
      feasible: false, itemResults: new Map(), recipeResults: new Map()
    }
  }
  Object.entries(productSolverAnswer.result!).forEach(([recipeName, times]) => {
    const recipe = getMapItem(productRecipes, recipeName)
    recipeResults.set(recipeName, { recipe: recipe, times: times })

    recipe.products.forEach((amount, itemName) => {
      setOrSumItem(
        getMapItem(itemResults, itemName).ins,
        recipeName,
        amount * times / recipe.production_time * TIME_SCALE
      )
    })
    recipe.ingredients.forEach((amount, itemName) => {
      const item = getMapItem(itemResults, itemName)
      const normalizedDemand = amount * times / recipe.production_time * TIME_SCALE
      setOrSumItem(
        item.outs,
        recipeName,
        normalizedDemand
      )
      item.transientDemand += normalizedDemand
    })
  })

  const cropWithDemands = Array.from(itemResults.values())
    .filter((item) => item.item.isCrop && item.transientDemand > 0)
  const cropRecipes = cropWithDemands
    .map((item) => Array.from(farmingRecipes[farmVariant].values()).find((recipe) => recipe.products.has(item.item.name))!)
  const cropRotations = generateCropRotations(cropRecipes, fertilityTarget) //TODO: is this needed to be a Map?
  cropRotations.forEach((cropRotation, cropRotationName) =>
    recipeResults.set(cropRotationName, { recipe: cropRotation, times: 0 })
  )

  const farmSolverRecipes: SolverAPI.Recipe[] = []
  cropRotations.forEach((cropRotation, cropRotationName) => {
    const apiRecipe: SolverAPI.Recipe = { name: cropRotationName, products: {}, ingredients: {} }
    cropRotation.products.forEach((amount, productName) => {
      apiRecipe.products[productName] = amount / cropRotation.production_time * TIME_SCALE
    })
    farmSolverRecipes.push(apiRecipe)
  })

  const farmSolverDemands: { [name: string]: number } = {}
  cropWithDemands.forEach((item) => farmSolverDemands[item.item.name] = item.transientDemand)

  const farmSolverAnswer = await SolverAPI.callFarmSolver(farmSolverRecipes, farmSolverDemands)
  if (!farmSolverAnswer.isSolved) {
    return {
      feasible: false, itemResults: new Map(), recipeResults: new Map()
    }
  }
  Object.entries(farmSolverAnswer.result!).forEach(([cropRotationName, times]) => {
    const recipe = getMapItem(cropRotations, cropRotationName)
    recipeResults.set(cropRotationName, { recipe: recipe, times: times })

    recipe.products.forEach((amount, itemName) => {
      setOrSumItem(
        getMapItem(itemResults, itemName).ins,
        cropRotationName,
        amount * times / recipe.production_time * TIME_SCALE
      )
    })
  })

  return {
    feasible: true,
    itemResults: new Map(Array.from(itemResults).filter(([itemName, item]) => item.ins.size + item.outs.size > 0)),
    recipeResults: new Map(Array.from(recipeResults).filter(([recipeName, recipe]) => recipe.times > 0))
  }
}

function calculateFoodDemands(population: number, adjustment: number, foodsInUse: string[]): Map<string, number> {
  const demands = new Map<string, number>()
  const foods = foodsInUse.map((foodName) => allFoods.get(foodName)).filter(Boolean) as Food[]

  const categoriesInUse = new Set<string>(foods.map((food) => food.category))
  foods.forEach((food) => demands.set(
    food.name,
    population
    / food.feeds
    * (100 + adjustment) / 100
    / categoriesInUse.size
    / foods.filter((food2) => food2.category === food.category).length
  ))

  return demands
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
