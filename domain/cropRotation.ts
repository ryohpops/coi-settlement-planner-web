import { VIRTUAL_ITEM } from "./item"
import { Recipe } from "./recipe"

const DAY_LENGTH = 2

export interface CropRotation extends Recipe {
  equilibrium: number
}

export function generateCropRotations(cropRecipes: Recipe[], fertilityTarget: number): Map<string, CropRotation> {
  const cropRotations = new Map<string, CropRotation>(
    cropRecipes.flatMap(
      (value1, index) => cropRecipes.slice(index + 1).map((value2) => createCropRotation(fertilityTarget, value1, value2))
    ).map((cropRotation) => [cropRotation.name, cropRotation]))
  return cropRotations
}

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

function getFertilityUsage(recipe: Recipe): number {
  const fertilityUsage = recipe.ingredients.get(VIRTUAL_ITEM.Fertility)
  if (fertilityUsage) {
    return fertilityUsage
  } else {
    throw new Error(`Fertility usage not found for crop ${recipe.name}.`)
  }
}
