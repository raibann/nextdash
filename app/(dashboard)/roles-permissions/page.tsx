'use client'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { RoleDialogs } from './_components/roles-dialogs'
import { RolesPrimaryButtons } from './_components/roles-primary-buttons'
import { RoleProvider } from './_components/roles-provider'
import RolesTable from './_components/roles-table'
import { Main } from '@/components/layout/main'
import { listRole } from '@/server/actions/role-action'
import { useDeferredValue, useState } from 'react'
import { PaginationState } from '@tanstack/react-table'

const Roles = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  })
  const [search, setSearch] = useState('')
  const searchValue = useDeferredValue(search)

  const {
    data: roles,
    isPending,
    error,
  } = useQuery({
    queryKey: ['roles', pagination, searchValue],
    queryFn: () =>
      listRole({
        ...pagination,
        search: searchValue,
      }),
    placeholderData: keepPreviousData,
  })

  return (
    <RoleProvider>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Roles</h2>
            <p className='text-muted-foreground'>Manage your roles.</p>
          </div>
          <RolesPrimaryButtons />
        </div>
        <RolesTable
          rowCount={roles?.rowCount || 0}
          loading={isPending}
          data={roles?.data || []}
          setPagination={setPagination}
          error={error}
          pagination={pagination}
          setGlobalFilter={setSearch}
          globalFilter={search}
        />
      </Main>
      <RoleDialogs />
    </RoleProvider>
  )
}

export default Roles
