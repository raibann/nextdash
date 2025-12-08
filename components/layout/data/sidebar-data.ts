import {
  LayoutDashboard,
  HelpCircle,
  Bell,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users,
  ShieldUser,
  ListTodo,
} from 'lucide-react'
import { type SidebarData } from './types'

export const ROUTE_PATHS = {
  root: '/',
  admin: {
    dashboard: {
      root: '/dashboard',
      chats: '/dashboard/chats',
      helpCenter: '/dashboard/help-center',
      rolePermissions: {
        root: '/dashboard/roles-permissions',
        permissions: '/dashboard/roles-permissions/permissions',
      },
      settings: {
        root: '/dashboard/settings',
        accounts: '/dashboard/settings/account',
        appearances: '/dashboard/settings/appearance',
        notifications: '/dashboard/settings/notifications',
      },
      users: '/dashboard/users',
      tasks: '/dashboard/tasks',
    },
  },
}

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: ROUTE_PATHS.admin.dashboard.root,
          icon: LayoutDashboard,
          permissions: ['read.dashboard', '*'],
        },
        {
          title: 'Tasks',
          url: ROUTE_PATHS.admin.dashboard.tasks,
          icon: ListTodo,
          permissions: ['read.task', '*'],
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
          permissions: ['read.user', '*'],
        },
        {
          title: 'Roles',
          url: ROUTE_PATHS.admin.dashboard.rolePermissions.root,
          icon: ShieldUser,
          permissions: ['read.role', '*'],
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
              permissions: ['read.profile', '*'],
            },
            {
              title: 'Account',
              url: ROUTE_PATHS.admin.dashboard.settings.accounts,
              icon: Wrench,
              permissions: ['read.account', '*'],
            },
            {
              title: 'Appearance',
              url: ROUTE_PATHS.admin.dashboard.settings.appearances,
              icon: Palette,
              permissions: ['read.appearance', '*'],
            },
            {
              title: 'Notifications',
              url: ROUTE_PATHS.admin.dashboard.settings.notifications,
              icon: Bell,
              permissions: ['read.notifications', '*'],
            },
          ],
        },
        {
          title: 'Help Center',
          url: ROUTE_PATHS.admin.dashboard.helpCenter,
          icon: HelpCircle,
          permissions: ['read.help.center', '*'],
        },
      ],
    },
  ],
}
