import { Card, Radio, Space } from "antd"
import { Handle, NodeProps, Position } from "reactflow"
import { useFarmConfigStore } from "../domain/farmConfigStore"
import { productRecipesByPrimaryProduct } from "../domain/recipe"
import { RecipeStatus } from "../domain/farmConfigSolver"

export const RecipeResultNodeWidth = 300
export const RecipeResultNodeHeight = 200

export default function RecipeResultNode({ data }: NodeProps<RecipeStatus>) {
  const problemStore = useFarmConfigStore()

  let selector: JSX.Element | undefined = undefined
  if (data.recipeSpec.primaryProduct) {
    const recipesForProduct = productRecipesByPrimaryProduct.get(data.recipeSpec.primaryProduct)
    if (recipesForProduct && recipesForProduct.length > 1) {
      const selection = recipesForProduct.map((recipe) => recipe.name)
        .map((recipeName) => <Radio key={recipeName} value={recipeName}>{recipeName}</Radio>)
      selector = (
        <Radio.Group
          value={data.recipeSpec.name}
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
        title={data.recipeSpec.name} size="small"
        style={{ width: RecipeResultNodeWidth, height: RecipeResultNodeHeight }}
      >
        {`Need ${Math.ceil(data.times * 100) / 100} building(s)`}
        {selector}
      </Card>
      <Handle
        type="target" position={Position.Left}
        hidden={data.recipeSpec.ingredients.size === 0}
      />
      <Handle
        type="source" position={Position.Right}
        hidden={data.recipeSpec.products.size === 0}
      />
    </>
  )
}
