'use client'
import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Page } from '@/server/actions/page-actions'

type PageDialogType = 'create' | 'update' | 'delete'

type PageContextType = {
  open: PageDialogType | null
  setOpen: (str: PageDialogType | null) => void
  currentRow: Page | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Page | null>>
  toggleAllRowsExpanded: ((shouldExpand: boolean) => void) | null
  setToggleAllRowsExpanded: React.Dispatch<
    React.SetStateAction<(() => void) | null>
  >
  isAllRowsExpanded: boolean
  setIsAllRowsExpanded: React.Dispatch<React.SetStateAction<boolean>>
}

const PageContext = React.createContext<PageContextType | null>(null)

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<PageDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Page | null>(null)
  const [toggleAllRowsExpanded, setToggleAllRowsExpanded] = useState<
    (() => void) | null
  >(null)
  const [isAllRowsExpanded, setIsAllRowsExpanded] = useState(false)

  return (
    <PageContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        toggleAllRowsExpanded,
        setToggleAllRowsExpanded,
        isAllRowsExpanded,
        setIsAllRowsExpanded,
      }}
    >
      {children}
    </PageContext.Provider>
  )
}

export const usePage = () => {
  const pageContext = React.useContext(PageContext)

  if (!pageContext) {
    throw new Error('usePage has to be used within <PageProvider>')
  }

  return pageContext
}
