'use client'
import { Main } from '@/components/layout/main'
import PermissionTable from './_components/permissions-table'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listPermission } from '@/server/actions/permission-action'
import { useDeferredValue, useState } from 'react'
import { PaginationState } from '@tanstack/react-table'
import { PermissionsPrimaryButtons } from './_components/permissions-primary-buttons'
import { PermissionProvider } from './_components/permissions-provider'
import { PermissionDialogs } from './_components/permissions-dialogs'

const PermissionPage = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  })
  const [search, setSearch] = useState('')
  const searchValue = useDeferredValue(search)

  const {
    data: permissions,
    isPending,
    error,
  } = useQuery({
    queryKey: ['permissions', pagination, searchValue],
    queryFn: () =>
      listPermission({
        ...pagination,
        search: searchValue,
      }),
    placeholderData: keepPreviousData,
  })
  return (
    <PermissionProvider>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Permissions</h2>
            <p className='text-muted-foreground'>Manage your permissions.</p>
          </div>
          <PermissionsPrimaryButtons />
        </div>
        <PermissionTable
          rowCount={permissions?.rowCount || 0}
          loading={isPending}
          data={permissions?.data || []}
          setPagination={setPagination}
          error={error}
          pagination={pagination}
          setGlobalFilter={setSearch}
          globalFilter={search}
        />
      </Main>
      <PermissionDialogs />
    </PermissionProvider>
  )
}

export default PermissionPage
