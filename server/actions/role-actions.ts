'use server'
import { db } from '@/db/drizzle'
import { permissionTable, rolePermissionTable, roleTable } from '@/db/schema'
import { throwClientError, throwError } from '@/lib/error-utils'
import { and, desc, eq, ilike, inArray, ne, or, sql } from 'drizzle-orm'

// types
export type CreateRole = typeof roleTable.$inferInsert
export type UpdateRole = CreateRole
export type Role = typeof roleTable.$inferSelect & {
  rolePermissions: typeof rolePermissionTable.$inferSelect & {
    permission: typeof permissionTable.$inferSelect
  }[]
}
export type CreateRolePermission = typeof rolePermissionTable.$inferInsert

// actions
const createRole = async (body: CreateRole) => {
  try {
    const existed = await db.query.roleTable.findFirst({
      where: eq(roleTable.name, body.name),
    })

    if (existed) {
      return { data: null, error: 'Role already is existed!' }
    }
    const data = await db.insert(roleTable).values(body).returning()
    return { data: data[0], error: null }
  } catch (error) {
    return throwError(error)
  }
}
const updateRole = async (body: UpdateRole) => {
  try {
    if (!body.id) return { data: null, error: 'Id is required' }
    // 1. Check if another role already uses the same name
    const existed = await db.query.roleTable.findFirst({
      where: and(
        eq(roleTable.name, body.name),
        ne(roleTable.id, body.id) // ignore current role
      ),
    })
    if (existed) {
      return { data: null, error: 'Role already is existed!' }
    }

    // 2. Update role safely
    const data = await db
      .update(roleTable)
      .set({
        name: body.name,
        icon: body.icon,
        desc: body.desc,
      })
      .where(eq(roleTable.id, body.id))
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
    const data = await db.delete(roleTable).where(eq(roleTable.id, id))
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
      ? or(ilike(roleTable.name, `%${search}%`), ilike(roleTable.id, `%${search}%`))
      : undefined
    const data = await db.query.roleTable.findMany({
      where,
      limit: pageSize,
      offset: pageIndex * pageSize,
      orderBy: [desc(roleTable.createdAt)],
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
    })

    // Count total for TanStack Table pagination
    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(roleTable)
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

const listRolePermission = async (roleId: string) => {
  try {
    const data = await db.query.rolePermissionTable.findMany({
      where: eq(rolePermissionTable.roleId, roleId),
    })
    return { data: data, error: null }
  } catch (error) {
    return throwError(error)
  }
}

const deleteRolePermission = async (roleId: string) => {
  try {
    const data = await db
      .delete(rolePermissionTable)
      .where(eq(rolePermissionTable.roleId, roleId))
    return { data: data, error: null }
  } catch (error) {
    return throwError(error)
  }
}

const upsertRolePermission = async (
  roleId: string,
  newPermissionIds: string[]
) => {
  try {
    if (!roleId) {
      return { data: null, error: 'Role ID is required' }
    }

    // Get existing role permissions
    const existingRolePermissions = await db.query.rolePermissionTable.findMany({
      where: eq(rolePermissionTable.roleId, roleId),
    })

    const existingPermissionIds = existingRolePermissions.map(
      (rp) => rp.permissionId
    )

    // Find permissions to delete (in existing but not in new)
    const permissionIdsToDelete = existingPermissionIds.filter(
      (id) => !newPermissionIds.includes(id)
    )

    // Find permissions to create (in new but not in existing)
    const permissionIdsToCreate = newPermissionIds.filter(
      (id) => !existingPermissionIds.includes(id)
    )

    // Delete permissions that are not in the new list
    if (permissionIdsToDelete.length > 0) {
      await db
        .delete(rolePermissionTable)
        .where(
          and(
            eq(rolePermissionTable.roleId, roleId),
            inArray(rolePermissionTable.permissionId, permissionIdsToDelete)
          )
        )
    }

    // Insert new permissions (on conflict do nothing for safety)
    if (permissionIdsToCreate.length > 0) {
      const newRolePermissions = permissionIdsToCreate.map((permissionId) => ({
        roleId: roleId,
        permissionId: permissionId,
      }))

      await db
        .insert(rolePermissionTable)
        .values(newRolePermissions)
        .onConflictDoNothing({
          target: [
            rolePermissionTable.roleId,
            rolePermissionTable.permissionId,
          ],
        })
    }

    // Return the final state
    const finalRolePermissions = await db.query.rolePermissionTable.findMany({
      where: eq(rolePermissionTable.roleId, roleId),
    })

    return { data: finalRolePermissions, error: null }
  } catch (error) {
    return throwError(error)
  }
}

export { createRole, updateRole, deleteRole, listRole, listRolePermission, deleteRolePermission, upsertRolePermission }
