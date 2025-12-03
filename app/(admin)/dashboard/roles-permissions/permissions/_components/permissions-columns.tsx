import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './data-table-row-actions'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import ClipboardButton from '@/components/clipboard-btn'
import { Permission } from '@/server/actions/permission-action'

export const permissionColumns: ColumnDef<Permission>[] = [
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
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => (
      <div className='w-25 flex items-center space-x-2 group'>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className='truncate'>{row.getValue('id')}</p>
          </TooltipTrigger>
          <TooltipContent>
            <p className='max-w-sm'>{row.getValue('id')}</p>
          </TooltipContent>
        </Tooltip>
        <ClipboardButton
          text={row.getValue('id')}
          className='hidden group-hover:block transition-all duration-300 ease-in-out'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      return (
        <div>
          <span className='text-sm capitalize'>{row.getValue('name')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'slug',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Slug' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      return (
        <div className='flex items-center space-x-2 group w-50'>
          <span className='text-sm'>{row.getValue('slug')}</span>
          <ClipboardButton
            text={row.getValue('slug')}
            className='hidden group-hover:block transition-all duration-300 ease-in-out'
          />
        </div>
      )
    },
  },
  {
    accessorKey: 'desc',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <div className='text-sm text-muted-foreground pl-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className='truncate'>{row.getValue('desc')}</p>
          </TooltipTrigger>
          <TooltipContent>
            <p className='max-w-sm'>{row.getValue('desc')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    ),
  },
  // {
  //   accessorKey: 'createdAt',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Created At' />
  //   ),
  //   cell: ({ row }) => {
  //     const createdAt = new Date(row.getValue('createdAt'))
  //     return (
  //       <time dateTime={createdAt.toISOString()} className='text-sm pl-2'>
  //         {createdAt.toLocaleDateString(undefined, {
  //           year: 'numeric',
  //           month: 'short',
  //           day: 'numeric',
  //         })}
  //       </time>
  //     )
  //   },
  // },
  // {
  //   accessorKey: 'updatedAt',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Updated At' />
  //   ),
  //   cell: ({ row }) => {
  //     const updatedAt = new Date(row.getValue('updatedAt'))
  //     return (
  //       <time dateTime={updatedAt.toISOString()} className='text-sm pl-2'>
  //         {updatedAt.toLocaleDateString(undefined, {
  //           year: 'numeric',
  //           month: 'short',
  //           day: 'numeric',
  //         })}
  //       </time>
  //     )
  //   },
  // },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
