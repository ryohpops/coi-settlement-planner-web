import { Table } from "antd"
import { ColumnsType } from "antd/es/table"
import { useFarmConfigSolutionStore } from "../domain/farmConfigSolutionStore"

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

export default function BuildingList() {
  const answer = useFarmConfigSolutionStore((state) => state.solution)

  const data = Array.from(answer.recipeStatus.entries())
    .sort(([aName, aStatus], [bName, bStatus]) => bStatus.times - aStatus.times)
    .sort(([aName, aStatus], [bName, bStatus]) => (aStatus.recipeSpec.primaryProduct ? 1 : 0) - (bStatus.recipeSpec.primaryProduct ? 1 : 0))
    .map<BuildingListData>(([name, status]) => ({
      key: name,
      name: name,
      count: Math.ceil(status.times * 100) / 100
    }))

  return (
    <Table
      size="small" pagination={{ pageSize: 50 }}
      dataSource={data} columns={columns} />
  )
}
