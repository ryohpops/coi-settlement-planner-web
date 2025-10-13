import { Col, Divider, Form, InputNumber, Radio, Row, Slider, Space } from "antd"
import dynamic from "next/dynamic"
import { MEDICAL_SUPPLIES } from "../../constants/item"
import { useFarmConfigInputStore } from "../../domain/farmConfigInputStore"
import FoodsInUseSelector from "../foodsInUseSelector"

function DemandInputForm() {
  const inputStore = useFarmConfigInputStore()

  return (
    <Form layout="vertical">
      <Divider>Settlements</Divider>
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

      <Divider>Foods in use</Divider>
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

      <Divider>Medical supply in use</Divider>
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
    </Form>
  )
}
export default dynamic(() => Promise.resolve(DemandInputForm), { ssr: false })
