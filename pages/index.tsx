import { Layout } from 'antd'
import Head from 'next/head'
import PlanDisplay from '../components/planDisplay'
import PlanInput from '../components/planInput'

const SIDER_WIDTH = 400

export default function Home() {
  return (
    <>
      <Head>
        <title>CoI Food Calculator</title>
      </Head>
      <Layout hasSider style={{ height: "100vh" }}>
        <Layout.Sider
          theme='light' width={SIDER_WIDTH}
          style={{ overflow: 'auto', padding: "0 1em" }}
        >
          <PlanInput />
        </Layout.Sider>
        <Layout>
          <Layout.Content>
            <PlanDisplay />
          </Layout.Content>
          <Layout.Footer>

          </Layout.Footer>
        </Layout>
      </Layout>
    </>
  )
}
