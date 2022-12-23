import { Card } from "antd"
import { Handle, NodeProps, Position } from "reactflow"
import { RecipeResult } from "../domain/solver"

export const RecipeResultNodeWidth = 300
export const RecipeResultNodeHeight = 200

export default function RecipeResultNode({ data }: NodeProps<RecipeResult>) {
  return (
    <>
      <Card
        title={`Produce ${data.recipe.name}`} size="small"
        style={{ width: RecipeResultNodeWidth, height: RecipeResultNodeHeight }}
      >
        {`Count: ${data.times}`}
      </Card>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  )
}
