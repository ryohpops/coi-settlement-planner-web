import { produce } from "immer"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { FACTORY_BY_CATEGORY, FACTORY_BY_NAME } from "../constants/entity"
import { MEDICAL_SUPPLIES, MedicalSupplies } from "../constants/item"
import { useFarmConfigSolutionStore } from "./farmConfigSolutionStore"

const LOCAL_STORAGE_NAME =
  "ryohpops.coi-settlement-planner-web.farm-config-input-store"
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
  farmVariant: string
  fertilityTarget: number
  factoriesInUse: string[]
}

interface FarmConfigInputAction {
  setPopulation: (value: number | null) => void
  setGlobalAdjustment: (value: number | null) => void
  setFoodsInUse: (values: string[]) => void
  setFoodConsumptionChange: (value: number | null) => void
  setMedicalSuppliesInUse: (value: MedicalSupplies) => void
  setDiseaseProportion: (value: number | null) => void
  setFarmVariant: (value: string) => void
  setFertilityTarget: (value: number | null) => void
  changeFactoriesInUse: (value: string) => void
}

const initialState: FarmConfigInputState = {
  population: 1000,
  globalAdjustment: 5,
  foodsInUse: ["Potato", "Corn", "Bread", "Vegetables"],
  foodConsumptionChange: 0,
  medicalSuppliesInUse: MEDICAL_SUPPLIES.MedicalSupplies,
  diseaseProportion: 100,
  farmVariant: "Farm",
  fertilityTarget: 0,
  factoriesInUse: Object.keys(FACTORY_BY_CATEGORY).map(
    (category) => FACTORY_BY_CATEGORY[category]![0].name // use the first variant in each category
  ),
}

export const useFarmConfigInputStore = create<
  FarmConfigInputState & FarmConfigInputAction
>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      setPopulation: (value) =>
        set((state) => {
          state.population = value ?? 0
          useFarmConfigSolutionStore.getState().updateSolutionDebounced()
        }),
      setGlobalAdjustment: (value) =>
        set((state) => {
          state.globalAdjustment = value ?? 0
          useFarmConfigSolutionStore.getState().updateSolutionDebounced()
        }),
      setFoodsInUse: (value) =>
        set((state) => {
          state.foodsInUse = value
          useFarmConfigSolutionStore.getState().updateSolutionDebounced()
        }),
      setFoodConsumptionChange: (value) =>
        set((state) => {
          state.foodConsumptionChange = value ?? 0
          useFarmConfigSolutionStore.getState().updateSolutionDebounced()
        }),
      setMedicalSuppliesInUse: (value) =>
        set((state) => {
          state.medicalSuppliesInUse = value
          useFarmConfigSolutionStore.getState().updateSolutionDebounced()
        }),
      setDiseaseProportion: (value) =>
        set((state) => {
          state.diseaseProportion = value ?? 0
          useFarmConfigSolutionStore.getState().updateSolutionDebounced()
        }),
      setFarmVariant: (value) =>
        set((state) => {
          state.farmVariant = value
          useFarmConfigSolutionStore.getState().updateSolutionDebounced()
        }),
      setFertilityTarget: (value) =>
        set((state) => {
          state.fertilityTarget = value ?? 0
          useFarmConfigSolutionStore.getState().updateSolutionDebounced()
        }),
      changeFactoriesInUse: (factoryName) =>
        set((state) => {
          const changedCategory = FACTORY_BY_NAME[factoryName].category
          const variantsInChangedCategory = FACTORY_BY_CATEGORY[
            changedCategory
          ]!.map((f) => f.name)

          // Filter out the variant in the same category then add the selected factory
          state.factoriesInUse = state.factoriesInUse
            .filter(
              (name) => !variantsInChangedCategory.includes(name) === false
            )
            .concat(factoryName)
          useFarmConfigSolutionStore.getState().updateSolutionDebounced()
        }),
    })),
    {
      name: LOCAL_STORAGE_NAME,
      merge: (persistedState, currentState) => {
        return produce(currentState, (state: any) =>
          Object.assign(state, persistedState)
        )
      },
      version: 1,
      migrate: migratePersistedState,
    }
  )
)

function migratePersistedState(persistedState: any, version: number) {
  if (version < 1) {
    // placeholder for future migrations
  }
  return persistedState
}
