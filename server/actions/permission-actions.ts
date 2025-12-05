'use server'

import { db } from '@/db/drizzle'
import { permissionTable } from '@/db/schema'
import { throwClientError, throwError } from '@/lib/error-utils'
import { and, desc, eq, ilike, ne, or, sql } from 'drizzle-orm'

export type CreatePermission = typeof permissionTable.$inferInsert
export type UpdatePermission = CreatePermission
export type Permission = typeof permissionTable.$inferSelect

const createPermission = async (body: CreatePermission) => {
  try {
    const existed = await db.query.permissionTable.findFirst({
      where: eq(permissionTable.slug, body.slug),
    })
    if (existed) {
      return { data: null, error: 'Permission already is existed!' }
    }
    const data = await db.insert(permissionTable).values(body).returning()
    return { data: data, error: null }
  } catch (error) {
    return throwError(error)
  }
}
const updatePermission = async (body: UpdatePermission) => {
  try {
    if (!body.id) return { data: null, error: 'Id is required' }

    // 1. Check if another permission already uses the same name
    const existed = await db.query.permissionTable.findFirst({
      where: and(
        eq(permissionTable.slug, body.slug),
        ne(permissionTable.id, body.id) // ignore current permission
      ),
    })
    if (existed) {
      return { data: null, error: 'Permission already is existed!' }
    }

    // 2. Update permission safely
    const data = await db
      .update(permissionTable)
      .set({
        desc: body.desc,
        slug: body.slug,
        name: body.name,
      })
      .where(eq(permissionTable.id, body.id))
      .returning() // optional: get updated data

    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}

const deletePermission = async (id: string) => {
  try {
    const data = await db.delete(permissionTable).where(eq(permissionTable.id, id))
    return { data: data, error: null }
  } catch (error) {
    return throwError(error)
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
          ilike(permissionTable.name, `%${search}%`),
          ilike(permissionTable.slug, `%${search}%`)
        )
      : undefined
    const data = await db.query.permissionTable.findMany({
      where,
      limit: pageSize,
      offset: pageIndex * pageSize,
      orderBy: [desc(permissionTable.createdAt)],
    })

    // Count total for TanStack Table pagination
    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(permissionTable)
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
