import create from "zustand"
import { immer } from "zustand/middleware/immer"
import { generateCropRotations } from "./cropRotation"
import { allFoods, Food } from "./item"
import { farmRecipes, FarmVariant, FARM_VARIANT, productRecipes } from "./recipe"
import { solve } from "./solver"

interface ProblemState {
  population: number
  consumptionChange: number
  globalAdjustment: number
  foodsInUse: string[]
  farmVariant: FarmVariant
  fertilityTarget: number
}

interface ProblemAction {
  setPopulation: (value: number | null) => void
  setConsumptionChange: (value: number | null) => void
  setGlobalAdjustment: (value: number | null) => void
  setFoodsInUse: (values: string[]) => void
  setFarmVariant: (value: FarmVariant) => void
  setFertilityTarget: (value: number | null) => void
}

export const useProblemStore = create<ProblemState & ProblemAction>()(
  immer((set) => ({
    population: 0,
    consumptionChange: 0,
    globalAdjustment: 0,
    foodsInUse: [],
    farmVariant: FARM_VARIANT.Farm,
    fertilityTarget: 0,
    setPopulation: (value) => set((state) => {
      state.population = value ?? 0
      const demands = calculateFoodDemands(state.population, state.globalAdjustment, state.foodsInUse)
      solve(productRecipes, generateCropRotations(farmRecipes, state.fertilityTarget), demands)
    }),
    setConsumptionChange: (value) => set((state) => {
      state.consumptionChange = value ?? 0
    }),
    setGlobalAdjustment: (value) => set((state) => {
      state.globalAdjustment = value ?? 0
    }),
    setFoodsInUse: (values) => set((state) => {
      state.foodsInUse = values.filter((key) => allFoods.has(key))
    }),
    setFarmVariant: (value) => set((state) => {
      state.farmVariant = value
    }),
    setFertilityTarget: (value) => set((state) => {
      state.fertilityTarget = value ?? 0
    })
  }))
)

function calculateFoodDemands(population: number, adjustment: number, foodsInUse: string[]): Map<string, number> {
  const demands = new Map<string, number>()
  const foods = foodsInUse.map((foodName) => allFoods.get(foodName)).filter(Boolean) as Food[]

  const categoriesInUse = new Set<string>(foods.map((food) => food.category))
  foods.forEach((food) => demands.set(
    food.name,
    population
    / food.feeds
    * (100 + adjustment) / 100
    / categoriesInUse.size
    / foods.filter((food2) => food2.category === food.category).length
  ))

  return demands
}
