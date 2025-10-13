export interface Entity {
  name: string
  image: string
  category: string
}

export const ALL_FARM: Entity[] = [
  { name: "Farm", image: "", category: "Farm" },
  { name: "Greenhouse", image: "", category: "Farm" },
  { name: "Greenhouse II", image: "", category: "Farm" },
]

export const ALL_FACTORY: Entity[] = [
  { name: "Chicken Farm", image: "", category: "Chicken Farm" },
  { name: "Baking Unit", image: "", category: "Baking Unit" },
  { name: "Fermentation Tank", image: "", category: "Fermentation Tank" },
  { name: "Food Processor", image: "", category: "Food Processor" },
  { name: "Mill", image: "", category: "Mill" },
  { name: "Assembly", image: "", category: "Assembly" },
  { name: "Assembly II", image: "", category: "Assembly" },
  { name: "Assembly III", image: "", category: "Assembly" },
  { name: "Assembly IV", image: "", category: "Assembly" },
  { name: "Assembly V", image: "", category: "Assembly" },
  { name: "Mixer", image: "", category: "Mixer" },
  { name: "Mixer II", image: "", category: "Mixer" },
  { name: "Chemical Plant", image: "", category: "Chemical Plant" },
  { name: "Chemical Plant II", image: "", category: "Chemical Plant" },
]

export const FACTORY_BY_NAME = Object.fromEntries(
  ALL_FACTORY.map((factory) => [factory.name, factory])
)
export const FACTORY_BY_CATEGORY = Object.groupBy(
  ALL_FACTORY,
  (factory) => factory.category
)
