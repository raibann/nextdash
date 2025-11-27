import Tasks from './_components'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasks',
  // description: 'Tasks page',
}

export default function TasksPage() {
  return <Tasks />
}
