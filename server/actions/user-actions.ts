'use server'

import { db } from '@/db/drizzle'
import { role, user } from '@/db/schema'
import { auth } from '@/lib/auth'
import { throwClientError, throwError } from '@/lib/error-utils'
import { desc, eq, ilike, or, sql } from 'drizzle-orm'
import { headers } from 'next/headers'

export type User = typeof user.$inferSelect & {
  roleRelation: typeof role.$inferSelect | null
}

export type CreateUser = {
  name: string
  email: string
  password: string
  role: string // role slug
  username: string
  displayUsername: string
}

export type UpdateUser = {
  id: string
  name: string
  email: string
  password?: string
  role: string // role slug
  username: string
  displayUsername: string
}

const signUpWithEmail = async (req: UserReq.SingUpWithEmail) => {
  try {
    const data = await auth.api.signUpEmail({
      body: {
        name: req.name,
        email: req.email,
        password: req.password,
        image: req.image,
        callbackURL: req.callbackURL,
        // Remove rememberMe - not supported for signUp
      },
    })
    return { data, error: null }
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error: error.message }
    }
    console.error(error)
    return { data: null, error: 'Something went wrong!' }
  }
}
const signInWithEmail = async (req: UserReq.SingInWithEmail) => {
  try {
    const data = await auth.api.signInEmail({
      body: {
        email: req.email,
        password: req.password,
        callbackURL: req.callbackURL,
      },
      headers: await headers(),
    })
    return { data, error: null }
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error: error.message }
    }
    console.error(error)
    return { data: null, error: 'Something went wrong!' }
  }
}

const listUser = async ({
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
      ? or(ilike(user.name, `%${search}%`), ilike(user.id, `%${search}%`))
      : undefined
    const data = await db.query.user.findMany({
      where,
      limit: pageSize,
      offset: pageIndex * pageSize,
      orderBy: [desc(user.createdAt)],
      with: {
        roleRelation: true,
      },
    })

    // Count total for TanStack Table pagination
    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
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

const createUser = async (body: CreateUser) => {
  try {
    // Check if user already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, body.email),
    })

    if (existingUser) {
      return { data: null, error: 'User with this email already exists!' }
    }

    // // Verify role exists
    // const roleExists = await db.query.role.findFirst({
    //   where: eq(role.slug, body.role),
    // })

    // if (!roleExists) {
    //   return { data: null, error: 'Invalid role selected!' }
    // }

    // Create user via BetterAuth
    const result = await auth.api.createUser({
      body: {
        name: body.name,
        email: body.email,
        password: body.password,
        data: {
          username: body.username,
          displayUsername: body.displayUsername,
        },
      },
    })

    if (!result.user?.id) {
      return { data: null, error: 'Failed to create user!' }
    }

    // Update user with role
    await db
      .update(user)
      .set({ role: body.role })
      .where(eq(user.id, result.user.id))

    // Fetch the created user with role relation
    const createdUser = await db.query.user.findFirst({
      where: eq(user.id, result.user.id),
      with: {
        roleRelation: true,
      },
    })

    return { data: createdUser, error: null }
  } catch (error) {
    return throwError(error)
  }
}

const updateUser = async (body: UpdateUser) => {
  try {
    // Check if user exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, body.id),
    })

    if (!existingUser) {
      return { data: null, error: 'User not found!' }
    }

    // Check if email is being changed and if new email already exists
    if (body.email !== existingUser.email) {
      const emailExists = await db.query.user.findFirst({
        where: eq(user.email, body.email),
      })

      if (emailExists) {
        return { data: null, error: 'User with this email already exists!' }
      }
    }

    // // Verify role exists
    // const roleExists = await db.query.role.findFirst({
    //   where: eq(role.slug, body.role),
    // })

    // if (!roleExists) {
    //   return { data: null, error: 'Invalid role selected!' }
    // }

    if (body.password && body.password.trim().length > 0) {
      await auth.api.setUserPassword({
        body: {
          newPassword: body.password, // required
          userId: body.id, // required
        },
        // This endpoint requires session cookies.
        headers: await headers(),
      })
    }

    const data = await auth.api.adminUpdateUser({
      body: {
        userId: body.id, // required
        data: {
          name: body.name,
          email: body.email,
          role: body.role,
          username: body.username,
          displayUsername: body.displayUsername,
        }, // required
      },
      // This endpoint requires session cookies.
      headers: await headers(),
    })

    return { data: data, error: null }
  } catch (error) {
    return throwError(error)
  }
}

export { signUpWithEmail, signInWithEmail, listUser, createUser, updateUser }
