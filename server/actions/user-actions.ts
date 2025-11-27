'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const userAuthed = async () => {
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
    return { data: null, error }
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
    return { data: null, error }
  }
}

export { userAuthed, signUpWithEmail, signInWithEmail }
