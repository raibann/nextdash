'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { updatePage, Page } from '@/server/actions/page-actions'
import { toast } from 'sonner'
import { getQueryClient } from '@/lib/react-query'

type PagesActiveSwitchProps = {
  page: Page
}

export function PagesActiveSwitch({ page }: PagesActiveSwitchProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true)
    try {
      const res = await updatePage({
        ...page,
        isActive: checked,
      })
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(
          `Page ${checked ? 'activated' : 'deactivated'} successfully`
        )
        getQueryClient().invalidateQueries({
          queryKey: ['pages'],
        })
        getQueryClient().invalidateQueries({
          queryKey: ['pages-hierarchy'],
        })
      }
    } catch {
      toast.error('Failed to update page status')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Switch
      checked={page.isActive}
      onCheckedChange={handleToggle}
      disabled={isUpdating}
    />
  )
}
