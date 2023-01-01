import { objectTraps, WritableDraft } from "immer/dist/internal";
import create from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { allFoods, MedicalSupplies, MEDICAL_SUPPLIES } from "./item";
import { FarmVariant, FARM_VARIANT, productRecipesByName, productRecipesByPrimaryProduct } from "./recipe";
import { Result, solve } from "./solver";

interface ProblemState {
  population: number
  globalAdjustment: number
  foodsInUse: string[]
  consumptionChange: number
  medicalSuppliesInUse: MedicalSupplies
  farmVariant: FarmVariant
  fertilityTarget: number
  recipesInUse: string[]

  isSolverRunning: boolean
  feasible: boolean
  answer: Result
}
const ProblemStatePersistentItems = [
  "population", "globalAdjustment", "foodsInUse", "consumptionChange",
  "medicalSuppliesInUse", "farmVariant", "fertilityTarget", "recipesInUse"
]

interface ProblemAction {
  setPopulation: (value: number | null) => void
  setGlobalAdjustment: (value: number | null) => void
  setFoodsInUse: (values: string[]) => void
  setConsumptionChange: (value: number | null) => void
  setMedicalSuppliesInUse: (value: MedicalSupplies) => void
  setFarmVariant: (value: FarmVariant) => void
  setFertilityTarget: (value: number | null) => void
  setRecipesInUse: (value: string) => void
  refreshAnswer: () => void
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
  consumptionChange: 0,
  medicalSuppliesInUse: MEDICAL_SUPPLIES.MedicalSupplies,
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
  persist(immer((set, get) => ({
    ...initialState,
    setPopulation: (value) => set((state) => {
      state.population = value ?? 0
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
    setConsumptionChange: (value) => set((state) => {
      state.consumptionChange = value ?? 0
      updateAnswer(state, get)
    }),
    setMedicalSuppliesInUse: (value) => set((state) => {
      state.medicalSuppliesInUse = value
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
    setRecipesInUse: (value) => set((state) => {
      const recipe = productRecipesByName.get(value)
      if (!recipe) {
        throw new Error(`Recipe with name ${value} not found.`);
      } else if (!recipe.primaryProduct) {
        throw new Error(`Recipe ${value} does not have primary product.`);
      }

      const recipesForProduct = productRecipesByPrimaryProduct.get(recipe.primaryProduct)
      if (!recipesForProduct) {
        throw new Error(`Recipe for product ${recipe.primaryProduct} not found.`);
      }
      const recipeNamesForProduct = recipesForProduct.map((recipe) => recipe.name)

      const others = state.recipesInUse.filter((recipeName) => !recipeNamesForProduct.includes(recipeName))
      state.recipesInUse = [...others, value]
      updateAnswer(state, get)
    }),
    refreshAnswer: () => set((state) => updateAnswer(state, get)),
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
      return { ...currentState, ...persistedState as Partial<ProblemState & ProblemAction> }
    },
    version: 1
  })
)

function updateAnswer(state: WritableDraft<ProblemState & ProblemAction>, get: () => ProblemState & ProblemAction) {
  state.isSolverRunning = true
  solve(
    state.population, state.consumptionChange + state.globalAdjustment,
    state.foodsInUse, state.medicalSuppliesInUse, state.farmVariant, state.fertilityTarget, state.recipesInUse
  ).then((result) => get().onSolverFinished(result))
}
