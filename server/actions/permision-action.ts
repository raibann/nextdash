'use server'

import { db } from '@/db'
import { permission } from '@/db/schema'
import { throwClientError, throwError } from '@/lib/error-utils'
import { and, desc, eq, ilike, ne, or, sql } from 'drizzle-orm'

export type CreatePermission = typeof permission.$inferInsert
export type UpdateRole = CreatePermission
export type Permission = typeof permission.$inferSelect

const createPermission = async (body: CreatePermission) => {
  try {
    const existed = await db.query.permission.findFirst({
      where: eq(permission.slug, body.slug),
    })
    if (existed) {
      return { data: null, error: 'Permission already is existed!' }
    }
    const data = await db.insert(permission).values(body).returning()
    return { data: data, error: null }
  } catch (error) {
    throwError(error)
  }
}
const updatePermission = async (body: UpdateRole) => {
  try {
    if (!body.id) return { data: null, error: 'Id is required' }
    // 1. Check if another role already uses the same name
    const existed = await db.query.role.findFirst({
      where: and(
        eq(permission.slug, body.slug),
        ne(permission.id, body.id) // ignore current role
      ),
    })
    if (existed) {
      return { data: null, error: 'Role already is existed!' }
    }

    // 2. Update role safely
    const data = await db
      .update(permission)
      .set({
        name: body.name,
        slug: body.slug,
        desc: body.desc,
      })
      .where(eq(permission.id, body.id))
      .returning() // optional: get updated data

    return { data: data, error: null }
  } catch (error) {
    throwError(error)
  }
}

const deletePermission = async (id: string) => {
  try {
    const data = await db.delete(permission).where(eq(permission.id, id))
    return { data: data, error: null }
  } catch (error) {
    throwError(error)
  }
}
const listPermission = async ({
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
      ? or(
          ilike(permission.name, `%${search}%`),
          ilike(permission.slug, `%${search}%`)
        )
      : undefined
    const data = await db.query.role.findMany({
      where,
      limit: pageSize,
      offset: pageIndex * pageSize,
      orderBy: [desc(permission.createdAt)],
    })

    // Count total for TanStack Table pagination
    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(permission)
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

export { createPermission, updatePermission, deletePermission, listPermission }
