import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import { Card, Space } from "antd"
import { useFarmConfigInputStore } from "../domain/farmConfigInputStore"
import { useFarmConfigSolutionStore } from "../domain/farmConfigSolutionStore"

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

  return (
    <>
      <Card
        title={data.name} size="small"
        style={{ width: RecipeResultNodeWidth, height: RecipeResultNodeHeight }}
      >
        <Space direction="vertical">
          {`Need ${Math.ceil(recipe.times * 100) / 100} building(s)`}
        </Space>
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
