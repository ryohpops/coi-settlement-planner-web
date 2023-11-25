import { produce } from "immer"
import { debounce } from "lodash"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { FarmConfigSolution, solveFarmConfig } from "./farmConfigSolver"
import { MEDICAL_SUPPLIES, MedicalSupplies, allFoods } from "./item"
import { FARM_VARIANT, FarmVariant, productRecipesByName, productRecipesByPrimaryProduct } from "./recipe"

const UPDATE_SOLUTION_DELAY = 400
const LOCAL_STORAGE_NAME = "ryohpops.coi-settlement-planner-web"

interface FarmConfigState {
  population: number
  globalAdjustment: number
  foodsInUse: string[]
  foodConsumptionReduction: number
  medicalSuppliesInUse: MedicalSupplies
  diseaseProportion: number
  farmVariant: FarmVariant
  fertilityTarget: number
  recipesInUse: string[]

  isSolverRunning: boolean
  feasible: boolean
  solution: FarmConfigSolution
}
const persistentProperties: Array<keyof FarmConfigState> = [
  "population", "globalAdjustment", "foodsInUse", "foodConsumptionReduction",
  "medicalSuppliesInUse", "diseaseProportion",
  "farmVariant", "fertilityTarget", "recipesInUse"
]

interface FarmConfigAction {
  setPopulation: (value: number | null) => void
  setGlobalAdjustment: (value: number | null) => void
  setFoodsInUse: (values: string[]) => void
  setFoodConsumptionReduction: (value: number | null) => void
  setMedicalSuppliesInUse: (value: MedicalSupplies) => void
  setDiseaseProportion: (value: number | null) => void
  setFarmVariant: (value: FarmVariant) => void
  setFertilityTarget: (value: number | null) => void
  setRecipesInUse: (value: string) => void
  updateSolution: () => void
  onSolverFinished: (result: FarmConfigSolution) => void
}

const emptyResult: FarmConfigSolution = {
  feasible: false,
  itemStatus: new Map(),
  recipeStatus: new Map()
}

const firstRecipes = Array.from(productRecipesByPrimaryProduct.entries())
  .filter(([primaryProduct, recipes]) => recipes.length > 1)
  .map(([primaryProduct, recipes]) => recipes[0].name)
const initialState: FarmConfigState = {
  population: 1000,
  globalAdjustment: 5,
  foodsInUse: ["Potato", "Corn", "Bread", "Vegetables"],
  foodConsumptionReduction: 0,
  medicalSuppliesInUse: MEDICAL_SUPPLIES.MedicalSupplies,
  diseaseProportion: 100,
  farmVariant: FARM_VARIANT.Farm,
  fertilityTarget: 0,
  recipesInUse: firstRecipes,

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
      setFoodConsumptionReduction: (value) => set((state) => {
        state.foodConsumptionReduction = value ?? 0
        updateSolutionDebounced()
      }),
      setMedicalSuppliesInUse: (value) => set((state) => {
        state.medicalSuppliesInUse = value
        updateSolutionDebounced()
      }),
      setDiseaseProportion: (value) => set((state) => {
        state.diseaseProportion = value ?? 0
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
      updateSolution: () => set((state) => {
        state.isSolverRunning = true
        updateSolution(get())
      }),
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
      version: 4,
      migrate: (persistedState: any, version) => {
        if (version < 2) {
          persistedState.foodConsumptionChange = persistedState.consumptionChange
          delete persistedState.consumptionChange
        }
        if (version < 3) {
          delete persistedState.foodConsumptionChange
          delete persistedState.medicalSuppliesConsumptionChange
        }
        if (version < 4) {
          delete persistedState.recipesInUse
        }
        return persistedState
      }
    })
)

function updateSolution(state: FarmConfigState & FarmConfigAction) {
  solveFarmConfig(
    state.population * (1 + state.globalAdjustment / 100),
    state.foodsInUse,
    state.foodConsumptionReduction / 100,
    state.medicalSuppliesInUse,
    state.diseaseProportion / 100,
    state.recipesInUse,
    state.farmVariant, state.fertilityTarget,
  ).then((result) => useFarmConfigStore.getState().onSolverFinished(result))
}
const updateSolutionDebounced = debounce(
  () => useFarmConfigStore.setState((state) => {
    state.isSolverRunning = true
    updateSolution(useFarmConfigStore.getState())
  }),
  UPDATE_SOLUTION_DELAY
)
