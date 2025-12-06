import { createAuthClient } from 'better-auth/react'
import type { auth } from './auth'
import {
  inferAdditionalFields,
  adminClient,
  // organizationClient,
  usernameClient,
} from 'better-auth/client/plugins'
/**
 * The authClient is used to interact with Better-Auth from the client-side.
 */
// console.log("auth", process.env.BETTER_AUTH_URL);
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL! || 'http://localhost:3000',
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient(),
    usernameClient(),
    // organizationClient(),
  ],
})

export type Session = typeof authClient.$Infer.Session

export const { signIn, signOut, signUp, useSession } = authClient
