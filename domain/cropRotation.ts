import { VIRTUAL_ITEM } from "./item"
import { Recipe } from "./recipe"

const DAY_LENGTH = 2

export interface CropRotation extends Recipe {
  equilibrium: number
}

/**
 * Generates crop rotation recipes for all possible pairs of two crops from the given crop recipes,
 * considering the fertility target for the farm.
 * @param cropRecipes An array of base crop recipes to form rotations from.
 * @param fertilityTarget The fertility target for the farm.
 * @returns A map of the generated crop rotation recipes, with recipe names as keys.
 */
export function generateCropRotations(cropRecipes: Recipe[], fertilityTarget: number): Map<string, CropRotation> {
  const cropRotations = new Map<string, CropRotation>(
    cropRecipes.flatMap(
      (value1, index) => cropRecipes.slice(index + 1).map((value2) => createCropRotation(fertilityTarget, value1, value2))
    ).map((cropRotation) => [cropRotation.name, cropRotation]))
  return cropRotations
}

/**
 * Creates a single crop rotation recipe from a given set of crops.
 * It calculates the average equilibrium fertility and the expected output for each crop in the rotation,
 * factoring in the specified fertility target.
 * @param fertilityTarget The fertility target for the farm.
 * @param cropRecipes The sequence of crop recipes to be included in the rotation.
 * @returns A single, combined crop rotation recipe.
 */
function createCropRotation(fertilityTarget: number, ...cropRecipes: Recipe[]): CropRotation {
  let averageEquilibrium = 1
  const rotationTime = cropRecipes.reduce((sum, recipe) => sum + recipe.production_time, 0)
  if (cropRecipes.length === 1) {
    const crop = cropRecipes[0]
    averageEquilibrium -= getFertilityUsage(crop) * 1.5 / crop.production_time * DAY_LENGTH * 100
  } else if (cropRecipes.length > 1) {
    const totalFertilityUsage = cropRecipes.reduce(
      (sum, recipe) => sum + getFertilityUsage(recipe) * recipe.production_time / rotationTime,
      0
    )
    averageEquilibrium -= totalFertilityUsage / rotationTime * DAY_LENGTH * 100
  } else {
    throw new Error(`Invalid recipes were given for createCropRotation.`)
  }

  const products = new Map<string, number>()
  cropRecipes.forEach((recipe) => {
    const [cropName, cropAmount] = getCropNameAndAmount(recipe)
    const fertilityUsage = getFertilityUsage(recipe)

    let equilibrium = averageEquilibrium
    for (let day = 0; day < recipe.production_time / DAY_LENGTH; day++) {
      equilibrium = equilibrium
        - fertilityUsage / recipe.production_time * DAY_LENGTH
        + (1 - equilibrium) * 0.01
    }
    products.set(cropName, cropAmount * Math.max(equilibrium, fertilityTarget / 100))
  })

  return {
    name: "Produce " + cropRecipes.map((recipe) => recipe.primaryProduct).join("/"),
    production_time: rotationTime,
    products: products,
    ingredients: new Map(),
    equilibrium: averageEquilibrium
  }
}

/**
 * Extracts the primary product's name and amount from a crop recipe.
 * @param recipe The crop recipe to process.
 * @returns A tuple containing the crop name and the production amount.
 * @throws An error if the recipe lacks a primary product or its production amount.
 */
function getCropNameAndAmount(recipe: Recipe): [string, number] {
  const cropName = recipe.primaryProduct
  if (!cropName) {
    throw new Error(`Crop recipe ${recipe.name} does not have primary product.`)
  }
  const cropAmount = recipe.products.get(cropName)
  if (!cropAmount) {
    throw new Error(`Cannot get crop production from recipe ${recipe.name}.`)
  }

  return [cropName, cropAmount]
}

/**
 * Retrieves the fertility consumption value from a crop recipe's ingredients.
 * @param recipe The crop recipe to examine.
 * @returns The amount of fertility the crop consumes.
 * @throws An error if the recipe does not list fertility as an ingredient.
 */
function getFertilityUsage(recipe: Recipe): number {
  const fertilityUsage = recipe.ingredients.get(VIRTUAL_ITEM.Fertility)
  if (fertilityUsage) {
    return fertilityUsage
  } else {
    throw new Error(`Fertility usage not found for crop ${recipe.name}.`)
  }
}
