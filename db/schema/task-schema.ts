import { createId } from '@paralleldrive/cuid2'
import {
  pgTable,
  text,
  timestamp,
  AnyPgColumn,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { user } from './auth-schema'

export const task = pgTable('task', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  desc: text('desc'),
  label: varchar('label', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  priority: varchar('priority', { length: 50 }).notNull(),
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

export const taskStatus = pgTable('task_status', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  status: varchar('status', { length: 50 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull(),
})

export const taskPriority = pgTable('task_priority', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  priority: varchar('priority', { length: 50 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull(),
})

export const taskLabel = pgTable('task_label', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  label: varchar('label', { length: 50 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  variant: varchar('variant', { length: 50 }).notNull(),
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
