import create from "zustand"
import { immer } from "zustand/middleware/immer"
import { allFoods } from "./item"
import { FarmVariant, FARM_VARIANT } from "./recipe"
import { Result, solve } from "./solver"

interface ProblemState {
  population: number
  consumptionChange: number
  globalAdjustment: number
  foodsInUse: string[]
  farmVariant: FarmVariant
  fertilityTarget: number
  answer: Result | undefined
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
    population: 1000,
    consumptionChange: 0,
    globalAdjustment: 0,
    foodsInUse: ["Potato", "Corn", "Bread", "Vegetables"],
    farmVariant: FARM_VARIANT.Farm,
    fertilityTarget: 0,
    answer: undefined,
    setPopulation: (value) => set((state) => {
      state.population = value ?? 0
      state.answer = solve(
        state.population, state.consumptionChange + state.globalAdjustment,
        state.foodsInUse, state.farmVariant, state.fertilityTarget
      )
      console.log(state.answer)
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
