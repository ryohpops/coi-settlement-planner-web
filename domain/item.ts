interface Item {
  name: string
  image: string
  isFood: boolean
}

interface Food extends Item {
  isFood: true
  category: string
  feeds: number
}

type ItemMap = { [key: string]: Item | Food }

export function isFood(object: Item | Food): object is Food {
  return object.isFood
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
  { name: "Animal Feed", image: "", isFood: false }
]

export const items: ItemMap = {}
foodData.forEach((data) => items[data.name] = data)
productData.forEach((data) => items[data.name] = data)
