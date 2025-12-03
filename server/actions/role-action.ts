'use server'
import { db } from '@/db'
import { role } from '@/db/schema'
import { throwClientError, throwError } from '@/lib/error-utils'
import { and, desc, eq, ilike, ne, or, sql } from 'drizzle-orm'

export type CreateRole = typeof role.$inferInsert
export type UpdateRole = CreateRole
export type Role = typeof role.$inferSelect

const createRole = async (body: CreateRole) => {
  try {
    const existed = await db.query.role.findFirst({
      where: eq(role.name, body.name),
    })

    if (existed) {
      return { data: null, error: 'Role already is existed!' }
    }
    const data = await db.insert(role).values(body).returning()
    return { data: data[0], error: null }
  } catch (error) {
    throwError(error)
  }
}
const updateRole = async (body: UpdateRole) => {
  try {
    if (!body.id) return { data: null, error: 'Id is required' }
    // 1. Check if another role already uses the same name
    const existed = await db.query.role.findFirst({
      where: and(
        eq(role.name, body.name),
        ne(role.id, body.id) // ignore current role
      ),
    })
    if (existed) {
      return { data: null, error: 'Role already is existed!' }
    }

    // 2. Update role safely
    const data = await db
      .update(role)
      .set({
        name: body.name,
        icon: body.icon,
        desc: body.desc,
      })
      .where(eq(role.id, body.id))
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
const deleteRole = async (id: string) => {
  try {
    const data = await db.delete(role).where(eq(role.id, id))
    return { data: data, error: null }
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error: error.message }
    }
    console.error(error)
    return { data: null, error: 'Something went wrong' }
  }
}

const listRole = async ({
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
      ? or(ilike(role.name, `%${search}%`), ilike(role.id, `%${search}%`))
      : undefined
    const data = await db.query.role.findMany({
      where,
      limit: pageSize,
      offset: pageIndex * pageSize,
      orderBy: [desc(role.createdAt)],
    })

    // Count total for TanStack Table pagination
    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(role)
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

export { createRole, updateRole, deleteRole, listRole }
