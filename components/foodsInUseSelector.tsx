import { Tree } from "antd"
import { Key } from "antd/es/table/interface"
import { DataNode } from "antd/es/tree"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import { useFarmConfigInputStore } from "../domain/farmConfigInputStore"
import { allFoods, categories } from "../domain/item"

function FoodsInUseSelector() {
  const treeData = useMemo(() => createTreeData(), [])

  const foodsInUse = useFarmConfigInputStore((state) => state.foodsInUse)
  const setFoodsInUse = useFarmConfigInputStore((state) => state.setFoodsInUse)

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
  const parentKeys: Key[] = []

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
