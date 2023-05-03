import { produce } from "immer"
import { WritableDraft } from "immer/dist/internal"
import { debounce } from "lodash"
import create from "zustand"
import { persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { MEDICAL_SUPPLIES, MedicalSupplies, allFoods } from "./item"
import { FARM_VARIANT, FarmVariant, productRecipesByName, productRecipesByPrimaryProduct } from "./recipe"
import { FarmingConfigSolution, solveFarmingConfig } from "./solver"

const UPDATE_SOLUTION_DELAY = 400
const LOCAL_STORAGE_NAME = "ryohpops.coi-settlement-planner-web"

interface FarmConfigState {
  population: number
  globalAdjustment: number
  foodsInUse: string[]
  foodConsumptionChange: number
  medicalSuppliesInUse: MedicalSupplies
  medicalSuppliesConsumptionChange: number
  farmVariant: FarmVariant
  fertilityTarget: number
  recipesInUse: string[]

  isSolverRunning: boolean
  feasible: boolean
  solution: FarmingConfigSolution
}
const persistentProperties: Array<keyof FarmConfigState> = [
  "population", "globalAdjustment", "foodsInUse", "foodConsumptionChange",
  "medicalSuppliesInUse", "medicalSuppliesConsumptionChange",
  "farmVariant", "fertilityTarget", "recipesInUse"
]

interface FarmConfigAction {
  setPopulation: (value: number | null) => void
  setGlobalAdjustment: (value: number | null) => void
  setFoodsInUse: (values: string[]) => void
  setFoodConsumptionChange: (value: number | null) => void
  setMedicalSuppliesInUse: (value: MedicalSupplies) => void
  setMedicalSuppliesConsumptionChange: (value: number | null) => void
  setFarmVariant: (value: FarmVariant) => void
  setFertilityTarget: (value: number | null) => void
  setRecipesInUse: (value: string) => void
  updateSolution: () => void
  onSolverFinished: (result: FarmingConfigSolution) => void
}

const emptyResult: FarmingConfigSolution = {
  feasible: false,
  itemStatus: new Map(),
  recipeStatus: new Map()
}

const initialState: FarmConfigState = {
  population: 1000,
  globalAdjustment: 5,
  foodsInUse: ["Potato", "Corn", "Bread", "Vegetables"],
  foodConsumptionChange: 0,
  medicalSuppliesInUse: MEDICAL_SUPPLIES.MedicalSupplies,
  medicalSuppliesConsumptionChange: 50,
  farmVariant: FARM_VARIANT.Farm,
  fertilityTarget: 0,
  recipesInUse: [
    "Produce Animal Feed from Soybean",
    "Produce Snack from Corn",
    "Produce Disinfectant with Chemical Plant",
    "Produce Ethanol from Corn Mash",
    "Produce Medical Supplies II with Assembly (Electric) II",
    "Produce Medical Supplies III with Assembly (Electric) II"
  ],

  isSolverRunning: false,
  feasible: emptyResult.feasible,
  solution: emptyResult
}

export const useFarmConfigStore = create<FarmConfigState & FarmConfigAction>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      setPopulation: (value) => set((state) => {
        state.population = value ?? 0
        updateSolutionDebounced()
      }),
      setGlobalAdjustment: (value) => set((state) => {
        state.globalAdjustment = value ?? 0
        updateSolutionDebounced()
      }),
      setFoodsInUse: (values) => set((state) => {
        state.foodsInUse = values.filter((key) => allFoods.has(key))
        updateSolutionDebounced()
      }),
      setFoodConsumptionChange: (value) => set((state) => {
        state.foodConsumptionChange = value ?? 0
        updateSolutionDebounced()
      }),
      setMedicalSuppliesInUse: (value) => set((state) => {
        state.medicalSuppliesInUse = value
        updateSolutionDebounced()
      }),
      setMedicalSuppliesConsumptionChange: (value) => set((state) => {
        state.medicalSuppliesConsumptionChange = value ?? 0
        updateSolutionDebounced()
      }),
      setFarmVariant: (value) => set((state) => {
        state.farmVariant = value
        updateSolutionDebounced()
      }),
      setFertilityTarget: (value) => set((state) => {
        state.fertilityTarget = value ?? 0
        updateSolutionDebounced()
      }),
      setRecipesInUse: (value) => set((state) => {
        const recipe = productRecipesByName.get(value)
        if (!recipe) {
          throw new Error(`Recipe with name ${value} not found.`)
        } else if (!recipe.primaryProduct) {
          throw new Error(`Recipe ${value} does not have primary product.`)
        }

        const recipesForProduct = productRecipesByPrimaryProduct.get(recipe.primaryProduct)
        if (!recipesForProduct) {
          throw new Error(`Recipe for product ${recipe.primaryProduct} not found.`)
        }
        const recipeNamesForProduct = recipesForProduct.map((recipe) => recipe.name)

        const others = state.recipesInUse.filter((recipeName) => !recipeNamesForProduct.includes(recipeName))
        state.recipesInUse = [...others, value]
        updateSolutionDebounced()
      }),
      updateSolution: () => set((state) => updateSolution(state, get())),
      onSolverFinished: (result) => set((state) => {
        state.isSolverRunning = false
        state.feasible = result.feasible
        if (result.feasible) {
          state.solution = result
        }
      })
    })),
    {
      name: LOCAL_STORAGE_NAME,
      partialize: (state) => {
        return Object.fromEntries(
          Object.entries(state).filter(([key, value]) => persistentProperties.includes(key as keyof FarmConfigState))
        )
      },
      merge: (persistedState, currentState) => {
        return produce(currentState, (state) => Object.assign(state, persistedState))
      },
      version: 2,
      migrate: (persistedState: any, version) => {
        if (version < 2) {
          persistedState.foodConsumptionChange = persistedState.consumptionChange
          delete persistedState.consumptionChange
        }
        return persistedState
      }
    })
)

function updateSolution(draft: WritableDraft<FarmConfigState & FarmConfigAction>, state: FarmConfigState & FarmConfigAction) {
  draft.isSolverRunning = true
  solveFarmingConfig(
    state.population * (100 + state.foodConsumptionChange + state.globalAdjustment) / 100,
    state.foodsInUse,
    state.population * (100 + state.medicalSuppliesConsumptionChange + state.globalAdjustment) / 100,
    state.medicalSuppliesInUse,
    state.farmVariant, state.fertilityTarget, state.recipesInUse
  ).then((result) => useFarmConfigStore.getState().onSolverFinished(result))
}
const updateSolutionDebounced = debounce(
  () => useFarmConfigStore.setState((state) => updateSolution(state, useFarmConfigStore.getState())),
  UPDATE_SOLUTION_DELAY
)
