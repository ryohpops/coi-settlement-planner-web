import { Col, Divider, Form, InputNumber, Radio, Row, Slider, Space } from "antd"
import { SliderMarks } from "antd/es/slider"
import dynamic from "next/dynamic"
import { useEffect } from "react"
import shallow from "zustand/shallow"
import { MEDICAL_SUPPLIES } from "../domain/item"
import { useProblemStore } from "../domain/problemStore"
import { FARM_VARIANT } from "../domain/recipe"
import FoodsInUseSelector from "./foodsInUseSelector"

const fertilityTargetMarks: SliderMarks = {
  0: "0%",
  100: "100%",
  150: "150%"
}

function PlanInput() {
  const problemStore = useProblemStore((state) => ({
    population: state.population,
    setPopulation: state.setPopulation,
    globalAdjustment: state.globalAdjustment,
    setGlobalAdjustment: state.setGlobalAdjustment,
    foodConsumptionChange: state.foodConsumptionChange,
    setFoodConsumptionChange: state.setFoodConsumptionChange,
    medicalSuppliesInUse: state.medicalSuppliesInUse,
    setMedicalSuppliesInUse: state.setMedicalSuppliesInUse,
    medicalSuppliesConsumptionChange: state.medicalSuppliesConsumptionChange,
    setMedicalSuppliesConsumptionChange: state.setMedicalSuppliesConsumptionChange,
    farmVariant: state.farmVariant,
    setFarmVariant: state.setFarmVariant,
    fertilityTarget: state.fertilityTarget,
    setFertilityTarget: state.setFertilityTarget,
    updateAnswer: state.updateAnswer
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
        tooltip="Produce every food x% more than required amount as buffers"
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
      <Form.Item label="Total food consumption change by edicts">
        <InputNumber
          addonAfter="%"
          value={problemStore.foodConsumptionChange}
          onChange={(value) => problemStore.setFoodConsumptionChange(value)}
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
        label="Average consumption change of Medical Supplies"
        tooltip="Clinics consume 50% more Medical Supplies while there is a disease."
      >
        <InputNumber
          addonAfter="%"
          value={problemStore.medicalSuppliesConsumptionChange}
          onChange={(value) => problemStore.setMedicalSuppliesConsumptionChange(value)}
        />
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
