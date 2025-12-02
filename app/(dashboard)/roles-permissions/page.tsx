'use client'
import { useQuery } from '@tanstack/react-query'
import { RoleDialogs } from './_components/roles-dialogs'
import { RolesPrimaryButtons } from './_components/roles-primary-buttons'
import { RoleProvider } from './_components/roles-provider'
import RolesTable from './_components/roles-table'
import { Main } from '@/components/layout/main'
import { listRole } from '@/server/actions/role-action'
import { useDeferredValue, useState } from 'react'

const Roles = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const searchValue = useDeferredValue(search)
  const {
    data: roles,
    isPending,
    error,
  } = useQuery({
    queryKey: ['roles', page, pageSize, searchValue],
    queryFn: () =>
      listRole({
        page: page,
        pageSize: pageSize,
        search: searchValue,
      }),
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
          loading={isPending}
          data={roles?.data || []}
          error={error}
          search={{}}
          navigate={() => {}}
        />
      </Main>
      <RoleDialogs />
    </RoleProvider>
  )
}

export default Roles
