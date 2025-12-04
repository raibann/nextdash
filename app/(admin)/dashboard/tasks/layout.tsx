import type { Metadata } from 'next'
import { TasksProvider } from './_components/tasks-provider'

export const metadata: Metadata = {
  title: 'Tasks',
  // description: 'Tasks page',
}

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TasksProvider>{children}</TasksProvider>
}
