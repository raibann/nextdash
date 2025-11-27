import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { PropsWithChildren } from 'react'
import { userAuthed } from '@/server/actions/user-actions'
import { redirect } from 'next/navigation'

const DashboardLayout = async ({ children }: PropsWithChildren) => {
  const authed = await userAuthed()

  if (!authed) {
    redirect('/')
  }

  return AuthenticatedLayout({ children })
}

export default DashboardLayout
