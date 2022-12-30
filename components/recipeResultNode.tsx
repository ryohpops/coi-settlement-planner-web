import { Card, Radio, Space } from "antd"
import { Handle, NodeProps, Position } from "reactflow"
import { useProblemStore } from "../domain/problemStore"
import { productRecipesByPrimaryProduct } from "../domain/recipe"
import { RecipeResult } from "../domain/solver"

export const RecipeResultNodeWidth = 300
export const RecipeResultNodeHeight = 200

export default function RecipeResultNode({ data }: NodeProps<RecipeResult>) {
  const problemStore = useProblemStore()

  let selector: JSX.Element | undefined = undefined
  if (data.recipe.primaryProduct) {
    const recipesForProduct = productRecipesByPrimaryProduct.get(data.recipe.primaryProduct)
    if (recipesForProduct && recipesForProduct.length > 1) {
      const selection = recipesForProduct.map((recipe) => recipe.name)
        .map((recipeName) => <Radio key={recipeName} value={recipeName}>{recipeName}</Radio>)
      selector = (
        <Radio.Group
          value={data.recipe.name}
          onChange={(e) => problemStore.setRecipesInUse(e.target.value)}
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
        title={data.recipe.name} size="small"
        style={{ width: RecipeResultNodeWidth, height: RecipeResultNodeHeight }}
      >
        {`Need ${Math.ceil(data.times * 100) / 100} building(s)`}
        {selector}
      </Card>
      <Handle
        type="target" position={Position.Left}
        hidden={data.recipe.ingredients.size === 0}
      />
      <Handle
        type="source" position={Position.Right}
        hidden={data.recipe.products.size === 0}
      />
    </>
  )
}
