import {
  LayoutDashboard,
  Monitor,
  // ListTodo,
  HelpCircle,
  Bell,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users,
  // MessagesSquare,
  ShieldUser,
  ListTodo,
} from 'lucide-react'

import { type SidebarData } from '../types'
import { ROUTE_PATHS } from '@/lib/route-path'

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: ROUTE_PATHS.admin.dashboard.root,
          icon: LayoutDashboard,
        },
        {
          title: 'Tasks',
          url: ROUTE_PATHS.admin.dashboard.tasks,
          icon: ListTodo,
        },
      ],
    },
    {
      title: 'Users Management',
      items: [
        {
          title: 'Users',
          url: ROUTE_PATHS.admin.dashboard.users,
          icon: Users,
        },
        {
          title: 'Roles',
          url: ROUTE_PATHS.admin.dashboard.rolePermissions.root,
          icon: ShieldUser,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: ROUTE_PATHS.admin.dashboard.settings.root,
              icon: UserCog,
            },
            {
              title: 'Account',
              url: ROUTE_PATHS.admin.dashboard.settings.accounts,
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: ROUTE_PATHS.admin.dashboard.settings.appearances,
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: ROUTE_PATHS.admin.dashboard.settings.notifications,
              icon: Bell,
            },
            {
              title: 'Display',
              url: ROUTE_PATHS.admin.dashboard.settings.display,
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: ROUTE_PATHS.admin.dashboard.helpCenter,
          icon: HelpCircle,
        },
      ],
    },
  ],
}
