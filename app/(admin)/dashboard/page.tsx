import Dashboard from './_components'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  // description: 'Dashboard page',
}
const DashboardPage = () => {
  return <Dashboard />
}

export default DashboardPage
