import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { user } from './auth-schema'
import { createId } from '@paralleldrive/cuid2'
//
// ROLES TABLE
//
export const role = pgTable('role', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  desc: text('desc'),
  name: text('name').notNull().unique(),
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

//
// PERMISSIONS TABLE
//
export const permission = pgTable('permission', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()), // example: "user.create", "post.update"
  desc: text('desc'),
  name: text('name').notNull(),
  slug: varchar('slug').notNull().unique(),
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

// RELATIONS
export const rolePermissionRelations = relations(role, ({ many }) => ({
  rolePermissions: many(rolePermission),
}))

export const permissionRoleRelations = relations(permission, ({ many }) => ({
  rolePermissions: many(rolePermission),
}))

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
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })]
)

export const userRoleRelations = relations(user, ({ many }) => ({
  userRoles: many(userRole),
}))

export const roleUserRelations = relations(role, ({ many }) => ({
  roleUsers: many(userRole),
}))
