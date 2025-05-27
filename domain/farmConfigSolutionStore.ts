import { debounce } from "lodash"
import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { useFarmConfigInputStore } from "./farmConfigInputStore"
import { FarmConfigSolution, solveFarmConfig } from "./farmConfigSolver"

const UPDATE_SOLUTION_DELAY = 400

interface FarmConfigSolutionState {
  isSolverRunning: boolean
  feasible: boolean
  solution: FarmConfigSolution
}

interface FarmConfigSolutionAction {
  updateSolution: () => void
  updateSolutionDebounced: () => void
  onSolverFinished: (result: FarmConfigSolution) => void
}

const emptyResult: FarmConfigSolution = {
  feasible: false,
  itemStatus: new Map(),
  recipeStatus: new Map()
}

const initialState: FarmConfigSolutionState = {
  isSolverRunning: false,
  feasible: emptyResult.feasible,
  solution: emptyResult
}

export const useFarmConfigSolutionStore = create<FarmConfigSolutionState & FarmConfigSolutionAction>()(
  immer((set, get) => ({
    ...initialState,
    updateSolution: () => set((state) => {
      state.isSolverRunning = true
      runSolver(get().onSolverFinished)
    }),
    updateSolutionDebounced: () => set((state) => {
      state.isSolverRunning = true
      runSolverDebounced(get().onSolverFinished)
    }),
    onSolverFinished: (result) => set((state) => {
      state.isSolverRunning = false
      state.feasible = result.feasible
      if (result.feasible) {
        state.solution = result
      }
    })
  }))
)

type updateSolutionCallback = (result: FarmConfigSolution) => void
function runSolver(callback: updateSolutionCallback) {
  const farmConfigInput = useFarmConfigInputStore.getState()
  solveFarmConfig(
    farmConfigInput.population * (1 + farmConfigInput.globalAdjustment / 100),
    farmConfigInput.foodsInUse,
    farmConfigInput.foodConsumptionChange / 100,
    farmConfigInput.medicalSuppliesInUse,
    farmConfigInput.diseaseProportion / 100,
    farmConfigInput.recipesInUse,
    farmConfigInput.farmVariant, farmConfigInput.fertilityTarget,
  ).then((result) => callback(result))
}
const runSolverDebounced = debounce(
  runSolver,
  UPDATE_SOLUTION_DELAY
)
