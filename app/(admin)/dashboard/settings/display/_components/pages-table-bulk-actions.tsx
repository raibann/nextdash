'use client'

import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { Page } from '@/server/actions/page-actions'
import { usePage } from './pages-provider'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const { setOpen, setCurrentRow } = usePage()

  if (selectedRows.length === 0) {
    return null
  }

  const handleBulkDelete = () => {
    // For now, just delete the first selected row
    // In a real implementation, you might want to delete all selected rows
    const firstRow = selectedRows[0]
    if (firstRow) {
      setCurrentRow(firstRow.original as Page)
      setOpen('delete')
      table.resetRowSelection()
    }
  }

  return (
    <BulkActionsToolbar table={table} entityName='page'>
      <div className='flex items-center gap-2'>
        <Button
          variant='destructive'
          size='sm'
          onClick={handleBulkDelete}
          className='h-8'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </Button>
      </div>
    </BulkActionsToolbar>
  )
}
