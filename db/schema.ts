import { relations } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  primaryKey,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { varchar, AnyPgColumn } from 'drizzle-orm/pg-core'

// USER TABLE
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  role: text('role'),
  banExpires: timestamp('ban_expires'),
  username: text('username').unique(),
  displayUsername: text('display_username'),
})

// SESSION TABLE
export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by'),
  },
  (table) => [index('session_userId_idx').on(table.userId)]
)

// ACCOUNT TABLE
export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)]
)

// VERIFICATION TABLE
export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
)

// ROLE TABLE
export const role = pgTable('role', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  desc: text('desc'),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: text('name').notNull().unique(),
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

// PERMISSION TABLE
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

// ROLE ↔ PERMISSION (Many-to-Many)
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

// TASK TABLE
export const task = pgTable('task', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  desc: text('desc'),
  label: varchar('label', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  priority: varchar('priority', { length: 50 })
    .notNull()
    .references((): AnyPgColumn => taskProperty.value, {
      onDelete: 'set null',
    }),
  assignedTo: text('assigned_to').references((): AnyPgColumn => user.id, {
    onDelete: 'set null',
  }), // user who is assigned to the task and use comma , to assign multiple users
  createdBy: text('created_by').references((): AnyPgColumn => user.id, {
    onDelete: 'set null',
  }), // user who created the task
  parentId: text('parent_id').references((): AnyPgColumn => task.id, {
    onDelete: 'set null',
  }), // task that is the parent of the current task
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull(),
})

// TASK PROPERTY TABLE
export const taskProperty = pgTable('task_property', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  field: varchar('field', { length: 100 }).notNull(), // status, priority, label
  icon: varchar('icon', { length: 50 }),
  type: varchar('type', { length: 50 }).notNull(), // string, number, boolean, date, time, datetime, array, object, etc.
  label: varchar('label', { length: 50 }).notNull(),
  value: varchar('value', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull(),
})

export const taskRelations = relations(task, ({ one }) => ({
  user: one(user, {
    fields: [task.assignedTo],
    references: [user.id],
  }),
  parent: one(task, {
    fields: [task.parentId],
    references: [task.id],
  }),
}))

export const config = pgTable('config', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  key: varchar('key', { length: 100 }).notNull(),
  value: jsonb('value')
    .$type<{
      type: 'text' | 'number' | 'boolean' | 'array' | 'object'
      value: string | number | boolean | string[] | object
    }>()
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})
