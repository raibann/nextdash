'use client'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { RoleDialogs } from './_components/roles-dialogs'
import { RolesPrimaryButtons } from './_components/roles-primary-buttons'
import RolesTable from './_components/roles-table'
import { Main } from '@/components/layout/main'
import { listRole } from '@/server/actions/role-actions'
import { useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTableUrlState } from '@/hooks/use-table-url-state'

const Roles = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Parse search params into a record
  const search = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams]
  )

  // Create navigate function compatible with use-table-url-state
  const navigate = useMemo(() => {
    return (opts: {
      search:
        | true
        | Record<string, unknown>
        | ((
            prev: Record<string, unknown>
          ) => Partial<Record<string, unknown>> | Record<string, unknown>)
      replace?: boolean
    }) => {
      const current = new URLSearchParams(searchParams.toString())
      const update = opts.search

      let nextSearch: Record<string, unknown>
      if (update === true) {
        nextSearch = Object.fromEntries(current.entries())
      } else if (typeof update === 'function') {
        nextSearch = update(Object.fromEntries(current.entries()))
      } else {
        nextSearch = update
      }

      // Update URL search params
      const newParams = new URLSearchParams()
      for (const [key, value] of Object.entries(nextSearch)) {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => newParams.append(key, String(v)))
          } else {
            newParams.set(key, String(value))
          }
        }
      }

      const newSearch = newParams.toString()
      const newUrl = newSearch
        ? `${window.location.pathname}?${newSearch}`
        : window.location.pathname

      if (opts.replace) {
        router.replace(newUrl)
      } else {
        router.push(newUrl)
      }
    }
  }, [searchParams, router])

  // Use the hook to manage table state from URL
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [],
  })

  // Build query key from URL state
  const queryKey = useMemo(
    () => ['roles', pagination, globalFilter, columnFilters],
    [pagination, globalFilter, columnFilters]
  )

  const { data, isPending, error } = useQuery({
    queryKey,
    queryFn: () =>
      listRole({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        search: globalFilter || '',
      }),
    placeholderData: keepPreviousData,
  })

  // Ensure page is in range when data changes
  const pageCount = data?.rowCount
    ? Math.ceil(data.rowCount / pagination.pageSize)
    : 0
  useEffect(() => {
    if (pageCount > 0) {
      ensurePageInRange(pageCount)
    }
  }, [pageCount, ensurePageInRange])

  return (
    <>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Roles</h2>
            <p className='text-muted-foreground'>Manage your roles.</p>
          </div>
          <RolesPrimaryButtons />
        </div>
        <RolesTable
          data={data?.data || []}
          rowCount={data?.rowCount || 0}
          loading={isPending}
          error={error}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          globalFilter={globalFilter}
          onGlobalFilterChange={onGlobalFilterChange}
          columnFilters={columnFilters}
          onColumnFiltersChange={onColumnFiltersChange}
          ensurePageInRange={ensurePageInRange}
        />
      </Main>
      <RoleDialogs />
    </>
  )
}

export default Roles
