export const ROUTE_PATHS = {
  root: '/',
  admin: {
    dashboard: {
      root: '/dashboard',
      chats: '/dashboard/chats',
      helpCenter: '/dashboard/help-center',
      rolePermissions: {
        root: '/dashboard/role-permissions',
        permissions: '/dashboard/role-permissions/permissions',
      },
      settings: {
        root: '/dashboard/settings',
        accounts: '/dashboard/settings/account',
        appearances: '/dashboard/settings/appearance',
        display: '/dashboard/settings/display',
        notifications: '/dashboard/settings/notifications',
      },
      users: '/dashboard/users',
      tasks: '/dashboard/tasks',
    },
  },
}
