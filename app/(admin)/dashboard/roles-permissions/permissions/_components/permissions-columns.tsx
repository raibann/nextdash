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
import { Permission } from '@/server/actions/permission-actions'
import { LongText } from '@/components/long-text'
import CopyText from '@/components/copy-text'

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
        <div className='w-25'>
          <span className='text-sm capitalize'>{row.getValue('name')}</span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'slug',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Slug' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      return <CopyText text={row.getValue('slug')} />
    },
    enableSorting: false,
  },
  {
    accessorKey: 'desc',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <LongText className='w-50 pl-2'>{row.getValue('desc')}</LongText>
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
