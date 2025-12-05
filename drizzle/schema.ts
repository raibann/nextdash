import {
  pgTable,
  index,
  text,
  timestamp,
  foreignKey,
  unique,
  varchar,
  integer,
  boolean,
  primaryKey,
  AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const verification = pgTable(
  'verification',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('verification_identifier_idx').using(
      'btree',
      table.identifier.asc().nullsLast().op('text_ops')
    ),
  ]
)

export const account = pgTable(
  'account',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, {
        onDelete: 'cascade',
      }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
      mode: 'date',
    }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      mode: 'date',
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull(),
  },
  (table) => [
    index('account_userId_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'account_user_id_user_id_fk',
    }).onDelete('cascade'),
  ]
)

export const role = pgTable(
  'role',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),
    desc: text('desc'),
    name: text('name').notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    icon: varchar('icon', { length: 50 }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull(),
  },
  (table) => [unique('role_name_unique').on(table.name)]
)

export const permission = pgTable(
  'permission',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),
    desc: text('desc'),
    name: text('name').notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull(),
  },
  (table) => [
    unique('permission_slug_unique').on(table.slug),
    unique('permission_name_unique').on(table.name),
  ]
)

export const page = pgTable(
  'page',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 150 }).notNull().unique(),
    icon: varchar('icon', { length: 50 }),
    parentId: text('parent_id'),
    orderIndex: integer('order_index').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'page_parent_id_page_id_fk',
    }).onDelete('cascade'),
    unique('page_slug_unique').on(table.slug),
  ]
)

export const taskProperty = pgTable(
  'task_property',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),
    field: varchar('field', { length: 100 }).notNull(),
    label: varchar('label', { length: 50 }).notNull(),
    value: varchar('value', { length: 50 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull(),
  },
  (table) => [unique('task_property_value_unique').on(table.value)]
)

export const task = pgTable(
  'task',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),
    title: text('title').notNull(),
    desc: text('desc'),
    label: varchar('label', { length: 50 }).references(
      (): AnyPgColumn => taskProperty.value,
      {
        onDelete: 'set null',
      }
    ),
    status: varchar('status', { length: 50 }).references(
      (): AnyPgColumn => taskProperty.value,
      {
        onDelete: 'set null',
      }
    ),
    priority: varchar('priority', { length: 50 })
      .notNull()
      .references((): AnyPgColumn => taskProperty.value, {
        onDelete: 'set null',
      }),
    assignedTo: text('assigned_to').references((): AnyPgColumn => user.id, {
      onDelete: 'set null',
    }),
    createdBy: text('created_by').references((): AnyPgColumn => user.id, {
      onDelete: 'set null',
    }),
    parentId: text('parent_id').references((): AnyPgColumn => task.id, {
      onDelete: 'set null',
    }),
    startDate: timestamp('start_date', { mode: 'date' }).notNull(),
    endDate: timestamp('end_date', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.priority],
      foreignColumns: [taskProperty.value],
      name: 'task_priority_task_property_value_fk',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.assignedTo],
      foreignColumns: [user.id],
      name: 'task_assigned_to_user_id_fk',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
      name: 'task_created_by_user_id_fk',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'task_parent_id_task_id_fk',
    }).onDelete('set null'),
  ]
)

export const session = pgTable(
  'session',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    token: text('token').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references((): AnyPgColumn => user.id, {
        onDelete: 'cascade',
      }),
    impersonatedBy: text('impersonated_by'),
  },
  (table) => [
    index('session_userId_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'session_user_id_user_id_fk',
    }).onDelete('cascade'),
    unique('session_token_unique').on(table.token),
  ]
)

export const user = pgTable(
  'user',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .$onUpdate(() => new Date())
      .notNull(),
    role: text('role').references(() => role.id, {
      onDelete: 'set null',
    }),
    banned: boolean('banned').default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires', { mode: 'date' }),
  },
  (table) => [unique('user_email_unique').on(table.email)]
)

export const rolePermission = pgTable(
  'role_permission',
  {
    roleId: text('role_id')
      .notNull()
      .references((): AnyPgColumn => role.id, {
        onDelete: 'cascade',
      }),
    permissionId: text('permission_id')
      .notNull()
      .references((): AnyPgColumn => permission.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => [
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [role.id],
      name: 'role_permission_role_id_role_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.permissionId],
      foreignColumns: [permission.id],
      name: 'role_permission_permission_id_permission_id_fk',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.roleId, table.permissionId],
      name: 'role_permission_role_id_permission_id_pk',
    }),
  ]
)
