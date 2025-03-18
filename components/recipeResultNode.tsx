import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import { Card, Radio, Space } from "antd"
import type { JSX } from "react"
import { useFarmConfigInputStore } from "../domain/farmConfigInputStore"
import { useFarmConfigSolutionStore } from "../domain/farmConfigSolutionStore"
import { productRecipesByPrimaryProduct } from "../domain/recipe"

export const RecipeResultNodeWidth = 300
export const RecipeResultNodeHeight = 200

export type RecipeResultReference = Node<{ name: string }, "recipeResult">

export default function RecipeResultNode({ data }: NodeProps<RecipeResultReference>) {
  const inputStore = useFarmConfigInputStore()
  const answer = useFarmConfigSolutionStore((state) => state.solution)

  const recipe = answer.recipeStatus.get(data.name)
  if (!recipe) {
    return null
  }

  let selector: JSX.Element | undefined = undefined
  if (recipe && recipe.recipeSpec.primaryProduct) {
    const recipesForProduct = productRecipesByPrimaryProduct.get(recipe.recipeSpec.primaryProduct)
    if (recipesForProduct && recipesForProduct.length > 1) {
      const selection = recipesForProduct.map((recipe) => recipe.name)
        .map((recipeName) => <Radio key={recipeName} value={recipeName}>{recipeName}</Radio>)
      selector = (
        <Radio.Group
          value={recipe.recipeSpec.name}
          onChange={(e) => inputStore.setRecipesInUse(e.target.value)}
        >
          <Space direction="vertical">
            {selection}
          </Space>
        </Radio.Group>
      )
    }
  }

  return (
    <>
      <Card
        title={data.name} size="small"
        style={{ width: RecipeResultNodeWidth, height: RecipeResultNodeHeight }}
      >
        {`Need ${Math.ceil(recipe.times * 100) / 100} building(s)`}
        {selector}
      </Card>
      <Handle
        type="target" position={Position.Left}
        hidden={recipe.recipeSpec.ingredients.size === 0}
      />
      <Handle
        type="source" position={Position.Right}
        hidden={recipe.recipeSpec.products.size === 0}
      />
    </>
  )
}
