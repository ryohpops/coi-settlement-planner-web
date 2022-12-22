declare module "javascript-lp-solver" {
  export type OpType = "min" | "max"
  export type ConstraintsOfVariable = {
    min?: number
    max?: number
    equal?: number
  }
  export type CoefficientsOfVariable = { [variable: string]: number }

  export type Constraints = { [variable: string]: ConstraintsOfVariable }
  export type Variables = { [name: string]: CoefficientsOfVariable }
  export type Ints = { [variable: string]: 1 }

  export interface Model {
    optimize: string | { [variable: string]: OpType }
    opType?: OpType
    constraints: Constraints
    variables: Variables
    ints?: Ints
    options?: Options
  }
  export interface Options {
    timeout: number
    tolerance: number
  }

  export interface Result {
    feasible: boolean
    [variable: string]: number
    result: number
  }

  function Solve(model: Model): Result
}
