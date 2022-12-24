import { Recipe } from "./recipe"

const DAY_LENGTH = 2

export function generateCropRotations(cropRecipes: Map<string, Recipe>, fertilityTarget: number): Map<string, Recipe> {
  const recipes = Array.from(cropRecipes.values())
  const cropRotations = new Map<string, Recipe>(
    recipes.flatMap(
      (value1, index) => recipes.slice(index + 1).map((value2) => createCropRotation(fertilityTarget, value1, value2))
    ).map((cropRotation) => [cropRotation.name, cropRotation]))
  return cropRotations
}

function createCropRotation(fertilityTarget: number, ...cropRecipes: Recipe[]): Recipe {
  let equilibrium = 1
  const rotationTime = cropRecipes.reduce((sum, recipe) => sum + recipe.production_time, 0)
  if (cropRecipes.length == 1) {
    const crop = cropRecipes[0]
    equilibrium -= getFertilityUsage(crop) * 1.5 / crop.production_time * DAY_LENGTH * 100
  } else if (cropRecipes.length > 1) {
    const totalFertilityUsage = cropRecipes.reduce((sum, recipe) => sum + getFertilityUsage(recipe) * recipe.production_time / rotationTime, 0)
    equilibrium -= totalFertilityUsage / rotationTime * DAY_LENGTH * 100
  } else {
    throw new Error(`Invalid recipes were given for createCropRotation.`)
  }
  equilibrium = Math.max(equilibrium, fertilityTarget / 100)

  const products = new Map<string, number>()
  cropRecipes.forEach((recipe) => recipe.products.forEach((value, key) => products.set(key, value * equilibrium)))

  return {
    name: cropRecipes.map((recipe) => recipe.name).join("/"),
    production_time: rotationTime,
    products: products,
    ingredients: new Map()
  }
}

function getFertilityUsage(recipe: Recipe): number {
  const fertilityUsage = recipe.ingredients.get("Fertility")
  if (fertilityUsage) {
    return fertilityUsage
  } else {
    throw new Error(`Fertility usage not found for crop ${recipe.name}.`)
  }
}
