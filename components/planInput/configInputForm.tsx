import { Col, Divider, Form, InputNumber, Radio, Row, Slider, Space } from "antd"
import { SliderMarks } from "antd/es/slider"
import dynamic from "next/dynamic"
import { ALL_FARM, FACTORY_BY_CATEGORY } from "../../constants/entity"
import { useFarmConfigInputStore } from "../../domain/farmConfigInputStore"

const fertilityTargetMarks: SliderMarks = {
  0: "0%",
  100: "100%",
  140: "140%"
}

function ConfigInputForm() {
  const inputStore = useFarmConfigInputStore()

  const categoryWithVariant = Object.keys(FACTORY_BY_CATEGORY).filter((category) => FACTORY_BY_CATEGORY[category]!.length > 1)
  const factoryRadios = categoryWithVariant.map((category) => {
    const radios = FACTORY_BY_CATEGORY[category]!.map((factory) => (
      <Radio key={factory.name} value={factory.name}>{factory.name}</Radio>
    ))
    return (
      <Form.Item label={category} key={category}>
        <Radio.Group
          value={FACTORY_BY_CATEGORY[category]!.find((factory) => inputStore.factoriesInUse.includes(factory.name))?.name}
          onChange={(e) => inputStore.changeFactoriesInUse(e.target.value)}
        >
          <Space direction="vertical">
            {radios}
          </Space>
        </Radio.Group>
      </Form.Item>
    )
  })

  return (
    <Form layout="vertical">
      <Divider>Farm</Divider>
      <Form.Item label="Variant">
        <Radio.Group
          value={ALL_FARM.find((farm) => inputStore.factoriesInUse.includes(farm.name))?.name}
          onChange={(e) => inputStore.setFarmVariant(e.target.value)}
        >
          <Space direction="vertical">
            {ALL_FARM.map((farm) => (
              <Radio key={farm.name} value={farm.name}>{farm.name}</Radio>
            ))}
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

      <Divider>Factory</Divider>
      {factoryRadios}
    </Form>
  )
}
export default dynamic(() => Promise.resolve(ConfigInputForm), { ssr: false })
