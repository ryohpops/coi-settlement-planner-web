export const productSolverEndpoint = "/api/solver/product"
export const farmSolverEndpoint = "/api/solver/farm"

export interface Recipe {
  name: string
  products: { [name: string]: number }
  ingredients: { [name: string]: number }
}
export interface Demands {
  [name: string]: number
}

export interface ProductSolverInput {
  recipes: Recipe[]
  demands: Demands
  crops: string[]
}

export interface FarmSolverInput {
  recipes: Recipe[]
  demands: Demands
}

export interface SolveResult {
  isSolved: boolean
  result?: { [name: string]: number }
}

export async function callProductSolver(recipes: Recipe[], demands: Demands, crops: string[]): Promise<SolveResult> {
  return callSolver(productSolverEndpoint, { recipes: recipes, demands: demands, crops: crops })
}

export async function callFarmSolver(recipes: Recipe[], demands: Demands): Promise<SolveResult> {
  return callSolver(farmSolverEndpoint, { recipes: recipes, demands: demands })
}

async function callSolver(endpoint: string, data: ProductSolverInput | FarmSolverInput): Promise<SolveResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  if (response.ok) {
    return await response.json()
  } else {
    throw new Error("Failed to call Solver API.")
  }
}
