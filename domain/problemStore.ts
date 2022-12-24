import { WritableDraft } from "immer/dist/internal"
import create from "zustand"
import { immer } from "zustand/middleware/immer"
import { allFoods } from "./item"
import { FarmVariant, FARM_VARIANT } from "./recipe"
import { Result, solve } from "./solver"
import { Params } from "./solverWorker"

interface ProblemState {
  population: number
  consumptionChange: number
  globalAdjustment: number
  foodsInUse: string[]
  farmVariant: FarmVariant
  fertilityTarget: number

  solverWorker: Worker | undefined
  isSolverRunning: boolean
  latestRequestId: string
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
  onSolverFinished: (result: Result) => void
}

const emptyResult: Result = {
  requestId: "empty",
  feasible: false,
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

  solverWorker: undefined,
  isSolverRunning: false,
  latestRequestId: emptyResult.requestId,
  feasible: emptyResult.feasible,
  answer: emptyResult
}

export const useProblemStore = create<ProblemState & ProblemAction>()(
  immer((set, get) => ({
    ...initialState,
    setPopulation: (value) => set((state) => {
      state.population = value ?? 0
      updateAnswer(state, get)
    }),
    setConsumptionChange: (value) => set((state) => {
      state.consumptionChange = value ?? 0
      updateAnswer(state, get)
    }),
    setGlobalAdjustment: (value) => set((state) => {
      state.globalAdjustment = value ?? 0
      updateAnswer(state, get)
    }),
    setFoodsInUse: (values) => set((state) => {
      state.foodsInUse = values.filter((key) => allFoods.has(key))
      updateAnswer(state, get)
    }),
    setFarmVariant: (value) => set((state) => {
      state.farmVariant = value
      updateAnswer(state, get)
    }),
    setFertilityTarget: (value) => set((state) => {
      state.fertilityTarget = value ?? 0
      updateAnswer(state, get)
    }),
    onSolverFinished: (result) => set((state) => {
      if (result.requestId === state.latestRequestId) {
        state.isSolverRunning = false
        state.feasible = result.feasible
        if (result.feasible) {
          state.answer = result
        }
      }
    })
  }))
)

function updateAnswer(state: WritableDraft<ProblemState & ProblemAction>, get: () => ProblemState & ProblemAction) {
  state.isSolverRunning = true
  state.latestRequestId = Date.now().toString()

  if (!state.solverWorker) {
    state.solverWorker = new Worker(new URL("./solverWorker.ts", import.meta.url))
  }

  const params: Params = {
    requestId: state.latestRequestId, population: state.population,
    demandAdjustment: state.consumptionChange + state.globalAdjustment,
    foodsInUse: JSON.stringify(state.foodsInUse), farmVariant: state.farmVariant,
    fertilityTarget: state.fertilityTarget
  }
  state.solverWorker.onmessage = (event: MessageEvent<Result>) => get().onSolverFinished(event.data)
  state.solverWorker.postMessage(params)
}
