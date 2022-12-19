import Head from 'next/head'
import PlanDisplay from '../components/planDisplay'
import styles from '../styles/Home.module.scss'


export default function Home() {
  return (
    <>
      <Head>
        <title>CoI Food Calculator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.container}>
        <div className={styles.sidebar}>not</div>
        <div className={styles.main}>
          <PlanDisplay />
        </div>
      </main>
    </>
  )
}
