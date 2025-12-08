'use client'
import { createContext, useContext } from 'react'
import type { Session } from '@/lib/auth'

type UserContextType = {
  session: Session | null
  user: Session['user'] | null
  permissions: string[]
}

const UserContext = createContext<UserContextType | null>(null)

type UserProviderProps = {
  children: React.ReactNode
  session: Session | null
  permissions: string[]
}

export function UserProvider({
  children,
  session,
  permissions,
}: UserProviderProps) {
  const contextValue: UserContextType = {
    session,
    user: session?.user || null,
    permissions,
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
