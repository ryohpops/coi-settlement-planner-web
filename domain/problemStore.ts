import { produce } from "immer"
import { WritableDraft } from "immer/dist/internal"
import { debounce } from "lodash"
import create from "zustand"
import { persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { allFoods, MedicalSupplies, MEDICAL_SUPPLIES } from "./item"
import { FarmVariant, FARM_VARIANT, productRecipesByName, productRecipesByPrimaryProduct } from "./recipe"
import { Result, solve } from "./solver"

const UPDATE_ANSWER_DELAY = 400

interface ProblemState {
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
  answer: Result
}
const ProblemStatePersistentItems = [
  "population", "globalAdjustment", "foodsInUse", "foodConsumptionChange",
  "medicalSuppliesInUse", "medicalSuppliesConsumptionChange",
  "farmVariant", "fertilityTarget", "recipesInUse"
]

interface ProblemAction {
  setPopulation: (value: number | null) => void
  setGlobalAdjustment: (value: number | null) => void
  setFoodsInUse: (values: string[]) => void
  setFoodConsumptionChange: (value: number | null) => void
  setMedicalSuppliesInUse: (value: MedicalSupplies) => void
  setMedicalSuppliesConsumptionChange: (value: number | null) => void
  setFarmVariant: (value: FarmVariant) => void
  setFertilityTarget: (value: number | null) => void
  setRecipesInUse: (value: string) => void
  updateAnswer: () => void
  onSolverFinished: (result: Result) => void
}

const LOCAL_STORAGE_NAME = "ryohpops.coi-settlement-planner-web"

const emptyResult: Result = {
  feasible: false,
  itemResults: new Map(),
  recipeResults: new Map()
}

const initialState: ProblemState = {
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
  answer: emptyResult
}

export const useProblemStore = create<ProblemState & ProblemAction>()(
  persist(immer((set) => ({
    ...initialState,
    setPopulation: (value) => set((state) => {
      state.population = value ?? 0
      updateAnswerDebounced()
    }),
    setGlobalAdjustment: (value) => set((state) => {
      state.globalAdjustment = value ?? 0
      updateAnswerDebounced()
    }),
    setFoodsInUse: (values) => set((state) => {
      state.foodsInUse = values.filter((key) => allFoods.has(key))
      updateAnswerDebounced()
    }),
    setFoodConsumptionChange: (value) => set((state) => {
      state.foodConsumptionChange = value ?? 0
      updateAnswerDebounced()
    }),
    setMedicalSuppliesInUse: (value) => set((state) => {
      state.medicalSuppliesInUse = value
      updateAnswerDebounced()
    }),
    setMedicalSuppliesConsumptionChange: (value) => set((state) => {
      state.medicalSuppliesConsumptionChange = value ?? 0
      updateAnswerDebounced()
    }),
    setFarmVariant: (value) => set((state) => {
      state.farmVariant = value
      updateAnswerDebounced()
    }),
    setFertilityTarget: (value) => set((state) => {
      state.fertilityTarget = value ?? 0
      updateAnswerDebounced()
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
      updateAnswerDebounced()
    }),
    updateAnswer: () => set((state) => updateAnswer(state)),
    onSolverFinished: (result) => set((state) => {
      state.isSolverRunning = false
      state.feasible = result.feasible
      if (result.feasible) {
        state.answer = result
      }
    })
  })), {
    name: LOCAL_STORAGE_NAME,
    partialize: (state) => {
      return Object.fromEntries(
        Object.entries(state).filter(([key]) => ProblemStatePersistentItems.includes(key))
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

function updateAnswer(state: WritableDraft<ProblemState & ProblemAction>) {
  state.isSolverRunning = true
  solve(
    state.population * (100 + state.foodConsumptionChange + state.globalAdjustment) / 100,
    state.foodsInUse,
    state.population * (100 + state.medicalSuppliesConsumptionChange + state.globalAdjustment) / 100,
    state.medicalSuppliesInUse,
    state.farmVariant, state.fertilityTarget, state.recipesInUse
  ).then((result) => useProblemStore.getState().onSolverFinished(result))
}
const updateAnswerDebounced = debounce(() => useProblemStore.setState((state) => updateAnswer(state)), UPDATE_ANSWER_DELAY)
