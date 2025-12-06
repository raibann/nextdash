'use client'
import { createContext, useContext } from 'react'
import type { Session } from '@/lib/auth'

type UserContextType = {
  session: Session | null
  user: Session['user'] | null
}

const UserContext = createContext<UserContextType | null>(null)

type UserProviderProps = {
  children: React.ReactNode
  session: Session | null
}

export function UserProvider({ children, session }: UserProviderProps) {
  const contextValue: UserContextType = {
    session,
    user: session?.user || null,
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
