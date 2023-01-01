import { Layout } from 'antd'
import Typography from 'antd/es/typography/Typography'
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
            <Typography style={{ textAlign: "center" }}>Created by ryohpops</Typography>
          </Layout.Footer>
        </Layout>
      </Layout>
    </>
  )
}
