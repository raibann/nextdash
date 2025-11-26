import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { PropsWithChildren } from 'react'

const DashboardLayout = ({ children }: PropsWithChildren) => {
  return AuthenticatedLayout({ children })
}

export default DashboardLayout
