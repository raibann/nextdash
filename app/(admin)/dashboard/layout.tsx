import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { PropsWithChildren } from 'react'
import { getSession } from '@/server/actions/user-actions'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME || 'NextDash',
    template: `${process.env.NEXT_PUBLIC_APP_NAME || 'NextDash'} - %s`,
  },
}

const DashboardLayout = async ({ children }: PropsWithChildren) => {
  const authed = await getSession()

  if (!authed) {
    redirect('/')
  }

  return AuthenticatedLayout({ children })
}

export default DashboardLayout
