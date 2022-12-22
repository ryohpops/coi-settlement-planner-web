import { Col, Divider, Form, InputNumber, Radio, Row, Slider, Space, Tree } from "antd"
import { SliderMarks } from "antd/es/slider"
import type { DataNode } from "antd/es/tree"
import { allFoods, categories } from "../domain/item"
import { useProblemStore } from "../domain/problemStore"
import { FARM_VARIANT } from "../domain/recipe"

const treeData = function () {
  const treeData: DataNode[] = []
  categories
    .map<DataNode>((category) => ({ key: category, title: category, children: [] }))
    .forEach((node) => treeData.push(node))
  Array.from(allFoods)
    .forEach(([name, item]) => {
      treeData.find((node) => node.key == item.category)
        ?.children?.push({ key: name, title: name })
    })
  return treeData
}()

const fertilityTargetMarks: SliderMarks = {
  0: "0%",
  100: "100%",
  150: "150%"
}

export default function PlanInput() {
  const problemStore = useProblemStore()

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
      <Form.Item label="Total food consumption change by edicts">
        <InputNumber
          addonAfter="%"
          value={problemStore.consumptionChange}
          onChange={(value) => problemStore.setConsumptionChange(value)}
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
        <Tree
          selectable={false} checkable treeData={treeData}
          defaultExpandAll={true}
          onCheck={(keys) => problemStore.setFoodsInUse(keys as string[])}
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
