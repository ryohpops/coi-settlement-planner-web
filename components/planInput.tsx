import { Col, Divider, Form, InputNumber, Radio, Row, Slider, Space } from "antd"
import { SliderMarks } from "antd/es/slider"
import dynamic from "next/dynamic"
import { useEffect } from "react"
import shallow from "zustand/shallow"
import { MEDICAL_SUPPLIES } from "../domain/item"
import { useFarmConfigStore } from "../domain/farmConfigStore"
import { FARM_VARIANT } from "../domain/recipe"
import FoodsInUseSelector from "./foodsInUseSelector"

const fertilityTargetMarks: SliderMarks = {
  0: "0%",
  100: "100%",
  150: "150%"
}

function PlanInput() {
  const problemStore = useFarmConfigStore((state) => ({
    population: state.population,
    setPopulation: state.setPopulation,
    globalAdjustment: state.globalAdjustment,
    setGlobalAdjustment: state.setGlobalAdjustment,
    foodConsumptionReduction: state.foodConsumptionReduction,
    setFoodConsumptionReduction: state.setFoodConsumptionReduction,
    medicalSuppliesInUse: state.medicalSuppliesInUse,
    setMedicalSuppliesInUse: state.setMedicalSuppliesInUse,
    diseaseProportion: state.diseaseProportion,
    setDiseaseProportion: state.setDiseaseProportion,
    farmVariant: state.farmVariant,
    setFarmVariant: state.setFarmVariant,
    fertilityTarget: state.fertilityTarget,
    setFertilityTarget: state.setFertilityTarget,
    updateAnswer: state.updateSolution
  }), shallow)

  useEffect(() => problemStore.updateAnswer(), [])

  return (
    <Form layout="vertical">
      <Divider orientation="left">Demands</Divider>
      <Form.Item label="Population">
        <InputNumber
          min={0}
          value={problemStore.population}
          onChange={(value) => problemStore.setPopulation(value)}
        />
      </Form.Item>
      <Form.Item
        label="Global adjustment"
        tooltip="Produce every item x% more for safety margin. To compensate calculation errors, Leave this at 5% is recommended."
      >
        <InputNumber
          addonAfter="%"
          value={problemStore.globalAdjustment}
          onChange={(value) => problemStore.setGlobalAdjustment(value)}
        />
      </Form.Item>

      <Divider orientation="left">Foods in use</Divider>
      <Form.Item>
        <FoodsInUseSelector />
      </Form.Item>
      <Form.Item
        label="Total food consumption reduction by edicts"
        tooltip="Enter the sum of edicts' effect.">
        <InputNumber
          min={0} max={100} step={10}
          addonAfter="%"
          value={problemStore.foodConsumptionReduction}
          onChange={(value) => problemStore.setFoodConsumptionReduction(value)}
        />
      </Form.Item>

      <Divider orientation="left">Medical supply in use</Divider>
      <Form.Item>
        <Radio.Group
          value={problemStore.medicalSuppliesInUse}
          onChange={(e) => problemStore.setMedicalSuppliesInUse(e.target.value)}
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
              value={problemStore.diseaseProportion}
              onChange={(value) => problemStore.setDiseaseProportion(value)}
            />
          </Col>
          <Col span={6}>
            <InputNumber
              min={0} max={100} step={10} addonAfter="%"
              value={problemStore.diseaseProportion}
              onChange={(value) => problemStore.setDiseaseProportion(value)}
            />
          </Col>
        </Row>
      </Form.Item>

      <Divider orientation="left">Farm</Divider>
      <Form.Item>
        <Radio.Group
          value={problemStore.farmVariant}
          onChange={(e) => problemStore.setFarmVariant(e.target.value)}
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
              min={0} max={150} step={10}
              marks={fertilityTargetMarks} tooltip={{ open: false }}
              value={problemStore.fertilityTarget}
              onChange={(value) => problemStore.setFertilityTarget(value)}
            />
          </Col>
          <Col span={6}>
            <InputNumber
              min={0} max={150} step={10} addonAfter="%"
              value={problemStore.fertilityTarget}
              onChange={(value) => problemStore.setFertilityTarget(value)}
            />
          </Col>
        </Row>
      </Form.Item>
    </Form>
  )
}
export default dynamic(() => Promise.resolve(PlanInput), { ssr: false })
