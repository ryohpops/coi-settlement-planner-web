import { HighsSolution } from "highs"

export function solve(problem: string): Promise<HighsSolution> {
  return new Promise<HighsSolution>((resolve) => {
    const highsWorker = new Worker(new URL("./highsWorker", import.meta.url))
    highsWorker.onmessage = (e) => {
      resolve(e.data)
      highsWorker.terminate()
    }
    highsWorker.onerror = (e) => {
      console.log(e)
      highsWorker.terminate()
    }
    highsWorker.postMessage(problem)
  })
}
