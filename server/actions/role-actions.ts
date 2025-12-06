'use server'
import { db } from '@/db/drizzle'
import { permission, rolePermission, role } from '@/db/schema'
import { throwClientError, throwError } from '@/lib/error-utils'
import { and, desc, eq, ilike, inArray, ne, or, sql } from 'drizzle-orm'

// types
export type CreateRole = typeof role.$inferInsert
export type UpdateRole = CreateRole
export type Role = typeof role.$inferSelect & {
  rolePermissions: typeof rolePermission.$inferSelect &
    {
      permission: typeof permission.$inferSelect
    }[]
}
export type CreateRolePermission = typeof rolePermission.$inferInsert

// actions
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
    return throwError(error)
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

const listRolePermission = async (roleId: string) => {
  try {
    const data = await db.query.rolePermission.findMany({
      where: eq(rolePermission.roleId, roleId),
    })
    return { data: data, error: null }
  } catch (error) {
    return throwError(error)
  }
}

const deleteRolePermission = async (roleId: string) => {
  try {
    const data = await db
      .delete(rolePermission)
      .where(eq(rolePermission.roleId, roleId))
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
    const existingRolePermissions = await db.query.rolePermission.findMany({
      where: eq(rolePermission.roleId, roleId),
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
        .delete(rolePermission)
        .where(
          and(
            eq(rolePermission.roleId, roleId),
            inArray(rolePermission.permissionId, permissionIdsToDelete)
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
        .insert(rolePermission)
        .values(newRolePermissions)
        .onConflictDoNothing({
          target: [rolePermission.roleId, rolePermission.permissionId],
        })
    }

    // Return the final state
    const finalRolePermissions = await db.query.rolePermission.findMany({
      where: eq(rolePermission.roleId, roleId),
    })

    return { data: finalRolePermissions, error: null }
  } catch (error) {
    return throwError(error)
  }
}

const getAllRoles = async () => {
  try {
    const roles = await db.query.role.findMany({
      orderBy: [desc(role.createdAt)],
    })
    return { data: roles, error: null }
  } catch (error) {
    return throwError(error)
  }
}

export {
  createRole,
  updateRole,
  deleteRole,
  listRole,
  listRolePermission,
  deleteRolePermission,
  upsertRolePermission,
  getAllRoles,
}
