import { FarmVariant } from "./recipe";
import { solve } from "./solver";

export interface Params {
  requestId: string
  population: number
  demandAdjustment: number
  foodsInUse: string
  farmVariant: FarmVariant
  fertilityTarget: number
}

addEventListener("message", (event: MessageEvent<Params>) => {
  postMessage(
    solve(
      event.data.requestId, event.data.population, event.data.demandAdjustment,
      JSON.parse(event.data.foodsInUse), event.data.farmVariant, event.data.fertilityTarget
    )
  )
})
