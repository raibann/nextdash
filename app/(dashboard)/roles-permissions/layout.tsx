import { ConfigDrawer } from '@/components/config-drawer'
import LanguageSwitch from '@/components/language-switch'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Search } from 'lucide-react'
import { Header } from '@/components/layout/header'
import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roles & Permissions',
  // description: 'Manage roles and permissions',
}

const topNav = [
  {
    title: 'Roles',
    href: '/roles-permissions',
    isActive: true,
  },
  {
    title: 'Permissions',
    href: '/roles-permissions/permissions',
    isActive: false,
  },
]

const RolePermissionLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header fixed>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <LanguageSwitch />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      {children}
    </>
  )
}

export default RolePermissionLayout
