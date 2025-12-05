import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { PropsWithChildren } from 'react'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '../../../lib/auth'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME || 'NextDash',
    template: `${process.env.NEXT_PUBLIC_APP_NAME || 'NextDash'} - %s`,
  },
}

const DashboardLayout = async ({ children }: PropsWithChildren) => {
  const authed = await auth.api.getSession({
    headers: await headers(),
  })

  if (!authed) {
    redirect('/sign-in')
  }

  return AuthenticatedLayout({ children })
}

export default DashboardLayout
