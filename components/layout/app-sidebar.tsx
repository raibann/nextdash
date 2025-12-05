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
import { useSession } from '@/lib/auth-client'
import { GeneralError } from '../errors/general-error'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()

  const { data, isPending, error } = useSession()

  if (error) return <GeneralError message='dashboard' />

  if (!data?.user) return null

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
          loading={isPending}
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
