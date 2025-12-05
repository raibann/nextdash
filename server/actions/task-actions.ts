'use server'
import { db } from '@/db/drizzle'
import { task,taskProperty } from '@/db/schema'
import { throwClientError, throwError } from '@/lib/error-utils'
import { and, desc, eq, ilike, ne, or, sql } from 'drizzle-orm'

export type CreateTask = typeof task.$inferInsert
export type UpdateTask = CreateTask
export type Task = typeof task.$inferSelect
export type TaskProperty = typeof taskProperty.$inferSelect
export type CreateTaskProperty = typeof taskProperty.$inferInsert

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

const listTaskProperties = async (field: string) => {
  try {
    const data = await db.query.taskProperty.findMany({
      where: eq(taskProperty.field, field),
    })
    return { data: data, error: null }  
  } catch (error) {
    return throwError(error)
  }
}

const createTaskProperty = async (body: CreateTaskProperty) => {
  try {
    const data = await db.insert(taskProperty).values(body).returning()
    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}
const updateTaskProperty = async (body: Partial<TaskProperty> & { id: string }) => {
  try {
    if (!body.id) return { data: null, error: 'Id is required' }
    const data = await db
      .update(taskProperty)
      .set({
        field: body.field,
        type: body.type,
        icon: body.icon,
        label: body.label,
        value: body.value,
      })
      .where(eq(taskProperty.id, body.id))
      .returning()
    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}

const deleteTaskProperty = async (id: string) => {
  try {
    const data = await db.delete(taskProperty).where(eq(taskProperty.id, id))
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
  listTaskProperties,
  createTaskProperty,
  updateTaskProperty,
  deleteTaskProperty,
}
