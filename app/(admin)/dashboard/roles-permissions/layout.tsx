import { ConfigDrawer } from '@/components/config-drawer'
import LanguageSwitch from '@/components/language-switch'
import { TopNav } from '@/components/layout/top-nav'
import { ThemeSwitch } from '@/components/theme-switch'
import { Header } from '@/components/layout/header'
import React from 'react'
import type { Metadata } from 'next'
import { Search } from '@/components/search'
import { RoleProvider } from './_components/roles-provider'

export const metadata: Metadata = {
  title: 'Roles & Permissions',
  // description: 'Manage roles and permissions',
}

const topNav = [
  {
    title: 'Roles',
    href: '/dashboard/roles-permissions',
    isActive: true,
  },
  {
    title: 'Permissions',
    href: '/dashboard/roles-permissions/permissions',
    isActive: false,
  },
]

const RolePermissionLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <RoleProvider>
      <Header fixed>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <LanguageSwitch />
          <ThemeSwitch />
          <ConfigDrawer />
          {/* <ProfileDropdown /> */}
        </div>
      </Header>
      {children}
    </RoleProvider>
  )
}

export default RolePermissionLayout
