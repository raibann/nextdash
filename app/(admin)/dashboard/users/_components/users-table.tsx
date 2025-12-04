import { Dispatch, SetStateAction, useState } from 'react'
import {
  OnChangeFn,
  PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { roles } from '../_data/data'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { usersColumns as columns } from './users-columns'
import { User } from '@/server/actions/user-actions'
import { Skeleton } from '@/components/ui/skeleton'

type DataTableProps = {
  data: User[]
  rowCount: number
  pagination?: PaginationState
  setPagination: Dispatch<SetStateAction<PaginationState>>
  loading: boolean
  error: Error | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setGlobalFilter: OnChangeFn<any>
  globalFilter?: string
}

export function UsersTable({
  data,
  rowCount,
  loading,
  error,
  pagination,
  setPagination,
  globalFilter,
  setGlobalFilter,
}: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Local state management for table (uncomment to use local-only state, not synced with URL)
  // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
  // const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  // Synced with URL states (keys/defaults mirror users route search schema)
  // const {
  //   columnFilters,
  //   onColumnFiltersChange,
  //   pagination,
  //   onPaginationChange,
  //   ensurePageInRange,
  // } = useTableUrlState({
  //   search,
  //   navigate,
  //   pagination: { defaultPage: 1, defaultPageSize: 10 },
  //   globalFilter: { enabled: false },
  //   columnFilters: [
  //     // username per-column text filter
  //     { columnId: 'username', searchKey: 'username', type: 'string' },
  //     { columnId: 'status', searchKey: 'status', type: 'array' },
  //     { columnId: 'role', searchKey: 'role', type: 'array' },
  //   ],
  // })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      // columnFilters,
      columnVisibility,
      globalFilter,
    },
    enableRowSelection: true,
    // pagination
    rowCount: rowCount,
    manualPagination: true,
    onPaginationChange: setPagination,
    // filter
    manualFiltering: true,
    onGlobalFilterChange: setGlobalFilter,
    // onPaginationChange,
    // onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // useEffect(() => {
  //   ensurePageInRange(table.getPageCount())
  // }, [table, ensurePageInRange])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter users...'
        // searchPlaceholder='Filter users...'
        // searchKey='username'
        // filters={[
        //   {
        //     columnId: 'status',
        //     title: 'Status',
        //     options: [
        //       { label: 'Active', value: 'active' },
        //       { label: 'Inactive', value: 'inactive' },
        //       { label: 'Invited', value: 'invited' },
        //       { label: 'Suspended', value: 'suspended' },
        //     ],
        //   },
        //   {
        //     columnId: 'role',
        //     title: 'Role',
        //     options: roles.map((role) => ({ ...role })),
        //   },
        // ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(3)
                .fill('')
                .map((_, ind) => (
                  <TableRow key={ind}>
                    {Array(columns.length)
                      .fill('')
                      .map((_, idx) => (
                        <TableCell className='h-10 text-center' key={idx}>
                          <Skeleton className='h-full' />
                        </TableCell>
                      ))}
                  </TableRow>
                ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {error.message}
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} />
    </div>
  )
}
