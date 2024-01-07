import { Col, Divider, Form, InputNumber, Radio, Row, Slider, Space } from "antd"
import { SliderMarks } from "antd/es/slider"
import dynamic from "next/dynamic"
import { useEffect } from "react"
import { useFarmConfigInputStore } from "../domain/farmConfigInputStore"
import { useFarmConfigSolutionStore } from "../domain/farmConfigSolutionStore"
import { MEDICAL_SUPPLIES } from "../domain/item"
import { FARM_VARIANT } from "../domain/recipe"
import FoodsInUseSelector from "./foodsInUseSelector"

const fertilityTargetMarks: SliderMarks = {
  0: "0%",
  100: "100%",
  140: "140%"
}

function PlanInput() {
  const inputStore = useFarmConfigInputStore()
  const updateSolution = useFarmConfigSolutionStore().updateSolution

  useEffect(() => updateSolution(), [updateSolution])

  return (
    <Form layout="vertical">
      <Divider orientation="left">Demands</Divider>
      <Form.Item label="Population">
        <InputNumber
          min={0}
          value={inputStore.population}
          onChange={(value) => inputStore.setPopulation(value)}
        />
      </Form.Item>
      <Form.Item
        label="Global adjustment"
        tooltip="Produce every item x% more for safety margin. To compensate calculation errors, Leave this at 5% is recommended."
      >
        <InputNumber
          addonAfter="%"
          value={inputStore.globalAdjustment}
          onChange={(value) => inputStore.setGlobalAdjustment(value)}
        />
      </Form.Item>

      <Divider orientation="left">Foods in use</Divider>
      <Form.Item>
        <FoodsInUseSelector />
      </Form.Item>
      <Form.Item
        label="Total food consumption change by edicts"
        tooltip="Enter the sum of edicts' effect.">
        <InputNumber
          min={-100} max={100} step={5}
          addonAfter="%"
          value={inputStore.foodConsumptionChange}
          onChange={(value) => inputStore.setFoodConsumptionChange(value)}
        />
      </Form.Item>

      <Divider orientation="left">Medical supply in use</Divider>
      <Form.Item>
        <Radio.Group
          value={inputStore.medicalSuppliesInUse}
          onChange={(e) => inputStore.setMedicalSuppliesInUse(e.target.value)}
        >
          <Space direction="vertical">
            <Radio value={MEDICAL_SUPPLIES.None}>None</Radio>
            <Radio value={MEDICAL_SUPPLIES.MedicalSupplies}>Medical Supplies</Radio>
            <Radio value={MEDICAL_SUPPLIES.MedicalSupplies2}>Medical Supplies II</Radio>
            <Radio value={MEDICAL_SUPPLIES.MedicalSupplies3}>Medical Supplies III</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        label="Estimated proportion of disease period"
        tooltip="Proportion of the time with ongoing disease."
      >
        <Row>
          <Col span={18} style={{ paddingRight: "1em" }}>
            <Slider
              min={0} max={100} step={10}
              tooltip={{ open: false }}
              value={inputStore.diseaseProportion}
              onChange={(value) => inputStore.setDiseaseProportion(value)}
            />
          </Col>
          <Col span={6}>
            <InputNumber
              min={0} max={100} step={10} addonAfter="%"
              value={inputStore.diseaseProportion}
              onChange={(value) => inputStore.setDiseaseProportion(value)}
            />
          </Col>
        </Row>
      </Form.Item>

      <Divider orientation="left">Farm</Divider>
      <Form.Item>
        <Radio.Group
          value={inputStore.farmVariant}
          onChange={(e) => inputStore.setFarmVariant(e.target.value)}
        >
          <Space direction="vertical">
            <Radio value={FARM_VARIANT.Farm}>Farm / Irrigated Farm</Radio>
            <Radio value={FARM_VARIANT.Greenhouse}>Greenhouse</Radio>
            <Radio value={FARM_VARIANT.Greenhouse2}>Greenhouse II</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Fertility target">
        <Row>
          <Col span={18} style={{ paddingRight: "1em" }}>
            <Slider
              min={0} max={140} step={10}
              marks={fertilityTargetMarks} tooltip={{ open: false }}
              value={inputStore.fertilityTarget}
              onChange={(value) => inputStore.setFertilityTarget(value)}
            />
          </Col>
          <Col span={6}>
            <InputNumber
              min={0} max={140} step={10} addonAfter="%"
              value={inputStore.fertilityTarget}
              onChange={(value) => inputStore.setFertilityTarget(value)}
            />
          </Col>
        </Row>
      </Form.Item>
    </Form>
  )
}
export default dynamic(() => Promise.resolve(PlanInput), { ssr: false })
