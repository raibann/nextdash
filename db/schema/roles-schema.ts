import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { user } from './auth-schema' // your existing Better-Auth user table
import { relations } from 'drizzle-orm'

//
// ROLES TABLE
//
export const role = pgTable('role', {
  id: text('id').primaryKey(), // example: "admin", "editor", "member"
  desc: text('desc'),
  name: text('name').notNull(),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

//
// PERMISSIONS TABLE
//
export const permission = pgTable('permission', {
  id: text('id').primaryKey(), // example: "user.create", "post.update"
  desc: text('desc'),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

//
// ROLE ↔ PERMISSION (Many-to-Many)
//
export const rolePermission = pgTable(
  'role_permission',
  {
    roleId: text('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'cascade' }),

    permissionId: text('permission_id')
      .notNull()
      .references(() => permission.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]
)

//
// USER ↔ ROLE (Many-to-Many)
//
export const userRole = pgTable(
  'user_role',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    roleId: text('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.userId] })]
)

// RELATIONS
export const userRoleRelations = relations(user, ({ many }) => ({
  userRoles: many(userRole),
}))

export const roleUserRelations = relations(role, ({ many }) => ({
  userRoles: many(userRole),
}))

export const rolePermissionRelations = relations(role, ({ many }) => ({
  rolePermissions: many(rolePermission),
}))

export const permissionRoleRelations = relations(permission, ({ many }) => ({
  rolePermissions: many(rolePermission),
}))
