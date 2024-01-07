import { produce } from "immer"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { useFarmConfigSolutionStore } from "./farmConfigSolutionStore"
import { MEDICAL_SUPPLIES, MedicalSupplies, allFoods } from "./item"
import { FARM_VARIANT, FarmVariant, productRecipesByName, productRecipesByPrimaryProduct } from "./recipe"

const LOCAL_STORAGE_NAME = "ryohpops.coi-settlement-planner-web.farm-config-input-store"
const OLD_LOCAL_STORAGE_NAME = "ryohpops.coi-settlement-planner-web"

if (typeof window !== "undefined") {
  const oldLocalStorage = localStorage.getItem(OLD_LOCAL_STORAGE_NAME)
  if (oldLocalStorage) {
    localStorage.setItem(LOCAL_STORAGE_NAME, oldLocalStorage)
    localStorage.removeItem(OLD_LOCAL_STORAGE_NAME)
  }
}

interface FarmConfigInputState {
  population: number
  globalAdjustment: number
  foodsInUse: string[]
  foodConsumptionChange: number
  medicalSuppliesInUse: MedicalSupplies
  diseaseProportion: number
  farmVariant: FarmVariant
  fertilityTarget: number
  recipesInUse: string[]
}

interface FarmConfigInputAction {
  setPopulation: (value: number | null) => void
  setGlobalAdjustment: (value: number | null) => void
  setFoodsInUse: (values: string[]) => void
  setFoodConsumptionChange: (value: number | null) => void
  setMedicalSuppliesInUse: (value: MedicalSupplies) => void
  setDiseaseProportion: (value: number | null) => void
  setFarmVariant: (value: FarmVariant) => void
  setFertilityTarget: (value: number | null) => void
  setRecipesInUse: (value: string) => void
}

const firstRecipes = Array.from(productRecipesByPrimaryProduct.entries())
  .filter(([primaryProduct, recipes]) => recipes.length > 1)
  .map(([primaryProduct, recipes]) => recipes[0].name)
const initialState: FarmConfigInputState = {
  population: 1000,
  globalAdjustment: 5,
  foodsInUse: ["Potato", "Corn", "Bread", "Vegetables"],
  foodConsumptionChange: 0,
  medicalSuppliesInUse: MEDICAL_SUPPLIES.MedicalSupplies,
  diseaseProportion: 100,
  farmVariant: FARM_VARIANT.Farm,
  fertilityTarget: 0,
  recipesInUse: firstRecipes
}

export const useFarmConfigInputStore = create<FarmConfigInputState & FarmConfigInputAction>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      setPopulation: (value) => set((state) => {
        state.population = value ?? 0
        useFarmConfigSolutionStore.getState().updateSolutionDebounced()
      }),
      setGlobalAdjustment: (value) => set((state) => {
        state.globalAdjustment = value ?? 0
        useFarmConfigSolutionStore.getState().updateSolutionDebounced()
      }),
      setFoodsInUse: (values) => set((state) => {
        state.foodsInUse = values.filter((key) => allFoods.has(key))
        useFarmConfigSolutionStore.getState().updateSolutionDebounced()
      }),
      setFoodConsumptionChange: (value) => set((state) => {
        state.foodConsumptionChange = value ?? 0
        useFarmConfigSolutionStore.getState().updateSolutionDebounced()
      }),
      setMedicalSuppliesInUse: (value) => set((state) => {
        state.medicalSuppliesInUse = value
        useFarmConfigSolutionStore.getState().updateSolutionDebounced()
      }),
      setDiseaseProportion: (value) => set((state) => {
        state.diseaseProportion = value ?? 0
        useFarmConfigSolutionStore.getState().updateSolutionDebounced()
      }),
      setFarmVariant: (value) => set((state) => {
        state.farmVariant = value
        useFarmConfigSolutionStore.getState().updateSolutionDebounced()
      }),
      setFertilityTarget: (value) => set((state) => {
        state.fertilityTarget = value ?? 0
        useFarmConfigSolutionStore.getState().updateSolutionDebounced()
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
        useFarmConfigSolutionStore.getState().updateSolutionDebounced()
      })
    })),
    {
      name: LOCAL_STORAGE_NAME,
      merge: (persistedState, currentState) => {
        return produce(currentState, (state: any) => Object.assign(state, persistedState))
      },
      version: 5,
      migrate: migratePersistedState
    })
)

function migratePersistedState(persistedState: any, version: number) {
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
  if (version < 5) {
    persistedState.foodConsumptionChange = -persistedState.foodConsumptionReduction
    delete persistedState.foodConsumptionReduction
  }
  return persistedState
}
