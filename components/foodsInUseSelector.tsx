import { Tree, TreeDataNode } from "antd"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import { ALL_ITEMS } from "../constants/item"
import { useFarmConfigInputStore } from "../domain/farmConfigInputStore"

function FoodsInUseSelector() {
  const treeData = useMemo(() => createTreeData(), [])

  const foodsInUse = useFarmConfigInputStore((state) => state.foodsInUse)
  const setFoodsInUse = useFarmConfigInputStore((state) => state.setFoodsInUse)

  return (
    <Tree
      selectable={false} checkable treeData={treeData}
      defaultExpandAll
      checkedKeys={foodsInUse}
      onCheck={(keys) => setFoodsInUse((keys as string[]).filter((key) => !treeData.some((categoryNode) => categoryNode.key === key)))}
    />
  )
}
export default dynamic(() => Promise.resolve(FoodsInUseSelector), { ssr: false })

function createTreeData(): TreeDataNode[] {
  const treeData: Record<string, string[]> = {}

  ALL_ITEMS.filter((item) => item.isFood).forEach((food) => {
    if (food.foodCategory in treeData) {
      treeData[food.foodCategory].push(food.name)
    } else {
      treeData[food.foodCategory] = [food.name]
    }
  })

  return Object.entries(treeData).map(([category, foods]) => {
    return { key: category, title: category, checkable: false, children: foods.map((food) => ({ key: food, title: food })) }
  })
}
