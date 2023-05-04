import { Tree } from "antd"
import { DataNode } from "antd/es/tree"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import { allFoods, categories } from "../domain/item"
import { useFarmConfigStore } from "../domain/farmConfigStore"

function FoodsInUseSelector() {
  const treeData = useMemo(() => createTreeData(), [])

  const foodsInUse = useFarmConfigStore((state) => state.foodsInUse)
  const setFoodsInUse = useFarmConfigStore((state) => state.setFoodsInUse)

  return (
    <Tree
      selectable={false} checkable treeData={treeData}
      defaultExpandAll
      checkedKeys={foodsInUse}
      onCheck={(keys) => setFoodsInUse(keys as string[])}
    />
  )
}
export default dynamic(() => Promise.resolve(FoodsInUseSelector), { ssr: false })

function createTreeData(): DataNode[] {
  const treeData: DataNode[] = []
  const parentKeys: (string | number)[] = []

  const foods: DataNode = { key: "Foods", title: "Foods", children: [] }
  treeData.push(foods)
  parentKeys.push(foods.key)
  categories
    .map<DataNode>((category) => (
      { key: category, title: category, children: [] }
    ))
    .forEach((node) => {
      foods.children!.push(node)
      parentKeys.push(node.key)
    })
  allFoods.forEach((item, name) => {
    foods.children!.find((node) => node.key === item.category)
      ?.children!.push({ key: name, title: name })
  })
  return treeData
}
