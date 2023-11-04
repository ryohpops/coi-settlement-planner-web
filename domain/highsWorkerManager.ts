import { HighsSolution } from "highs"

let highsWorker: Worker

export function solve(problem: string): Promise<HighsSolution> {
  if (!highsWorker) {
    highsWorker = new Worker(new URL("./highsWorker", import.meta.url))
  }

  return new Promise<HighsSolution>((resolve) => {
    highsWorker.onmessage = (e) => {
      resolve(e.data)
    }
    highsWorker.onerror = (e) => {
      console.log(e)
    }
    highsWorker.postMessage(problem)
  })
}
