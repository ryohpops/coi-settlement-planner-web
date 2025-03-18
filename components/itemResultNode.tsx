import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import { Card } from "antd"
import { Chart } from "react-google-charts"
import { useFarmConfigSolutionStore } from "../domain/farmConfigSolutionStore"
import { VIRTUAL_ITEM } from "../domain/item"

export const ItemResultNodeWidth = 300
export const ItemResultNodeHeight = 200

const options = {
  chartArea: { left: 24, top: 6, width: "80%", height: "80%" },
  isStacked: true,
  hAxis: {
    minValue: 0,
  },
  legend: { position: "none" }
}

export type ItemResultReference = Node<{ name: string }, "itemResult">

export default function ItemResultNode({ data }: NodeProps<ItemResultReference>) {
  const answer = useFarmConfigSolutionStore((state) => state.solution)

  const items: string[] = ["Item"]
  const ins: (string | number)[] = ["In"]
  const outs: (string | number)[] = ["Out"]

  const item = answer.itemStatus.get(data.name)
  if (!item) {
    return null
  }

  item.ins.forEach((amount, relation) => {
    items.push(relation)
    ins.push(amount)
    outs.push(0)
  })
  item.outs.forEach((amount, relation) => {
    items.push(relation)
    ins.push(0)
    outs.push(amount)
  })

  return (
    <>
      <Card
        title={data.name} size="small"
        style={{ width: ItemResultNodeWidth, height: ItemResultNodeHeight }}
        styles={{ body: { height: "80%" } }}
      >
        <Chart
          chartType="BarChart" width="100%" height="100%"
          data={[items, ins, outs]} options={options}
        />
      </Card>
      <Handle
        type="target" position={Position.Left}
        hidden={item.ins.size === 0}
      />
      <Handle
        type="source" position={Position.Right}
        hidden={item.outs.size === 0 || (item.outs.size === 1 && item.outs.has(VIRTUAL_ITEM.Demand))}
      />
    </>
  )
}
