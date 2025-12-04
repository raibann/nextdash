'use server'

import { db } from '@/db'
import { user } from '@/db/schema'
import { auth } from '@/lib/auth'
import { throwClientError } from '@/lib/error-utils'
import { desc, ilike, or, sql } from 'drizzle-orm'
import { headers } from 'next/headers'

export type User = typeof user.$inferSelect

const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
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

export { getSession, signUpWithEmail, signInWithEmail, listUser }
