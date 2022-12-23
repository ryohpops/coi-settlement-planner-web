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

  export interface SingleGoalModel {
    optimize: string
    opType?: OpType
    constraints: Constraints
    variables: Variables
    ints?: Ints
    options?: Options
  }
  export interface MultipleGoalModel {
    optimize: { [variable: string]: OpType }
    constraints: Constraints
    variables: Variables
    ints?: Ints
    options?: Options
  }
  export interface Options {
    timeout: number
    tolerance: number
  }

  export interface SingleGoalResult {
    feasible: boolean
    [variable: string]: number
    result: number
  }
  export interface MultipleGoalResult {
    midpoint: SingleGoalResult
  }

  function Solve(model: SingleGoalModel): SingleGoalResult
  function Solve(model: MultipleGoalModel): MultipleGoalResult
}
