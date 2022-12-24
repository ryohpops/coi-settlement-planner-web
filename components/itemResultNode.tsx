import { Card } from "antd"
import { Chart } from "react-google-charts"
import { Handle, NodeProps, Position } from "reactflow"
import { ItemResult } from "../domain/solver"

export const ItemResultNodeWidth = 300
export const ItemResultNodeHeight = 200

const options = {
  chartArea: { width: "80%" },
  isStacked: true,
  hAxis: {
    minValue: 0,
  },
  legend: { position: "none" }
}

export default function ItemResultNode({ data }: NodeProps<ItemResult>) {
  const items: string[] = ["Item"]
  const ins: (string | number)[] = ["In"]
  const outs: (string | number)[] = ["Out"]

  data.ins.forEach((amount, relation) => {
    items.push(`From ${relation}`)
    ins.push(amount)
    outs.push(0)
  })
  data.outs.forEach((amount, relation) => {
    items.push(`To ${relation}`)
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
      {data.ins.size > 0 &&
        <Handle type="target" position={Position.Left} />
      }
      {data.outs.size > 0 &&
        <Handle type="source" position={Position.Right} />
      }
    </>
  )
}
