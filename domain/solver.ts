import Solver, { CoefficientsOfVariable, Constraints, Ints, Variables } from "javascript-lp-solver"
import { generateCropRotations } from "./cropRotation"
import { allFoods, allItems, Food, Item } from "./item"
import { farmingRecipes, FarmVariant, productRecipes, Recipe } from "./recipe"

const TIME_SCALE = 60
const FARM_COUNT = "Farm Count"

export interface ItemResult {
  item: Item
  ins: Map<string, number>
  outs: Map<string, number>
}
export interface RecipeResult {
  recipe: Recipe
  times: number
}
export interface Result {
  itemResults: Map<string, ItemResult>
  recipeResults: Map<string, RecipeResult>
}

export function solve(
  population: number, demandAdjustment: number,
  foodsInUse: string[], farmVariant: FarmVariant, fertilityTarget: number
): Result | undefined {
  const crops = new Set<string>()
  const items = new Set<string>()

  const variables: Variables = {}
  const cropRotations = generateCropRotations(farmingRecipes[farmVariant], fertilityTarget)
  const relatedCrops = addVariables(cropRotations, variables)
  relatedCrops.forEach((crop) => crops.add(crop))
  const relatedItems = addVariables(productRecipes, variables)
  relatedItems.forEach((item) => items.add(item))
  cropRotations.forEach((value, name) => variables[name][FARM_COUNT] = 1)

  const constraints: Constraints = {}
  const demands = calculateFoodDemands(population, demandAdjustment, foodsInUse)
  crops.forEach((crop) => constraints[crop] = { min: demands.get(crop) ?? 0 })
  items.forEach((item) => constraints[item] = { min: demands.get(item) ?? 0 })

  const ints: Ints = {}
  cropRotations.forEach((cropRotation) => ints[cropRotation.name] = 1)

  const solverResult = Solver.Solve({
    optimize: FARM_COUNT,
    opType: "min",
    constraints: constraints,
    variables: variables,
    ints: ints
  })
  if (solverResult.feasible === false) {
    return undefined
  }

  const recipeResults = new Map<string, RecipeResult>()
  cropRotations.forEach((recipe, name) => recipeResults.set(name, { recipe: recipe, times: solverResult[name] ?? 0 }))
  productRecipes.forEach((recipe, name) => recipeResults.set(name, { recipe: recipe, times: solverResult[name] ?? 0 }))
  const usedRecipeResults = new Map<string, RecipeResult>(
    Array.from(recipeResults).filter(([name, recipe]) => recipe.times > 0)
  )

  const itemResults = new Map<string, ItemResult>()
  usedRecipeResults.forEach((recipeResult, recipeName) => {
    const recipe = recipeResult.recipe
    recipe.products.forEach((amount, itemName) => {
      if (!itemResults.has(itemName)) {
        itemResults.set(itemName, { item: getItem(itemName), ins: new Map(), outs: new Map() })
      }
      itemResults.get(itemName)!.ins.set(recipeName, amount * (recipeResults.get(recipeName)?.times ?? 0) / recipe.production_time * TIME_SCALE)
    })
    recipe.ingredients.forEach((amount, itemName) => {
      if (!itemResults.has(itemName)) {
        itemResults.set(itemName, { item: getItem(itemName), ins: new Map(), outs: new Map() })
      }
      itemResults.get(itemName)!.outs.set(recipeName, amount * (recipeResults.get(recipeName)?.times ?? 0) / recipe.production_time * TIME_SCALE)
    })
  })

  return {
    itemResults: itemResults, recipeResults: usedRecipeResults
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

function addVariables(recipes: Map<string, Recipe>, variables: Variables): Set<string> {
  const items = new Set<string>()
  recipes.forEach((recipe) => {
    const coefficients: CoefficientsOfVariable = {}
    recipe.products.forEach((amount, product) => {
      coefficients[product] = amount / recipe.production_time * TIME_SCALE
      items.add(product)
    })
    recipe.ingredients.forEach((amount, ingredient) => {
      coefficients[ingredient] = -amount / recipe.production_time * TIME_SCALE
      items.add(ingredient)
    })
    variables[recipe.name] = coefficients
  })
  return items
}

function getItem(name: string): Item {
  const item = allItems.get(name)
  if (item) {
    return item
  } else {
    throw new Error(`Item ${name} does not exists.`)
  }
}
