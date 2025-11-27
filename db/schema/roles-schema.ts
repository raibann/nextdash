import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { user } from './auth-schema' // your existing Better-Auth user table

//
// ROLES TABLE
//
export const roles = pgTable('roles', {
  id: text('id').primaryKey(), // example: "admin", "editor", "member"
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

//
// PERMISSIONS TABLE
//
export const permissions = pgTable('permissions', {
  id: text('id').primaryKey(), // example: "user.create", "post.update"
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

//
// ROLE ↔ PERMISSION (Many-to-Many)
//
export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),

    permissionId: text('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  })
)

//
// USER ↔ ROLE (Many-to-Many)
//
export const userRoles = pgTable(
  'user_roles',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    roleId: text('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
  })
)
