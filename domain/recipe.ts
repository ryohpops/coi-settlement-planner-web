interface Recipe {
  name: string
  production_time: number
  products: Map<string, number>
  ingredients: Map<string, number>
}

export const FARM_VARIANT = {
  Farm: "Farm",
  Greenhouse: "Greenhouse",
  Greenhouse2: "Greenhouse2"
} as const
export type FarmVariant = typeof FARM_VARIANT[keyof typeof FARM_VARIANT]

const productRecipeData: Recipe[] = [
  {
    name: "Bread", production_time: 30,
    products: new Map([["Bread", 12]]),
    ingredients: new Map([["Flour", 8]])
  },
  {
    name: "Flour", production_time: 30,
    products: new Map([["Flour", 8], ["Animal Feed", 1]]),
    ingredients: new Map([["Wheat", 8]])
  },
]
const farmRecipeData: Recipe[] = [
  {
    name: "Potato", production_time: 180,
    products: new Map([["Potato", 58]]),
    ingredients: new Map([["Fertility", 0.32]])
  },
  {
    name: "Corn", production_time: 240,
    products: new Map([["Corn", 66]]),
    ingredients: new Map([["Fertility", 0.48]])
  },
  {
    name: "Wheat", production_time: 360,
    products: new Map([["Wheat", 58]]),
    ingredients: new Map([["Fertility", 0.63]])
  },
  {
    name: "Vegetables", production_time: 240,
    products: new Map([["Vegetables", 60]]),
    ingredients: new Map([["Fertility", 0.42]])
  },
]
const ghRecipeData: Recipe[] = [

]
const gh2RecipeData: Recipe[] = [

]

export const productRecipes = new Map<string, Recipe>(
  productRecipeData.map((data) => [data.name, data])
)
export const farmRecipes = new Map<string, Recipe>(
  farmRecipeData.map((data) => [data.name, data])
)
export const ghRecipes = new Map<string, Recipe>(
  ghRecipeData.map((data) => [data.name, data])
)
export const gh2Recipes = new Map<string, Recipe>(
  gh2RecipeData.map((data) => [data.name, data])
)
