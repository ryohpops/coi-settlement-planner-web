export interface Item {
  name: string
  image: string
  isFood: boolean
  isCrop: boolean
}

export interface Food extends Item {
  isFood: true
  category: string
  feeds: number
}

export const MEDICAL_SUPPLIES = {
  None: "None",
  MedicalSupplies: "Medical Supplies",
  MedicalSupplies2: "Medical Supplies II",
  MedicalSupplies3: "Medical Supplies III"
}
export type MedicalSupplies = typeof MEDICAL_SUPPLIES[keyof typeof MEDICAL_SUPPLIES]

export const VIRTUAL_ITEM = {
  Demand: "Demand",
  Fertility: "Fertility"
} as const
export type VirtualItem = typeof VIRTUAL_ITEM[keyof typeof VIRTUAL_ITEM]

export const categories = ["Carbs", "Protein", "Vitamins", "Treats"]

const foodData: Food[] = [
  { name: "Potato", image: "", isFood: true, isCrop: true, category: "Carbs", feeds: 17 },
  { name: "Corn", image: "", isFood: true, isCrop: true, category: "Carbs", feeds: 25 },
  { name: "Bread", image: "", isFood: true, isCrop: false, category: "Carbs", feeds: 37 },
  { name: "Meat", image: "", isFood: true, isCrop: false, category: "Protein", feeds: 27 },
  { name: "Eggs", image: "", isFood: true, isCrop: false, category: "Protein", feeds: 25 },
  { name: "Tofu", image: "", isFood: true, isCrop: false, category: "Protein", feeds: 41 },
  { name: "Sausage", image: "", isFood: true, isCrop: false, category: "Protein", feeds: 22 },
  { name: "Vegetables", image: "", isFood: true, isCrop: true, category: "Vitamins", feeds: 17 },
  { name: "Fruit", image: "", isFood: true, isCrop: true, category: "Vitamins", feeds: 23 },
  { name: "Snack", image: "", isFood: true, isCrop: false, category: "Treats", feeds: 13 },
  { name: "Cake", image: "", isFood: true, isCrop: false, category: "Treats", feeds: 29 },
]
const productData: Item[] = [
  { name: "Flour", image: "", isFood: false, isCrop: false },
  { name: "Wheat", image: "", isFood: false, isCrop: true },
  { name: "Animal Feed", image: "", isFood: false, isCrop: false },
  { name: "Meat Trimmings", image: "", isFood: false, isCrop: false },
  { name: "Chicken Carcass", image: "", isFood: false, isCrop: false },
  { name: "Soybean", image: "", isFood: false, isCrop: true },
  { name: "Cooking Oil", image: "", isFood: false, isCrop: false },
  { name: "Canola", image: "", isFood: false, isCrop: true },
  { name: "Sugar", image: "", isFood: false, isCrop: false },
  { name: "Sugar Cane", image: "", isFood: false, isCrop: true },
  { name: "Medical Supplies", image: "", isFood: false, isCrop: false },
  { name: "Disinfectant", image: "", isFood: false, isCrop: false },
  { name: "Ethanol", image: "", isFood: false, isCrop: false },
  { name: "Corn Mash", image: "", isFood: false, isCrop: false },
  { name: "Medical Supplies II", image: "", isFood: false, isCrop: false },
  { name: "Antibiotics", image: "", isFood: false, isCrop: false },
  { name: "Medical Supplies III", image: "", isFood: false, isCrop: false },
  { name: "Morphine", image: "", isFood: false, isCrop: false },
  { name: "Poppy", image: "", isFood: false, isCrop: true },
]

export const allFoods = function () {
  const foods = new Map<string, Food>()
  foodData.forEach((data) => foods.set(data.name, data))
  return foods
}()
export const allItems = function () {
  const items = new Map<string, Item | Food>(allFoods)
  productData.forEach((data) => items.set(data.name, data))
  return items
}()
