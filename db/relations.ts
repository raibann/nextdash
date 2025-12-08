import { relations } from 'drizzle-orm/relations'
import {
  account,
  user,
  session,
  role,
  rolePermission,
  task,
  taskProperty,
  permission,
} from './schema'

// ACCOUNT RELATIONS
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

// USER RELATIONS
export const userRelations = relations(user, ({ one, many }) => ({
  roleRelation: one(role, {
    fields: [user.role],
    references: [role.slug],
  }),
  accounts: many(account),
  tasks_assignedTo: many(task, {
    relationName: 'task_assignedTo_user_id',
  }),
  tasks_createdBy: many(task, {
    relationName: 'task_createdBy_user_id',
  }),
  sessions: many(session),
}))

export const rolePermissionOneToOneRelations = relations(
  rolePermission,
  ({ one }) => ({
    role: one(role, {
      fields: [rolePermission.roleId],
      references: [role.id],
    }),
    permission: one(permission, {
      fields: [rolePermission.permissionId],
      references: [permission.id],
    }),
  })
)

// TASK RELATIONS
export const taskRelations = relations(task, ({ one, many }) => ({
  taskProperty: one(taskProperty, {
    fields: [task.priority],
    references: [taskProperty.value],
  }),
  user_assignedTo: one(user, {
    fields: [task.assignedTo],
    references: [user.id],
    relationName: 'task_assignedTo_user_id',
  }),
  user_createdBy: one(user, {
    fields: [task.createdBy],
    references: [user.id],
    relationName: 'task_createdBy_user_id',
  }),
  task: one(task, {
    fields: [task.parentId],
    references: [task.id],
    relationName: 'task_parentId_task_id',
  }),
  tasks: many(task, {
    relationName: 'task_parentId_task_id',
  }),
}))

// TASK PROPERTY RELATIONS
export const taskPropertyRelations = relations(taskProperty, ({ many }) => ({
  tasks: many(task),
}))

// SESSION RELATIONS
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

// ROLE RELATIONS
export const roleRelations = relations(role, ({ many }) => ({
  rolePermissions: many(rolePermission),
}))

// ROLE PERMISSION RELATIONS
export const rolePermissionRelations = relations(rolePermission, ({ one }) => ({
  role: one(role, {
    fields: [rolePermission.roleId],
    references: [role.id],
  }),
  permission: one(permission, {
    fields: [rolePermission.permissionId],
    references: [permission.id],
  }),
}))

// PERMISSION RELATIONS
export const permissionRelations = relations(permission, ({ many }) => ({
  rolePermissions: many(rolePermission),
}))
