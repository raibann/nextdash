import { db } from '@/db/drizzle'
import { user, role, permission, rolePermission, config } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'

// config keys
const ADMIN_CREATED_KEY = 'admin_created'

export async function createConfig() {
  try {
    const existingConfig = await db.query.config.findFirst({
      where: eq(config.key, ADMIN_CREATED_KEY),
    })
    if (!existingConfig) {
      await db.insert(config).values({
        key: ADMIN_CREATED_KEY,
        value: {
          type: 'boolean',
          value: false,
        },
      })
      console.log('✔ Config created successfully!')
    } else {
      console.log('✔ Config already existed!')
    }
    return true
  } catch (error) {
    console.error('❌ Config creation failed!', error)
    return false
  }
}

export async function createAdmin() {
  try {
    const email = process.env.BETTER_AUTH_ADMIN! || 'admin@example.com'
    const password = process.env.BETTER_AUTH_PWD! || 'admin@123'

    await db.transaction(async (trx) => {
      // Ensure roles exist
      let userRole = await trx.query.role.findFirst({
        where: eq(role.slug, 'user'),
      })
      if (!userRole) {
        const [newUserRole] = await trx
          .insert(role)
          .values({
            slug: 'user',
            name: 'User',
          })
          .returning()
        userRole = newUserRole
      }

      let adminRole = await trx.query.role.findFirst({
        where: eq(role.slug, 'admin'),
      })
      if (!adminRole) {
        const [newAdminRole] = await trx
          .insert(role)
          .values({
            slug: 'admin',
            name: 'Admin',
          })
          .returning()
        adminRole = newAdminRole
      }

      // Ensure 'all' permission exists and is assigned to admin
      let allPermission = await trx.query.permission.findFirst({
        where: eq(permission.slug, 'all'),
      })
      if (!allPermission) {
        const [createdPermission] = await trx
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
        const existingAssignment = await trx.query.rolePermission.findFirst({
          where: and(
            eq(rolePermission.roleId, adminRole.id),
            eq(rolePermission.permissionId, allPermission.id)
          ),
        })
        if (!existingAssignment) {
          await trx.insert(rolePermission).values({
            roleId: adminRole.id,
            permissionId: allPermission.id,
          })
        }
      }
      // ---- End: Permission setup ----

      // Check if admin created
      const adminCreated = await db.query.config.findFirst({
        where: eq(config.key, ADMIN_CREATED_KEY),
      })
      if (adminCreated && adminCreated.value.value === true) {
        console.log('✔ Admin already created!')
      } else {
        // Create admin user
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
          await trx
            .update(user)
            .set({ role: adminRole.slug })
            .where(eq(user.id, result.user.id))
          console.log('✔ Admin user created with admin role successfully!')
        } else {
          console.log('✔ Admin user created successfully!')
        }

        // Update config to true
        await trx
          .update(config)
          .set({ value: { type: 'boolean', value: true } })
          .where(eq(config.key, ADMIN_CREATED_KEY))
        console.log('✔ Admin created config updated successfully!')
      }
    })
  } catch (error) {
    console.error('Admin user creation failed', error)
  }
}
