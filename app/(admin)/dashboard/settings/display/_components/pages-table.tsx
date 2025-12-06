'use client'

import { DataTablePagination } from '@/components/data-table'
import { DataTableToolbar } from '@/components/data-table/toolbar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  SortingState,
  VisibilityState,
  getFilteredRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  useReactTable,
  flexRender,
  PaginationState,
  OnChangeFn,
  ColumnFiltersState,
  ExpandedState,
  type Table as TanStackTable,
} from '@tanstack/react-table'
import { useEffect, useState, useRef } from 'react'
import { DataTableBulkActions } from './pages-table-bulk-actions'
import { pagesColumns as columns } from './pages-columns'
import { Skeleton } from '@/components/ui/skeleton'
import { PageWithChildren } from '@/server/actions/page-actions'
import { usePage } from './pages-provider'

type DataTableProps = {
  data: PageWithChildren[]
  rowCount: number
  loading: boolean
  error: Error | null
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  ensurePageInRange: (
    pageCount: number,
    opts?: { resetTo?: 'first' | 'last' }
  ) => void
}

const PagesTable = ({
  data,
  rowCount,
  loading,
  error,
  pagination,
  onPaginationChange,
  globalFilter,
  onGlobalFilterChange,
  columnFilters,
  onColumnFiltersChange,
  ensurePageInRange,
}: DataTableProps) => {
  const { setToggleAllRowsExpanded, setIsAllRowsExpanded } = usePage()
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [expanded, setExpanded] = useState<ExpandedState>({})

  // Use refs to store latest values for the toggle function
  const expandedRef = useRef<ExpandedState>({})
  const tableRef = useRef<TanStackTable<PageWithChildren> | null>(null)

  // Keep refs in sync
  useEffect(() => {
    expandedRef.current = expanded
  }, [expanded])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnVisibility,
      globalFilter,
      columnFilters,
      expanded,
    },
    getSubRows: (row) => row.pages,
    onExpandedChange: setExpanded,
    // pagination
    rowCount: rowCount,
    manualPagination: true,
    onPaginationChange: onPaginationChange,
    // filter
    manualFiltering: true,
    onGlobalFilterChange: onGlobalFilterChange,
    onColumnFiltersChange: onColumnFiltersChange,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const name = String(row.getValue('name')).toLowerCase()
      const slug = String(row.getValue('slug')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return name.includes(searchValue) || slug.includes(searchValue)
    },
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  // Keep table ref in sync
  useEffect(() => {
    tableRef.current = table
  }, [table])

  // Register toggle function with provider
  useEffect(() => {
    const toggleFn = (shouldExpand: boolean) => {
      const currentTable = tableRef.current
      if (!currentTable) return

      // Traverse data structure and build row IDs (TanStack uses dot-separated indices for nested rows)
      const buildRowIds = (
        items: PageWithChildren[],
        parentPath: string = ''
      ): string[] => {
        const ids: string[] = []
        items.forEach((item, index) => {
          const rowId = parentPath ? `${parentPath}.${index}` : `${index}`
          if (item.pages && item.pages.length > 0) {
            ids.push(rowId)
            // Recursively get nested IDs
            const nestedIds = buildRowIds(item.pages, rowId)
            ids.push(...nestedIds)
          }
        })
        return ids
      }

      const allExpandableIds = buildRowIds(data)

      if (allExpandableIds.length === 0) return

      // Get current expanded state
      const currentExpanded = expandedRef.current
      const prevState =
        typeof currentExpanded === 'object' && currentExpanded !== null
          ? currentExpanded
          : {}

      // Create new expanded state
      const newExpanded: Record<string, boolean> = { ...prevState }

      if (shouldExpand) {
        // Expand all expandable rows (including nested)
        allExpandableIds.forEach((rowId) => {
          newExpanded[rowId] = true
        })
      } else {
        // Collapse all expandable rows (including nested)
        allExpandableIds.forEach((rowId) => {
          delete newExpanded[rowId]
        })
      }

      setExpanded(newExpanded as ExpandedState)
    }

    setToggleAllRowsExpanded(() => toggleFn)
  }, [setToggleAllRowsExpanded, setExpanded, data])

  // Update expansion state in provider
  useEffect(() => {
    const rows = table.getRowModel().rows
    const expandableRows = rows.filter(
      (row) => row.original.pages && row.original.pages.length > 0
    )

    if (expandableRows.length === 0) {
      setIsAllRowsExpanded(false)
      return
    }

    const allExpanded = expandableRows.every((row) => row.getIsExpanded())
    setIsAllRowsExpanded(allExpanded)
  }, [expanded, table, setIsAllRowsExpanded])

  // Ensure page is in range when page count changes
  const pageCount = table.getPageCount()
  useEffect(() => {
    if (pageCount > 0) {
      ensurePageInRange(pageCount)
    }
  }, [pageCount, ensurePageInRange])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar table={table} searchPlaceholder='Filter pages...' />
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
      {rowCount > 1000 && (
        <DataTablePagination table={table} className='mt-auto' />
      )}
      <DataTableBulkActions table={table} />
    </div>
  )
}

export default PagesTable
