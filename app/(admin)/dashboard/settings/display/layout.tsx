import React from 'react'
import { PageProvider } from './_components/pages-provider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Display Settings',
  // description: 'Display settings page',
}

const SettingsDisplayLayout = ({ children }: { children: React.ReactNode }) => {
  return <PageProvider>{children}</PageProvider>
}

export default SettingsDisplayLayout
