import { db } from '@/db/drizzle'
import { user, role, permission, rolePermission } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

export async function createAdmin() {
  try {
    const email = process.env.BETTER_AUTH_ADMIN! || 'admin@example.com'
    const password = process.env.BETTER_AUTH_PWD! || 'admin@123'

    // Ensure roles exist
    let userRole = await db.query.role.findFirst({
      where: eq(role.slug, 'user'),
    })
    if (!userRole) {
      const [newUserRole] = await db
        .insert(role)
        .values({
          slug: 'user',
          name: 'User',
        })
        .returning()
      userRole = newUserRole
    }

    let adminRole = await db.query.role.findFirst({
      where: eq(role.slug, 'admin'),
    })
    if (!adminRole) {
      const [newAdminRole] = await db
        .insert(role)
        .values({
          slug: 'admin',
          name: 'Admin',
        })
        .returning()
      adminRole = newAdminRole
    }

    // Ensure 'all' permission exists and is assigned to admin
    let allPermission = await db.query.permission.findFirst({
      where: eq(permission.slug, 'all'),
    })
    if (!allPermission) {
      const [createdPermission] = await db
        .insert(permission)
        .values({
          slug: 'all',
          name: 'Access All',
        })
        .returning()
      allPermission = createdPermission
    }
    // Assign 'all' permission to admin role if not already assigned
    if (allPermission) {
      const existingAssignment = await db.query.rolePermission.findFirst({
        where: and(
          eq(rolePermission.roleId, adminRole.id),
          eq(rolePermission.permissionId, allPermission.id)
        ),
      })
      if (!existingAssignment) {
        await db.insert(rolePermission).values({
          roleId: adminRole.id,
          permissionId: allPermission.id,
        })
      }
    }
    // ---- End: Permission setup ----

    const existUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    })
    if (existUser) {
      console.log('Admin already existed')
      // Update role if needed
      if (adminRole && existUser.role !== adminRole.slug) {
        await db
          .update(user)
          .set({ role: adminRole.slug })
          .where(eq(user.id, existUser.id))
        console.log('Admin role updated')
      }
    } else {
      // Create user without role first (BetterAuth will handle it)
      const result = await auth.api.createUser({
        body: {
          email: email, // required
          password: password, // required
          name: 'Admin', // required
          data: {
            username: 'admin',
            displayUsername: 'Admin',
          },
        },
      })

      // Update user with admin role after creation
      if (result.user?.id && adminRole) {
        await db
          .update(user)
          .set({ role: adminRole.slug })
          .where(eq(user.id, result.user.id))
        console.log('Admin user created with admin role')
      } else {
        console.log('Admin user created')
      }
    }
  } catch (error) {
    console.error('Admin user creation failed', error)
  }
}
