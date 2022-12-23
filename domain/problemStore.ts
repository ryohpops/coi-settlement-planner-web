import { WritableDraft } from "immer/dist/internal"
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
  feasible: boolean
  answer: Result
}

interface ProblemAction {
  setPopulation: (value: number | null) => void
  setConsumptionChange: (value: number | null) => void
  setGlobalAdjustment: (value: number | null) => void
  setFoodsInUse: (values: string[]) => void
  setFarmVariant: (value: FarmVariant) => void
  setFertilityTarget: (value: number | null) => void
}

const emptyResult: Result = {
  itemResults: new Map(),
  recipeResults: new Map()
}

const initialState: ProblemState = {
  population: 1000,
  consumptionChange: 0,
  globalAdjustment: 0,
  foodsInUse: ["Potato", "Corn", "Bread", "Vegetables"],
  farmVariant: FARM_VARIANT.Farm,
  fertilityTarget: 0,
  feasible: false,
  answer: emptyResult
}

export const useProblemStore = create<ProblemState & ProblemAction>()(
  immer((set) => ({
    ...initialState,
    feasible: true,
    answer: solve(
      initialState.population, initialState.consumptionChange + initialState.globalAdjustment,
      initialState.foodsInUse, initialState.farmVariant, initialState.fertilityTarget
    )!,
    setPopulation: (value) => set((state) => {
      state.population = value ?? 0
      updateAnswer(state)
    }),
    setConsumptionChange: (value) => set((state) => {
      state.consumptionChange = value ?? 0
      updateAnswer(state)
    }),
    setGlobalAdjustment: (value) => set((state) => {
      state.globalAdjustment = value ?? 0
      updateAnswer(state)
    }),
    setFoodsInUse: (values) => set((state) => {
      state.foodsInUse = values.filter((key) => allFoods.has(key))
      updateAnswer(state)
    }),
    setFarmVariant: (value) => set((state) => {
      state.farmVariant = value
      updateAnswer(state)
    }),
    setFertilityTarget: (value) => set((state) => {
      state.fertilityTarget = value ?? 0
      updateAnswer(state)
    })
  }))
)

function updateAnswer(state: WritableDraft<ProblemState & ProblemAction>) {
  const result = solve(
    state.population, state.consumptionChange + state.globalAdjustment,
    state.foodsInUse, state.farmVariant, state.fertilityTarget
  )
  if (result) {
    state.feasible = true
    state.answer = result
  } else {
    state.feasible = false
  }
}
