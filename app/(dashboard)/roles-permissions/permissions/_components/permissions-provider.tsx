'use client'
import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Permission } from '@/server/actions/permission-action'

type PermissionDialogType = 'create' | 'update' | 'delete'

type PermissionContextType = {
  open: PermissionDialogType | null
  setOpen: (str: PermissionDialogType | null) => void
  currentRow: Permission | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Permission | null>>
}

const PermissionContext = React.createContext<PermissionContextType | null>(
  null
)

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<PermissionDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Permission | null>(null)

  return (
    <PermissionContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PermissionContext>
  )
}

export const usePermission = () => {
  const rolesContext = React.useContext(PermissionContext)

  if (!rolesContext) {
    throw new Error('usePermission has to be used within <PermissionContext>')
  }

  return rolesContext
}
