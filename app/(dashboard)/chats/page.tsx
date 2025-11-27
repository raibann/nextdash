import Chats from './_components'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chats',
  // description: 'Chats page',
}
export default function ChatsPage() {
  return <Chats />
}
