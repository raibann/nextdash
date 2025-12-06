'use client'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePage } from './pages-provider'

export function PagesPrimaryButtons() {
  const { setOpen, toggleAllRowsExpanded, isAllRowsExpanded } = usePage()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        onClick={() => {
          if (toggleAllRowsExpanded) {
            toggleAllRowsExpanded(!isAllRowsExpanded)
          }
        }}
      >
        Expand All
        {isAllRowsExpanded ? (
          <ChevronUp className='h-4 w-4 text-muted-foreground' />
        ) : (
          <ChevronDown className='h-4 w-4 text-muted-foreground' />
        )}
      </Button>

      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Create</span> <Plus size={18} />
      </Button>
    </div>
  )
}
