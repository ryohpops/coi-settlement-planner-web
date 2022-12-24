import Solver, { CoefficientsOfVariable, Constraints, Ints, Options, Variables } from "javascript-lp-solver"
import { generateCropRotations } from "./cropRotation"
import { allFoods, allItems, Food, Item } from "./item"
import { farmingRecipes, FarmVariant, productRecipes, Recipe } from "./recipe"

const TIME_SCALE = 60
const FARM_COUNT = "Farm Count"

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
  requestId: string
  feasible: boolean
  itemResults: Map<string, ItemResult>
  recipeResults: Map<string, RecipeResult>
}

const solverOptions: Options = {
  timeout: 5000,
  tolerance: 0.05
}

export function solve(
  requestId: string, population: number, demandAdjustment: number,
  foodsInUse: string[], farmVariant: FarmVariant, fertilityTarget: number
): Result {
  const itemResults = new Map<string, ItemResult>()
  allItems.forEach((item, itemName) =>
    itemResults.set(itemName, { item: item, ins: new Map(), outs: new Map(), transientDemand: 0 })
  )

  const recipeResults = new Map<string, RecipeResult>()
  productRecipes.forEach((recipe, recipeName) =>
    recipeResults.set(recipeName, { recipe: recipe, times: 0 })
  )
  farmingRecipes[farmVariant].forEach((recipe, recipeName) =>
    recipeResults.set(recipeName, { recipe: recipe, times: 0 })
  )

  const foodDemands = calculateFoodDemands(population, demandAdjustment, foodsInUse)
  foodDemands.forEach((demand, foodName) =>
    getItem(itemResults, foodName).transientDemand = demand
  )

  // Resolve food demands into intermediate item demands
  Array.from(itemResults.values())
    .filter((item) => item.item.isFood && !item.item.isCrop && item.transientDemand > 0)
    .forEach((food) => resolveItem(food, itemResults, recipeResults))

  // Resolve intermediate-item demands into crop demands
  const intermediateItems = Array.from(itemResults.values())
    .filter((item) => !item.item.isFood && !item.item.isCrop)
  let resolved = Number.MAX_SAFE_INTEGER
  while (resolved > 0) {
    resolved = 0
    intermediateItems.filter((item) => item.transientDemand > 0)
      .forEach((item) => {
        resolveItem(item, itemResults, recipeResults)
        resolved++
      })
  }

  // Get crop with demands
  const cropsWithDemands = Array.from(itemResults.values())
    .filter((item) => item.item.isCrop && item.transientDemand > 0)
  const cropRecipes = cropsWithDemands.map((crop) => getItem(farmingRecipes[farmVariant], crop.item.name))

  // Resolve crop demands into crop rotation counts
  const variables: Variables = {}
  const cropRotations = generateCropRotations(cropRecipes, fertilityTarget)
  cropRotations.forEach((cropRotation, cropRotationName) => {
    addVariables(cropRotation, variables)
    variables[cropRotationName][FARM_COUNT] = 1
  })

  const constraints: Constraints = {}
  cropsWithDemands.forEach((crop) => constraints[crop.item.name] = { min: crop.transientDemand })

  const ints: Ints = {}
  cropRotations.forEach((cropRotation, cropRotationName) => ints[cropRotationName] = 1)

  const solverResult = Solver.Solve({
    optimize: FARM_COUNT,
    opType: "min",
    constraints: constraints,
    variables: variables,
    ints: ints,
    options: solverOptions
  })
  if (solverResult.feasible === false) {
    return {
      requestId: requestId, feasible: false,
      itemResults: new Map(), recipeResults: new Map()
    }
  }

  cropRotations.forEach((cropRotation, cropRotationName) => {
    const count = solverResult[cropRotationName] ?? 0
    if (count > 0) {
      recipeResults.set(cropRotationName, { recipe: cropRotation, times: count })
      cropRotation.products.forEach((amount, cropName) => {
        setOrSumItem(
          getItem(itemResults, cropName).ins,
          cropRotationName,
          amount * count / cropRotation.production_time * TIME_SCALE
        )
      })
    }
  })

  return {
    requestId: requestId, feasible: true,
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

function resolveItem(item: ItemResult, itemResults: Map<string, ItemResult>, recipeResults: Map<string, RecipeResult>) {
  const producer = getItem(recipeResults, item.item.name)
  const cycle = item.transientDemand / getItem(producer.recipe.products, producer.recipe.name)
  producer.recipe.products.forEach((amount, itemName) => {
    const product = getItem(itemResults, itemName)
    setOrSumItem(product.ins, itemName, amount * cycle)
    product.transientDemand -= amount * cycle
  })
  producer.recipe.ingredients.forEach((amount, itemName) => {
    const ingredient = getItem(itemResults, itemName)
    setOrSumItem(ingredient.outs, itemName, amount * cycle)
    ingredient.transientDemand += amount * cycle
  })
  producer.times += cycle
}

function addVariables(recipe: Recipe, variables: Variables) {
  const coefficients: CoefficientsOfVariable = {}
  recipe.products.forEach((amount, product) => {
    coefficients[product] = amount / recipe.production_time * TIME_SCALE
  })
  recipe.ingredients.forEach((amount, ingredient) => {
    coefficients[ingredient] = -amount / recipe.production_time * TIME_SCALE
  })
  variables[recipe.name] = coefficients
}

function getItem<T>(map: Map<string, T>, key: string): T {
  if (map.has(key)) {
    return map.get(key)!
  } else {
    throw new Error(`Key ${key} does not exists. Item data and/or recipe data might be broken.`)
  }
}

function setOrSumItem(map: Map<string, number>, key: string, value: number) {
  if (map.has(key)) {
    map.set(key, map.get(key)! + value)
  } else {
    map.set(key, value)
  }
}
