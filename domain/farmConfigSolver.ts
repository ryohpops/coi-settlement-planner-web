import { HighsLinearSolutionColumn } from "highs"
import {
  ALL_ITEMS,
  Item,
  ITEM_BY_NAME,
  MEDICAL_SUPPLIES,
  VIRTUAL_ITEM,
} from "../constants/item"
import { getFarmingRecipesOfFarm, Recipe } from "../constants/recipe"
import { generateCropRotations } from "./cropRotation"
import { solve } from "./highsWorkerManager"

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
 * Calculates and registers the demand for each food item based on population and dietary choices.
 * The demand is distributed among the selected food items and their categories.
 * @param context The solver context to update with food demands.
 * @param population The total population to feed.
 * @param foodsInUse A list of food items that are part of the population's diet.
 * @param foodConsumptionChange A percentage change in food consumption.
 */
function registerFoodDemands(
  context: SolverContext,
  population: number,
  foodsInUse: string[],
  foodConsumptionChange: number
) {
  const foods = foodsInUse.map((foodName) => ITEM_BY_NAME[foodName])
  const categoriesInUse = new Set(foods.map((food) => food.foodCategory))

  foods.forEach((food) => {
    getMapItem(context.itemStatus, food.name).outs.set(
      VIRTUAL_ITEM.Demand,
      (population *
        (1 + foodConsumptionChange) *
        (food.settlementDemand / 1000)) /
        (categoriesInUse.size *
          foods.filter((food2) => food2.foodCategory === food.foodCategory)
            .length)
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
function registerMedicalSuppliesDemand(
  context: SolverContext,
  population: number,
  medicalSuppliesInUse: string,
  diseaseProportion: number
) {
  if (medicalSuppliesInUse !== MEDICAL_SUPPLIES.None) {
    getMapItem(context.itemStatus, medicalSuppliesInUse).outs.set(
      VIRTUAL_ITEM.Demand,
      (population / 1000) * 5.4 * (1 + diseaseProportion / 2)
    )
  }
}

function getMapItem<T>(map: Map<string, T>, key: string): T {
  if (map.has(key)) {
    return map.get(key)!
  } else {
    throw new Error(
      `Key ${key} does not exist. Item data and/or recipe data might be broken.`
    )
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

export async function solveFarmConfig(
  population: number,
  foodsInUse: Item[],
  foodConsumptionChange: number,
  medicalSuppliesInUse: string,
  diseaseProportion: number,
  recipesInUse: Recipe[],
  farmVariant: string,
  fertilityTarget: number
): Promise<FarmConfigSolution> {
  const context: SolverContext = {
    itemStatus: new Map(),
    recipeStatus: new Map(),
  }
  ALL_ITEMS.forEach((item) =>
    context.itemStatus.set(item.name, {
      itemSpec: item,
      ins: new Map(),
      outs: new Map(),
    })
  )
  const numberFormatter = new Intl.NumberFormat("en-US", {
    useGrouping: false,
    signDisplay: "always",
  })

  registerFoodDemands(
    context,
    population,
    foodsInUse.map((food) => food.name),
    foodConsumptionChange
  )
  registerMedicalSuppliesDemand(
    context,
    population,
    medicalSuppliesInUse,
    diseaseProportion
  )

  //TODO
  context.itemStatus.get("Animal Feed")!.outs.set(VIRTUAL_ITEM.Demand, 0.01)
  context.itemStatus.get("Meat Trimmings")!.outs.set(VIRTUAL_ITEM.Demand, 0.01)
  context.itemStatus.get("Diesel")!.outs.set(VIRTUAL_ITEM.Demand, 0.01)
  context.itemStatus.get("Ethanol")!.outs.set(VIRTUAL_ITEM.Demand, 0.01)

  const cropRotations = generateCropRotations(
    getFarmingRecipesOfFarm(farmVariant),
    fertilityTarget
  )
  const allRecipes = [...recipesInUse, ...cropRotations.values()]

  const subjects: Record<string, [number, string][]> = {}
  allRecipes.forEach((recipe) => {
    context.recipeStatus.set(recipe.name, { recipeSpec: recipe, times: 0 })
    recipe.products.forEach((amount, productName) => {
      if (!(productName in subjects)) {
        subjects[productName] = []
      }
      subjects[productName].push([
        (amount / recipe.cycleTime) * TIME_SCALE,
        recipe.name,
      ])
    })
    recipe.ingredients.forEach((amount, ingredientName) => {
      if (!(ingredientName in subjects)) {
        subjects[ingredientName] = []
      }
      subjects[ingredientName].push([
        -(amount / recipe.cycleTime) * TIME_SCALE,
        recipe.name,
      ])
    })
  })

  let ORProblem = "Minimize\n"
  ORProblem += " FarmCount:"
  cropRotations.forEach((cropRotation, cropRotationName) => {
    ORProblem += ` + ${ToVariableName(cropRotationName)}`
  })
  ORProblem += "\nSubject To\n"
  Object.entries(subjects).forEach(([itemName, terms]) => {
    const termString = terms
      .map(
        ([coefficient, recipeName]) =>
          `${numberFormatter.format(coefficient)} ${ToVariableName(recipeName)}`
      )
      .join(" ")
    const minimum =
      context.itemStatus.get(itemName)?.outs.get(VIRTUAL_ITEM.Demand) ?? 0
    const minimumString = minimum
      ? `>= ${numberFormatter.format(minimum)}`
      : "= 0"
    ORProblem += ` ${ToVariableName(
      itemName
    )}: ${termString} ${minimumString}\n`
  })
  ORProblem += "General\n"
  ORProblem += ` ${[
    ...cropRotations.keys().map((name) => ToVariableName(name)),
  ].join(" ")}\n`
  ORProblem += "End"
  console.debug("Problem:", ORProblem)

  const solution = await solve(ORProblem)
  console.debug("Solution status:", solution.Status)
  if (solution.Status != "Optimal") {
    return {
      feasible: false,
      itemStatus: new Map(),
      recipeStatus: new Map(),
    }
  }

  Object.values(solution.Columns)
    .filter(
      (solutionColumn: HighsLinearSolutionColumn) => solutionColumn.Primal > 0
    )
    .forEach((solutionColumn: HighsLinearSolutionColumn) => {
      const recipe = getMapItem(
        context.recipeStatus,
        FromVariableName(solutionColumn.Name)
      )
      recipe.times = solutionColumn.Primal
      recipe.recipeSpec.products.forEach((amount, itemName) => {
        setOrSumItem(
          getMapItem(context.itemStatus, itemName).ins,
          recipe.recipeSpec.name,
          ((amount * solutionColumn.Primal) / recipe.recipeSpec.cycleTime) *
            TIME_SCALE
        )
      })
      recipe.recipeSpec.ingredients.forEach((amount, itemName) => {
        const item = getMapItem(context.itemStatus, itemName)
        const normalizedDemand =
          ((amount * solutionColumn.Primal) / recipe.recipeSpec.cycleTime) *
          TIME_SCALE
        setOrSumItem(item.outs, recipe.recipeSpec.name, normalizedDemand)
      })
    })

  const activeItemStatus = new Map(
    Array.from(context.itemStatus).filter(
      ([itemName, item]) => item.ins.size + item.outs.size > 0
    )
  )
  const activeRecipeStatus = new Map(
    Array.from(context.recipeStatus).filter(
      ([recipeName, recipe]) => recipe.times > 0
    )
  )
  return {
    feasible: true,
    itemStatus: activeItemStatus,
    recipeStatus: activeRecipeStatus,
  }
}
