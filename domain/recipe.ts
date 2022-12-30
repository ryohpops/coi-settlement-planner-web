export interface Recipe {
  name: string
  production_time: number
  primaryProduct?: string
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
    name: "Produce Bread", production_time: 30, primaryProduct: "Bread",
    products: new Map([["Bread", 12]]),
    ingredients: new Map([["Flour", 8]])
  },
  {
    name: "Produce Flour", production_time: 30, primaryProduct: "Flour",
    products: new Map([["Flour", 8], ["Animal Feed", 1]]),
    ingredients: new Map([["Wheat", 8]])
  },
  {
    name: "Produce Meat", production_time: 20, primaryProduct: "Meat",
    products: new Map([["Meat", 5], ["Meat Trimmings", 2]]),
    ingredients: new Map([["Chicken Carcass", 10]])
  },
  {
    name: "Produce Meat Trimmings", production_time: 20, primaryProduct: "Meat Trimmings",
    products: new Map([["Meat Trimmings", 16]]),
    ingredients: new Map([["Meat", 12]])
  },
  {
    name: "Produce Chicken Carcass", production_time: 60, primaryProduct: "Chicken Carcass",
    products: new Map([["Chicken Carcass", 10], ["Eggs", 7.3]]),
    ingredients: new Map([["Animal Feed", 15.1]])
  },
  {
    name: "Produce Eggs", production_time: 60, primaryProduct: "Eggs",
    products: new Map([["Chicken Carcass", 10], ["Eggs", 7.3]]),
    ingredients: new Map([["Animal Feed", 15.1]])
  },
  {
    name: "Produce Animal Feed from Corn", production_time: 10, primaryProduct: "Animal Feed",
    products: new Map([["Animal Feed", 12]]),
    ingredients: new Map([["Corn", 10]])
  },
  {
    name: "Produce Animal Feed from Potato", production_time: 10, primaryProduct: "Animal Feed",
    products: new Map([["Animal Feed", 8]]),
    ingredients: new Map([["Potato", 10]])
  },
  {
    name: "Produce Animal Feed from Soybean", production_time: 10, primaryProduct: "Animal Feed",
    products: new Map([["Animal Feed", 18]]),
    ingredients: new Map([["Soybean", 10]])
  },
  {
    name: "Produce Animal Feed from Wheat", production_time: 10, primaryProduct: "Animal Feed",
    products: new Map([["Animal Feed", 16]]),
    ingredients: new Map([["Wheat", 10]])
  },
  {
    name: "Produce Tofu", production_time: 40, primaryProduct: "Tofu",
    products: new Map([["Tofu", 8], ["Animal Feed", 3]]),
    ingredients: new Map([["Soybean", 6]])
  },
  {
    name: "Produce Sausage", production_time: 20, primaryProduct: "Sausage",
    products: new Map([["Sausage", 8]]),
    ingredients: new Map([["Meat Trimmings", 8], ["Flour", 2]])
  },
  {
    name: "Produce Snack from Corn", production_time: 20, primaryProduct: "Snack",
    products: new Map([["Snack", 16]]),
    ingredients: new Map([["Corn", 8], ["Cooking Oil", 1]])
  },
  {
    name: "Produce Snack from Potato", production_time: 20, primaryProduct: "Snack",
    products: new Map([["Snack", 12]]),
    ingredients: new Map([["Potato", 8], ["Cooking Oil", 1]])
  },
  {
    name: "Produce Cooking Oil", production_time: 30, primaryProduct: "Cooking Oil",
    products: new Map([["Cooking Oil", 6], ["Animal Feed", 2]]),
    ingredients: new Map([["Canola", 8]])
  },
  {
    name: "Produce Cake", production_time: 30, primaryProduct: "Cake",
    products: new Map([["Cake", 7]]),
    ingredients: new Map([["Flour", 5], ["Sugar", 2], ["Cooking Oil", 1], ["Eggs", 1], ["Fruit", 1]])
  },
  {
    name: "Produce Sugar", production_time: 40, primaryProduct: "Sugar",
    products: new Map([["Sugar", 8]]),
    ingredients: new Map([["Sugar Cane", 10]])
  },
]
const farmRecipeData: Recipe[] = [
  {
    name: "Produce Canola", production_time: 180, primaryProduct: "Canola",
    products: new Map([["Canola", 26]]),
    ingredients: new Map([["Fertility", 0.27]])
  },
  {
    name: "Produce Potato", production_time: 180, primaryProduct: "Potato",
    products: new Map([["Potato", 58]]),
    ingredients: new Map([["Fertility", 0.32]])
  },
  {
    name: "Produce Vegetables", production_time: 240, primaryProduct: "Vegetables",
    products: new Map([["Vegetables", 60]]),
    ingredients: new Map([["Fertility", 0.42]])
  },
  {
    name: "Produce Soybean", production_time: 240, primaryProduct: "Soybean",
    products: new Map([["Soybean", 22]]),
    ingredients: new Map([["Fertility", 0.60]])
  },
  {
    name: "Produce Corn", production_time: 240, primaryProduct: "Corn",
    products: new Map([["Corn", 66]]),
    ingredients: new Map([["Fertility", 0.48]])
  },
  {
    name: "Produce Wheat", production_time: 360, primaryProduct: "Wheat",
    products: new Map([["Wheat", 58]]),
    ingredients: new Map([["Fertility", 0.63]])
  },
]
const ghRecipeData: Recipe[] = [
  {
    name: "Produce Canola", production_time: 180, primaryProduct: "Canola",
    products: new Map([["Canola", 33]]),
    ingredients: new Map([["Fertility", 0.30]])
  },
  {
    name: "Produce Potato", production_time: 180, primaryProduct: "Potato",
    products: new Map([["Potato", 73]]),
    ingredients: new Map([["Fertility", 0.35]])
  },
  {
    name: "Produce Vegetables", production_time: 240, primaryProduct: "Vegetables",
    products: new Map([["Vegetables", 75]]),
    ingredients: new Map([["Fertility", 0.47]])
  },
  {
    name: "Produce Soybean", production_time: 240, primaryProduct: "Soybean",
    products: new Map([["Soybean", 28]]),
    ingredients: new Map([["Fertility", 0.68]])
  },
  {
    name: "Produce Corn", production_time: 240, primaryProduct: "Corn",
    products: new Map([["Corn", 83]]),
    ingredients: new Map([["Fertility", 0.54]])
  },
  {
    name: "Produce Wheat", production_time: 360, primaryProduct: "Wheat",
    products: new Map([["Wheat", 73]]),
    ingredients: new Map([["Fertility", 0.71]])
  },
  {
    name: "Produce Fruit", production_time: 480, primaryProduct: "Fruit",
    products: new Map([["Fruit", 100]]),
    ingredients: new Map([["Fertility", 0.81]])
  },
  {
    name: "Produce Sugar Cane", production_time: 540, primaryProduct: "Sugar Cane",
    products: new Map([["Sugar Cane", 220]]),
    ingredients: new Map([["Fertility", 1.52]])
  },
]
const gh2RecipeData: Recipe[] = [
  {
    name: "Produce Canola", production_time: 180, primaryProduct: "Canola",
    products: new Map([["Canola", 39]]),
    ingredients: new Map([["Fertility", 0.34]])
  },
  {
    name: "Produce Potato", production_time: 180, primaryProduct: "Potato",
    products: new Map([["Potato", 87]]),
    ingredients: new Map([["Fertility", 0.39]])
  },
  {
    name: "Produce Vegetables", production_time: 240, primaryProduct: "Vegetables",
    products: new Map([["Vegetables", 90]]),
    ingredients: new Map([["Fertility", 0.52]])
  },
  {
    name: "Produce Soybean", production_time: 240, primaryProduct: "Soybean",
    products: new Map([["Soybean", 33]]),
    ingredients: new Map([["Fertility", 0.75]])
  },
  {
    name: "Produce Corn", production_time: 240, primaryProduct: "Corn",
    products: new Map([["Corn", 99]]),
    ingredients: new Map([["Fertility", 0.60]])
  },
  {
    name: "Produce Wheat", production_time: 360, primaryProduct: "Wheat",
    products: new Map([["Wheat", 87]]),
    ingredients: new Map([["Fertility", 0.79]])
  },
  {
    name: "Produce Fruit", production_time: 480, primaryProduct: "Fruit",
    products: new Map([["Fruit", 120]]),
    ingredients: new Map([["Fertility", 0.90]])
  },
  {
    name: "Produce Sugar Cane", production_time: 540, primaryProduct: "Sugar Cane",
    products: new Map([["Sugar Cane", 264]]),
    ingredients: new Map([["Fertility", 1.69]])
  },
]

export const productRecipesByName = new Map<string, Recipe>(
  productRecipeData.map((data) => [data.name, data])
)
export const productRecipesByPrimaryProduct = function () {
  const map = new Map<string, Recipe[]>()
  productRecipeData.forEach((data) => {
    if (data.primaryProduct) {
      if (!map.has(data.primaryProduct)) {
        map.set(data.primaryProduct, [])
      }
      map.get(data.primaryProduct)!.push(data)
    }
  })
  return map
}()
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
