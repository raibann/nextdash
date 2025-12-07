import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './pages-table-row-actions'
import { PageWithChildren } from '@/server/actions/page-actions'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
import { PagesActiveSwitch } from './pages-active-switch'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CopyText from '@/components/copy-text'

export const pagesColumns: ColumnDef<PageWithChildren>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  //   {
  //     accessorKey: 'icon',
  //     header: ({ column }) => (
  //       <DataTableColumnHeader column={column} title='Icon' />
  //     ),
  //     cell: ({ row }) => {
  //       const page = row.original
  //       return (
  //         <div className='flex items-center justify-center w-8 h-8'>
  //           {page.icon ? (
  //             <DynamicIcon
  //               name={page.icon as IconName}
  //               className='h-4 w-4 text-muted-foreground'
  //             />
  //           ) : (
  //             <div className='w-4 h-4 rounded border border-dashed border-muted-foreground/50' />
  //           )}
  //         </div>
  //       )
  //     },
  //     enableSorting: false,
  //   },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      const page = row.original
      const depth = row.depth
      const indent = depth * 24 // 24px per level
      const hasChildren = row.original.pages && row.original.pages.length > 0
      const isExpanded = row.getIsExpanded()

      return (
        <div
          className='flex items-center space-x-2'
          style={{ paddingLeft: `${indent}px` }}
        >
          {hasChildren && (
            <Button
              variant='ghost'
              size='sm'
              className='h-6 w-6 p-0'
              onClick={() => row.toggleExpanded()}
            >
              {isExpanded ? (
                <ChevronDown className='h-4 w-4 text-muted-foreground' />
              ) : (
                <ChevronRight className='h-4 w-4 text-muted-foreground' />
              )}
              <span className='sr-only'>Toggle expanded</span>
            </Button>
          )}
          {page.icon ? (
            <DynamicIcon name={page.icon as IconName} className='size-4' />
          ) : (
            <div className='size-4 rounded border border-dashed border-muted-foreground/50' />
          )}
          <span className='font-medium'>{page.name}</span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'url',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Url' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      return <CopyText text={row.getValue('url') || ''} />
    },
    enableSorting: false,
  },
  {
    accessorKey: 'orderIndex',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      return (
        <span className='text-sm text-muted-foreground'>
          {row.getValue('orderIndex')}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Active' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      return <PagesActiveSwitch page={row.original} />
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
