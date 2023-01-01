import { Tree } from "antd";
import { DataNode } from "antd/es/tree";
import { useEffect, useMemo, useState } from "react";
import { allFoods, categories } from "../domain/item";
import { useProblemStore } from "../domain/problemStore";

export default function FoodsInUseSelector() {
  const [treeData, parentKeys] = useMemo(() => createTreeData(), [])

  const foodsInUse = useProblemStore((state) => state.foodsInUse)
  const setFoodsInUse = useProblemStore((state) => state.setFoodsInUse)
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>([])

  // Avoid tree checkboxes out of sync problem on load
  useEffect(() => setExpandedKeys(parentKeys), [])

  return (
    <Tree
      selectable={false} checkable treeData={treeData}
      checkedKeys={foodsInUse}
      onCheck={(keys) => setFoodsInUse(keys as string[])}
      expandedKeys={expandedKeys}
      onExpand={(expandedKeys) => setExpandedKeys(expandedKeys)}
    />
  )
}

function createTreeData(): [DataNode[], (string | number)[]] {
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
  return [treeData, parentKeys]
}
