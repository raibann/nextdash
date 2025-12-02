import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/db'
import { admin, openAPI } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'

export const auth = betterAuth({
  appName: process.env.NEXT_PUBLIC_APP_NAME!,
  secret: process.env.BETTER_AUTH_SECRET!,
  /**
   * The Drizzle adapter connects Better-Auth to your database using Drizzle ORM.
   */
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  /**
   * Plugins extend the functionality of Better-Auth. The admin plugin provides an admin dashboard
   */
  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
    nextCookies(),
    openAPI({
      disableDefaultReference: process.env.NODE_ENV !== 'development',
    }),
  ],
  /**
   * Database joins is useful when Better-Auth needs to fetch related data from multiple tables in a single query.
   * Endpoints like /get-session, /get-full-organization and many others benefit greatly from this feature,
   * seeing upwards of 2x to 3x performance improvements depending on database latency.
   */
  experimental: { joins: true },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  //   facebook: {
  //     clientId: process.env.FACEBOOK_CLIENT_ID!,
  //     clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  //   },
  // },
  logger: {
    disabled: false,
    disableColors: false,
    level: 'error',
    log: (level, message, ...args) => {
      // Custom logging implementation
      console.log(`[${level}] ${message}`, ...args)
    },
  },
})

export type Session = typeof auth.$Infer.Session
