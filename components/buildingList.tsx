import { Button, Modal, Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { useState } from "react"
import { Node } from "reactflow"
import { RecipeResult } from "../domain/solver"

interface BuildingListData {
  key: string
  name: string
  count: number
}

const columns: ColumnsType<BuildingListData> = [
  {
    title: "Recipe",
    dataIndex: "name"
  },
  {
    title: "Count",
    dataIndex: "count"
  }
]

interface BuildingListProps {
  nodes: Node<RecipeResult>[]
}

export default function BuildingList(props: BuildingListProps) {
  const [isOpen, setIsOpen] = useState(false)

  const data = props.nodes
    .sort((a, b) => b.data.times - a.data.times)
    .sort((a, b) => (a.data.recipe.primaryProduct ? 1 : 0) - (b.data.recipe.primaryProduct ? 1 : 0))
    .map<BuildingListData>((node) => ({
      key: node.data.recipe.name,
      name: node.data.recipe.name,
      count: Math.ceil(node.data.times * 100) / 100
    }))

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Show Building List</Button>
      <Modal
        title="Building List"
        open={isOpen}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsOpen(false)}>Close</Button>
        ]}
        onCancel={() => setIsOpen(false)}
      >
        <Table
          size="small"
          pagination={{ pageSize: 50 }} scroll={{ y: "60vh" }}
          dataSource={data} columns={columns} />
      </Modal>
    </>
  )
}
