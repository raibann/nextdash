import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  varchar,
  AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'

export const page = pgTable('page', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull().unique(), // e.g. "users"
  icon: varchar('icon', { length: 50 }), // optional for sidebar
  parentId: text('parent_id').references((): AnyPgColumn => page.id, {
    onDelete: 'cascade',
  }),
  orderIndex: integer('order_index').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const pageRelations = relations(page, ({ one, many }) => ({
  parent: one(page, {
    fields: [page.parentId],
    references: [page.id],
  }),
  children: many(page),
}))
