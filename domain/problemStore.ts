import create from "zustand"
import { immer } from "zustand/middleware/immer"
import { items } from "./item"
import { FarmVariant, FARM_VARIANT } from "./recipe"

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

const foodNames = Object.keys(items).filter((key) => items[key].isFood)

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
    }),
    setConsumptionChange: (value) => set((state) => {
      state.consumptionChange = value ?? 0
    }),
    setGlobalAdjustment: (value) => set((state) => {
      state.globalAdjustment = value ?? 0
    }),
    setFoodsInUse: (values) => set((state) => {
      state.foodsInUse = values.filter((key) => foodNames.includes(key))
    }),
    setFarmVariant: (value) => set((state) => {
      state.farmVariant = value
    }),
    setFertilityTarget: (value) => set((state) => {
      state.fertilityTarget = value ?? 0
    })
  }))
)
