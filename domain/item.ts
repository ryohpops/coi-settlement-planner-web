export interface Item {
  name: string
  image: string
  isFood: boolean
}

export interface Food extends Item {
  isFood: true
  category: string
  feeds: number
}

export const categories = ["Carbs", "Protein", "Vitamins", "Treats"]

const foodData: Food[] = [
  { name: "Potato", image: "", isFood: true, category: "Carbs", feeds: 17 },
  { name: "Corn", image: "", isFood: true, category: "Carbs", feeds: 25 },
  { name: "Bread", image: "", isFood: true, category: "Carbs", feeds: 37 },
  { name: "Vegetables", image: "", isFood: true, category: "Vitamins", feeds: 17 },
]
const productData: Item[] = [
  { name: "Flour", image: "", isFood: false },
  { name: "Wheat", image: "", isFood: false },
  { name: "Animal Feed", image: "", isFood: false }
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
