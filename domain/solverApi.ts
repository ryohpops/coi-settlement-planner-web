export const endpoint = "/api/solve"

export interface Recipe {
  name: string
  products: { [name: string]: number }
  ingredients: { [name: string]: number }
}

export interface SolveInput {
  recipes: Recipe[]
  demands: { [name: string]: number }
}

export interface SolveResult {
  isSolved: boolean
  result?: { [name: string]: number }
}
