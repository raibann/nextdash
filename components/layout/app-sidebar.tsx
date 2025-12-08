'use client'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
// import { AppTitle } from './app-title'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
// import { TeamSwitcher } from './team-switcher'
import CompanyHeader from './company-header'
import { Session } from '@/lib/auth'
import { sidebarData } from './data/sidebar-data'
import { hasPermission } from '@/lib/utils'

interface AppSidebarProps {
  session: Session | null
  permissions: string[]
}

export function AppSidebar({ session, permissions }: AppSidebarProps) {
  const { collapsible, variant } = useLayout()

  const filteredNavGroups = sidebarData.navGroups.filter((group) =>
    group.items.some((item) =>
      hasPermission(permissions, item.permissions || ['*'])
    )
  )

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <CompanyHeader />
        {/* <TeamSwitcher teams={sidebarData.teams} /> */}

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        {/* <AppTitle /> */}
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            avatar: session?.user?.image || '',
            email: session?.user?.email || '',
            name: session?.user?.name || '',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
