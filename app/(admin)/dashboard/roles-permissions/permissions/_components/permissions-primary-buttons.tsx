'use client'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePermission } from './permissions-provider'

export function PermissionsPrimaryButtons() {
  const { setOpen } = usePermission()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Create</span> <Plus size={18} />
      </Button>
    </div>
  )
}
