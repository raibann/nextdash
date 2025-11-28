'use client'
import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'

type RoleDialogType = 'create' | 'update' | 'delete' | 'permission'

type RoleContextType = {
  open: RoleDialogType | null
  setOpen: (str: RoleDialogType | null) => void
  currentRow: RolePermRes.Role | null
  setCurrentRow: React.Dispatch<React.SetStateAction<RolePermRes.Role | null>>
}

const RoleContext = React.createContext<RoleContextType | null>(null)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<RoleDialogType>(null)
  const [currentRow, setCurrentRow] = useState<RolePermRes.Role | null>(null)

  return (
    <RoleContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </RoleContext>
  )
}

export const useRole = () => {
  const rolesContext = React.useContext(RoleContext)

  if (!rolesContext) {
    throw new Error('useRole has to be used within <RoleContext>')
  }

  return rolesContext
}
