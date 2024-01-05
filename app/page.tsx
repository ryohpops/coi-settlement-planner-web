"use client"

import { Col, Layout, Row, Typography } from 'antd'
import BuildingList from '../components/buildingList'
import PlanDisplay from '../components/planDisplay'
import PlanInput from '../components/planInput'
import styles from "./page.module.scss"

export default function Home() {
  return (
    <Layout style={{ height: "100vh" }}>
      <Layout.Content>
        <Row>
          <Col span={5} className={styles.sidePanel}>
            <PlanInput />
          </Col>
          <Col span={14}>
            <PlanDisplay />
          </Col>
          <Col span={5} className={styles.sidePanel}>
            <BuildingList />
          </Col>
        </Row>
      </Layout.Content>
      <Layout.Footer>
        <Typography style={{ textAlign: "center" }}>Created by ryohpops</Typography>
      </Layout.Footer>
    </Layout>
  )
}
