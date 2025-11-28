'use client'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRole } from './roles-provider'

export function RolesPrimaryButtons() {
  const { setOpen } = useRole()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Create</span> <Plus size={18} />
      </Button>
    </div>
  )
}
