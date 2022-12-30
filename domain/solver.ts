import { generateCropRotations } from "./cropRotation";
import { allFoods, allItems, Food, Item } from "./item";
import { farmingRecipes, FarmVariant, productRecipes, Recipe } from "./recipe";
import * as SolverAPI from "./solverApi";

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
  const cropsWithDemands = new Map<string, ItemResult>(
    Array.from(itemResults)
      .filter(([itemName, item]) => item.item.isCrop && item.transientDemand > 0)
  )
  const cropRecipes = Array.from(cropsWithDemands)
    .map(([cropName, crop]) => getItem(farmingRecipes[farmVariant], crop.item.name))

  // Resolve crop demands into crop rotation counts
  const cropRotations = generateCropRotations(cropRecipes, fertilityTarget) //TODO: is this needed to be a Map?
  const cropRotationResults = new Map<string, RecipeResult>(
    Array.from(cropRotations.values())
      .sort((a, b) => a.equilibrium - b.equilibrium)
      .map((cropRotation) => [cropRotation.name, { recipe: cropRotation, times: 0 }])
  )

  const apiRecipes: SolverAPI.Recipe[] = []
  cropRotations.forEach((cropRotation, cropRotationName) => {
    const apiRecipe: SolverAPI.Recipe = { name: cropRotationName, products: {}, ingredients: {} }
    cropRotation.products.forEach((amount, productName) => {
      apiRecipe.products[productName] = amount / cropRotation.production_time * TIME_SCALE
    })
    cropRotation.ingredients.forEach((amount, ingredientName) => {
      apiRecipe.ingredients[ingredientName] = amount / cropRotation.production_time * TIME_SCALE
    })
    apiRecipes.push(apiRecipe)
  })

  const apiDemands: { [name: string]: number } = {}
  cropsWithDemands.forEach((crop, cropName) => apiDemands[cropName] = crop.transientDemand)

  const solveInput: SolverAPI.SolveInput = {
    recipes: apiRecipes, demands: apiDemands
  }

  const apiResponse = await fetch(SolverAPI.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(solveInput)
  })
  let apiResponseBody: SolverAPI.SolveResult
  if (apiResponse.ok) {
    apiResponseBody = await apiResponse.json()
    if (!apiResponseBody.isSolved) {
      return {
        feasible: false, itemResults: new Map(), recipeResults: new Map()
      }
    }
  } else {
    throw new Error("Failed to call Solver API.");
  }
  const result = apiResponseBody.result!

  cropRotationResults.forEach((cropRotation, cropRotationName) => {
    if (cropRotationName in result && result[cropRotationName] > 0) {
      cropRotation.times = result[cropRotationName]
      recipeResults.set(cropRotationName, cropRotation)

      cropRotation.recipe.products.forEach((amount, cropName) => {
        setOrSumItem(
          getItem(itemResults, cropName).ins,
          cropRotationName,
          amount * cropRotation.times / cropRotation.recipe.production_time * TIME_SCALE
        )
      })
    }
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
