import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { RoleTableRowActions } from './roles-table-row-actions'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import ClipboardButton from '@/components/clipboard-btn'
import { Role } from '@/server/actions/role-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRole } from './roles-provider'

export const rolesColumns: ColumnDef<Role>[] = [
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
      <div className='max-w-25 flex items-center space-x-2 group'>
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
      const icon = row.original.icon
      return (
        <div className='flex space-x-2 w-25'>
          {icon && (
            <DynamicIcon
              className='h-4 w-4 shrink-0'
              name={icon as IconName}
              aria-hidden='true'
            />
          )}
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
    cell: ({ row }) => {
      return (
        <div className='flex items-center space-x-2 group'>
          <span className='text-sm pl-2'>{row.getValue('slug')}</span>
          <ClipboardButton
            text={row.getValue('slug')}
            className='hidden group-hover:block transition-all duration-300 ease-in-out'
          />
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'permission',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Permissions' />
    ),
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { setOpen, setCurrentRow } = useRole()
      return (
        <div className='flex flex-wrap gap-2 w-50'>
          {row.original.rolePermissions.slice(0, 3).map((rolePermission) => (
            <Badge
              key={rolePermission.permission.id}
              variant={'secondary'}
              className='text-xs hover:border-border'
            >
              {rolePermission.permission.name}
            </Badge>
          ))}
          {row.original.rolePermissions.length > 3 && (
            <Badge
              variant={'secondary'}
              className='text-xs cursor-pointer hover:border-border'
              onClick={() => {
                setOpen('permission')
                setCurrentRow(row.original)
              }}
            >
              +{row.original.rolePermissions.length - 3}
            </Badge>
          )}
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
      <div className='max-w-50 text-sm text-muted-foreground pl-2'>
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
    enableSorting: false,
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
    cell: ({ row }) => <RoleTableRowActions row={row} />,
  },
]
