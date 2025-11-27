'use client'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { PropsWithChildren } from 'react'
import { ClientOnly } from '../../components/client-only'

const DashboardLayout = ({ children }: PropsWithChildren) => {
  return ClientOnly({ children: AuthenticatedLayout({ children }) })
}

export default DashboardLayout
