import { db } from '@/db'
import { user } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function createAdmin() {
  try {
    const email = process.env.BETTER_AUTH_ADMIN! || 'admin@example.com'
    const password = process.env.BETTER_AUTH_PWD! || 'admin@123'
    const existUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    })
    if (existUser) {
      console.log('Admin already existed')
    } else {
      await auth.api.createUser({
        body: {
          email: email, // required
          password: password, // required
          name: 'Admin', // required
        },
      })
      console.log('Admin user created')
    }
  } catch (error) {
    console.error('Admin user creation failed', error)
  }
}
