export interface Recipe {
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
  {
    name: "Meat", production_time: 20,
    products: new Map([["Meat", 5], ["Meat Trimmings", 2]]),
    ingredients: new Map([["Chicken Carcass", 10]])
  },
  {
    name: "Meat Trimmings", production_time: 20,
    products: new Map([["Meat Trimmings", 16]]),
    ingredients: new Map([["Meat", 12]])
  },
  {
    name: "Chicken Carcass", production_time: 60,
    products: new Map([["Chicken Carcass", 10], ["Eggs", 7.3]]),
    ingredients: new Map([["Animal Feed", 15.1]])
  },
  {
    name: "Tofu", production_time: 40,
    products: new Map([["Tofu", 8], ["Animal Feed", 3]]),
    ingredients: new Map([["Soybean", 6]])
  },
  {
    name: "Sausage", production_time: 20,
    products: new Map([["Sausage", 8]]),
    ingredients: new Map([["Meat Trimmings", 8], ["Flour", 2]])
  },
  {
    name: "Snack", production_time: 20,
    products: new Map([["Snack", 12]]),
    ingredients: new Map([["Potato", 8], ["Cooking Oil", 1]])
  },
  {
    name: "Cooking Oil", production_time: 30,
    products: new Map([["Cooking Oil", 6], ["Animal Feed", 2]]),
    ingredients: new Map([["Canola", 8]])
  },
  {
    name: "Cake", production_time: 30,
    products: new Map([["Cake", 7]]),
    ingredients: new Map([["Flour", 5], ["Sugar", 2], ["Cooking Oil", 1], ["Eggs", 1], ["Fruit", 1]])
  },
  {
    name: "Sugar", production_time: 40,
    products: new Map([["Sugar", 8]]),
    ingredients: new Map([["Sugar Cane", 10]])
  },
]
const farmRecipeData: Recipe[] = [
  {
    name: "Canola", production_time: 180,
    products: new Map([["Canola", 26]]),
    ingredients: new Map([["Fertility", 0.27]])
  },
  {
    name: "Potato", production_time: 180,
    products: new Map([["Potato", 58]]),
    ingredients: new Map([["Fertility", 0.32]])
  },
  {
    name: "Vegetables", production_time: 240,
    products: new Map([["Vegetables", 60]]),
    ingredients: new Map([["Fertility", 0.42]])
  },
  {
    name: "Soybean", production_time: 240,
    products: new Map([["Soybean", 22]]),
    ingredients: new Map([["Fertility", 0.60]])
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
]
const ghRecipeData: Recipe[] = [
  {
    name: "Canola", production_time: 180,
    products: new Map([["Canola", 33]]),
    ingredients: new Map([["Fertility", 0.30]])
  },
  {
    name: "Potato", production_time: 180,
    products: new Map([["Potato", 73]]),
    ingredients: new Map([["Fertility", 0.35]])
  },
  {
    name: "Vegetables", production_time: 240,
    products: new Map([["Vegetables", 75]]),
    ingredients: new Map([["Fertility", 0.47]])
  },
  {
    name: "Soybean", production_time: 240,
    products: new Map([["Soybean", 28]]),
    ingredients: new Map([["Fertility", 0.68]])
  },
  {
    name: "Corn", production_time: 240,
    products: new Map([["Corn", 83]]),
    ingredients: new Map([["Fertility", 0.54]])
  },
  {
    name: "Wheat", production_time: 360,
    products: new Map([["Wheat", 73]]),
    ingredients: new Map([["Fertility", 0.71]])
  },
  {
    name: "Fruit", production_time: 480,
    products: new Map([["Fruit", 100]]),
    ingredients: new Map([["Fertility", 0.81]])
  },
  {
    name: "Sugar Cane", production_time: 540,
    products: new Map([["Sugar Cane", 220]]),
    ingredients: new Map([["Fertility", 1.52]])
  },
]
const gh2RecipeData: Recipe[] = [
  {
    name: "Canola", production_time: 180,
    products: new Map([["Canola", 39]]),
    ingredients: new Map([["Fertility", 0.34]])
  },
  {
    name: "Potato", production_time: 180,
    products: new Map([["Potato", 87]]),
    ingredients: new Map([["Fertility", 0.39]])
  },
  {
    name: "Vegetables", production_time: 240,
    products: new Map([["Vegetables", 90]]),
    ingredients: new Map([["Fertility", 0.52]])
  },
  {
    name: "Soybean", production_time: 240,
    products: new Map([["Soybean", 33]]),
    ingredients: new Map([["Fertility", 0.75]])
  },
  {
    name: "Corn", production_time: 240,
    products: new Map([["Corn", 99]]),
    ingredients: new Map([["Fertility", 0.60]])
  },
  {
    name: "Wheat", production_time: 360,
    products: new Map([["Wheat", 87]]),
    ingredients: new Map([["Fertility", 0.79]])
  },
  {
    name: "Fruit", production_time: 480,
    products: new Map([["Fruit", 120]]),
    ingredients: new Map([["Fertility", 0.90]])
  },
  {
    name: "Sugar Cane", production_time: 540,
    products: new Map([["Sugar Cane", 264]]),
    ingredients: new Map([["Fertility", 1.69]])
  },
]

export const productRecipes = new Map<string, Recipe>(
  productRecipeData.map((data) => [data.name, data])
)
const farmRecipes = new Map<string, Recipe>(
  farmRecipeData.map((data) => [data.name, data])
)
const ghRecipes = new Map<string, Recipe>(
  ghRecipeData.map((data) => [data.name, data])
)
const gh2Recipes = new Map<string, Recipe>(
  gh2RecipeData.map((data) => [data.name, data])
)
export const farmingRecipes = {
  [FARM_VARIANT.Farm]: farmRecipes,
  [FARM_VARIANT.Greenhouse]: ghRecipes,
  [FARM_VARIANT.Greenhouse2]: gh2Recipes
}
