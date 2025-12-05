'use server'
import { db } from '@/db'
import { task, taskLabel, taskPriority, taskStatus } from '@/db/schema'
import { throwClientError, throwError } from '@/lib/error-utils'
import { and, desc, eq, ilike, ne, or, sql } from 'drizzle-orm'

export type CreateTask = typeof task.$inferInsert
export type UpdateTask = CreateTask
export type Task = typeof task.$inferSelect
export type TaskStatus = typeof taskStatus.$inferSelect
export type TaskPriority = typeof taskPriority.$inferSelect
export type TaskLabel = typeof taskLabel.$inferSelect

export type CreateTaskStatus = typeof taskStatus.$inferInsert
export type CreateTaskPriority = typeof taskPriority.$inferInsert
export type CreateTaskLabel = typeof taskLabel.$inferInsert

export type UpdateTaskStatus = CreateTaskStatus
export type UpdateTaskPriority = CreateTaskPriority
export type UpdateTaskLabel = CreateTaskLabel

const createTask = async (body: CreateTask) => {
  try {
    const existed = await db.query.task.findFirst({
      where: eq(task.title, body.title),
    })

    if (existed) {
      return { data: null, error: 'Task already is existed!' }
    }
    const data = await db.insert(task).values(body).returning()
    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}
const updateTask = async (body: UpdateTask) => {
  try {
    if (!body.id) return { data: null, error: 'Id is required' }
    // 1. Check if another role already uses the same name
    const existed = await db.query.task.findFirst({
      where: and(
        eq(task.title, body.title),
        ne(task.id, body.id) // ignore current task
      ),
    })
    if (existed) {
      return { data: null, error: 'Task already is existed!' }
    }

    // 2. Update role safely
    const data = await db
      .update(task)
      .set({
        title: body.title,
        desc: body.desc,
        label: body.label,
        status: body.status,
        priority: body.priority,
      })
      .where(eq(task.id, body.id))
      .returning() // optional: get updated data

    return { data: data[0], error: null }
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error: error.message }
    }
    console.error(error)
    return { data: null, error: 'Something went wrong' }
  }
}
const deleteTask = async (id: string) => {
  try {
    const data = await db.delete(task).where(eq(task.id, id))
    return { data: data, error: null }
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error: error.message }
    }
    console.error(error)
    return { data: null, error: 'Something went wrong' }
  }
}

const listTask = async ({
  pageIndex = 0, //initial page index
  pageSize = 10,
  search,
}: {
  pageIndex: number
  pageSize: number
  search?: string
}) => {
  try {
    const where = search
      ? or(ilike(task.title, `%${search}%`), ilike(task.id, `%${search}%`))
      : undefined
    const data = await db.query.task.findMany({
      where,
      limit: pageSize,
      offset: pageIndex * pageSize,
      orderBy: [desc(task.createdAt)],
    })

    // Count total for TanStack Table pagination
    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(task)
      .where(where ?? sql`true`)

    return {
      data: data,
      rowCount: total[0].count, // Total number of users matching any filters
      pageIndex: pageIndex,
      pageSize: pageSize,
    }
  } catch (error) {
    throwClientError(error)
  }
}

const listTaskStatus = async () => {
  try {
    const data = await db.query.taskStatus.findMany()
    return { data: data, error: null }
  } catch (error) {
    return throwError(error)
  }
}
const listTaskPriority = async () => {
  try {
    const data = await db.query.taskPriority.findMany()
    return { data: data, error: null }
  } catch (error) {
    return throwError(error)
  }
}
const listTaskLabel = async () => {
  try {
    const data = await db.query.taskLabel.findMany()
    return { data: data, error: null }
  } catch (error) {
    return throwError(error)
  }
}

const createTaskStatus = async (body: CreateTaskStatus) => {
  try {
    const data = await db.insert(taskStatus).values(body).returning()
    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}
const updateTaskStatus = async (body: UpdateTaskStatus) => {
  try {
    if (!body.id) return { data: null, error: 'Id is required' }
    const data = await db
      .update(taskStatus)
      .set({
        status: body.status,
        icon: body.icon,
      })
      .where(eq(taskStatus.id, body.id))
      .returning()
    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}

const deleteTaskStatus = async (id: string) => {
  try {
    const data = await db.delete(taskStatus).where(eq(taskStatus.id, id))
    return { data: data, error: null }
  } catch (error) {
    return throwError(error)
  }
}

const createTaskPriority = async (body: CreateTaskPriority) => {
  try {
    const data = await db.insert(taskPriority).values(body).returning()
    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}
const updateTaskPriority = async (body: UpdateTaskPriority) => {
  try {
    if (!body.id) return { data: null, error: 'Id is required' }
    const data = await db
      .update(taskPriority)
      .set(body)
      .where(eq(taskPriority.id, body.id))
      .returning()
    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}
const deleteTaskPriority = async (id: string) => {
  try {
    const data = await db.delete(taskPriority).where(eq(taskPriority.id, id))
    return { data: data, error: null }
  } catch (error) {
    return throwError(error)
  }
}
const createTaskLabel = async (body: CreateTaskLabel) => {
  try {
    const data = await db.insert(taskLabel).values(body).returning()
    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}
const updateTaskLabel = async (body: UpdateTaskLabel) => {
  try {
    if (!body.id) return { data: null, error: 'Id is required' }
    const data = await db
      .update(taskLabel)
      .set(body)
      .where(eq(taskLabel.id, body.id))
      .returning()
    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}

const deleteTaskLabel = async (id: string) => {
  try {
    const data = await db.delete(taskLabel).where(eq(taskLabel.id, id))
    return { data: data, error: null }
  } catch (error) {
    return throwError(error)
  }
}
export {
  createTask,
  updateTask,
  deleteTask,
  listTask,
  createTaskStatus,
  updateTaskStatus,
  deleteTaskStatus,
  createTaskPriority,
  updateTaskPriority,
  deleteTaskPriority,
  createTaskLabel,
  updateTaskLabel,
  deleteTaskLabel,
  listTaskStatus,
  listTaskPriority,
  listTaskLabel,
}
