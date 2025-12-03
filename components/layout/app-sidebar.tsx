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
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
// import { TeamSwitcher } from './team-switcher'
import CompanyHeader from './company-header'
import { useQuery } from '@tanstack/react-query'
import { getSession } from '@/server/actions/user-actions'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()

  const { data } = useQuery({
    queryKey: ['user-session'],
    queryFn: getSession,
  })

  if (!data) return null

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
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            avatar: data.user.image || '',
            email: data.user.email,
            name: data.user.name,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
