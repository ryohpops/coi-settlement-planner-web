import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import { Card } from "antd"
import { ApexOptions } from "apexcharts"
import { isArray, isNumber } from "lodash"
import dynamic from "next/dynamic"
import { useFarmConfigSolutionStore } from "../domain/farmConfigSolutionStore"
import { VIRTUAL_ITEM } from "../domain/item"
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export const ItemResultNodeWidth = 300
export const ItemResultNodeHeight = 200
const formatOptions = { minimumFractionDigits: 1, maximumFractionDigits: 1 }
const xAxisMaxMargin = 1.3

function createChartOptions(xAxisMax: number): ApexOptions {
  return {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          total: {
            enabled: true,
            offsetX: 4,
          },
        },
      },
    },
    xaxis: {
      categories: ["In", "Out"],
      min: 0,
      max: xAxisMax,
    },
    dataLabels: {
      enabled: false,
      formatter: (val, opts) => {
        if (isArray(val)) {
          return val.map((v) => v.toLocaleString(undefined, formatOptions))
        } else if (isNumber(val)) {
          return val.toLocaleString(undefined, formatOptions)
        } else {
          return val
        }
      },
    },
    tooltip: {
      y: {
        formatter(val, opts) {
          return val.toLocaleString(undefined, formatOptions)
        },
      },
    },
    legend: {
      show: false,
    },
  }
}

export type ItemResultReference = Node<{ name: string }, "itemResult">

export default function ItemResultNode({ data }: NodeProps<ItemResultReference>) {
  const answer = useFarmConfigSolutionStore((state) => state.solution)

  const item = answer.itemStatus.get(data.name)
  if (!item) {
    return null
  }

  const series: ApexAxisChartSeries = []
  let totalIn = 0
  let totalOut = 0
  item.ins.forEach((amount, relation) => {
    series.push({
      name: relation,
      data: [amount, 0],
    })
    totalIn += amount
  })
  item.outs.forEach((amount, relation) => {
    series.push({
      name: relation,
      data: [0, amount],
    })
    totalOut += amount
  })
  const chartOptions = createChartOptions(Math.max(totalIn, totalOut) * xAxisMaxMargin)

  return (
    <>
      <Card
        title={data.name} size="small"
        style={{ width: ItemResultNodeWidth, height: ItemResultNodeHeight }}
        styles={{ body: { height: "80%" } }}
      >
        <Chart type="bar" height="100%" options={chartOptions} series={series} />
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
