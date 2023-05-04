import { Card } from "antd"
import { Chart } from "react-google-charts"
import { Handle, NodeProps, Position } from "reactflow"
import { VIRTUAL_ITEM } from "../domain/item"
import { ItemStatus } from "../domain/farmConfigSolver"

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

export default function ItemResultNode({ data }: NodeProps<ItemStatus>) {
  const items: string[] = ["Item"]
  const ins: (string | number)[] = ["In"]
  const outs: (string | number)[] = ["Out"]

  data.ins.forEach((amount, relation) => {
    items.push(relation)
    ins.push(amount)
    outs.push(0)
  })
  data.outs.forEach((amount, relation) => {
    items.push(relation)
    ins.push(0)
    outs.push(amount)
  })

  return (
    <>
      <Card
        title={data.item.name} size="small"
        style={{ width: ItemResultNodeWidth, height: ItemResultNodeHeight }}
        bodyStyle={{ height: "80%" }}
      >
        <Chart
          chartType="BarChart" width="100%" height="100%"
          data={[items, ins, outs]} options={options}
        />
      </Card>
      <Handle
        type="target" position={Position.Left}
        hidden={data.ins.size === 0}
      />
      <Handle
        type="source" position={Position.Right}
        hidden={data.outs.size === 0 || (data.outs.size === 1 && data.outs.has(VIRTUAL_ITEM.Demand))}
      />
    </>
  )
}
