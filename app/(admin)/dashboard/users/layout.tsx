import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Users management',
  // description: 'Manage roles and permissions',
}
const UserLayout = ({ children }: PropsWithChildren) => {
  return children
}

export default UserLayout
