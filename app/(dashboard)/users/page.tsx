import Users from './_components'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Users',
  // description: 'Users page',
}

export default function UsersPage() {
  return <Users />
}
