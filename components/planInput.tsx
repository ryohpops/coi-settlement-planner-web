import { Tabs } from "antd"
import { useEffect } from "react"
import { useFarmConfigSolutionStore } from "../domain/farmConfigSolutionStore"
import ConfigInputForm from "./planInput/configInputForm"
import DemandInputForm from "./planInput/demandInputForm"

export default function PlanInput() {
  const updateSolution = useFarmConfigSolutionStore().updateSolution

  useEffect(() => updateSolution(), [updateSolution])

  return (
    <Tabs defaultActiveKey="demands" items={[
      { key: "demands", label: "Demands", children: <DemandInputForm /> },
      { key: "config", label: "Config", children: <ConfigInputForm /> },
    ]} />
  )
}
