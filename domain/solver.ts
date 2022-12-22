import Solver, { Constraints, CoefficientsOfVariable, Variables, Ints } from "javascript-lp-solver";
import { Recipe } from "./recipe"

const FARM_COUNT = "Farm Count"

interface ItemResult {
  name: string
  ins: Map<string, number>
  outs: Map<string, number>
}
// type RecipeResult = Map<string, number>

export function solve(recipes: Map<string, Recipe>, cropRotations: Map<string, Recipe>, demands: Map<string, number>) {
  const items = new Set<string>()
  const crops = new Set<string>()

  const variables: Variables = {}
  const relatedItems = addVariables(recipes, variables)
  relatedItems.forEach((item) => items.add(item))
  const relatedCrops = addVariables(cropRotations, variables)
  relatedCrops.forEach((crop) => crops.add(crop))
  Array.from(cropRotations.keys())
    .forEach((name) => variables[name][FARM_COUNT] = 1)

  const constraints: Constraints = {}
  items.forEach((item) => constraints[item] = { min: demands.get(item) ?? 0 })
  crops.forEach((crop) => constraints[crop] = { min: demands.get(crop) ?? 0 })

  const ints: Ints = {}
  Array.from(cropRotations.values())
    .forEach((cropRotation) => ints[cropRotation.name] = 1)

  const result = Solver.Solve({
    optimize: FARM_COUNT,
    opType: "min",
    constraints: constraints,
    variables: variables,
    ints: ints
  })
  console.log(result)
}

function addVariables(recipes: Map<string, Recipe>, variables: Variables): Set<string> {
  const items = new Set<string>()
  recipes.forEach((recipe) => {
    const coefficients: CoefficientsOfVariable = {};
    Array.from(recipe.products).forEach(([product, amount]) => {
      coefficients[product] = amount;
      items.add(product);
    });
    Array.from(recipe.ingredients).forEach(([ingredient, amount]) => {
      coefficients[ingredient] = -amount;
      items.add(ingredient);
    });
    variables[recipe.name] = coefficients;
  })
  return items
}
