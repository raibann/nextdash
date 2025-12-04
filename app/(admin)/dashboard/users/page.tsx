'use client'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './_components/users-dialogs'
import { UsersPrimaryButtons } from './_components/users-primary-buttons'
import { UsersProvider } from './_components/users-provider'
import { UsersTable } from './_components/users-table'
import { PaginationState } from '@tanstack/react-table'
import { useDeferredValue, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listUser } from '@/server/actions/user-actions'

export default function UsersPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  })
  const [search, setSearch] = useState('')
  const searchValue = useDeferredValue(search)

  const { data, isPending, error } = useQuery({
    queryKey: ['users', pagination, searchValue],
    queryFn: () =>
      listUser({
        ...pagination,
        search: searchValue,
      }),
    placeholderData: keepPreviousData,
  })

  console.log('list-user', data)
  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable
          rowCount={data?.rowCount || 0}
          loading={isPending}
          data={data?.data || []}
          setPagination={setPagination}
          error={error}
          pagination={pagination}
          setGlobalFilter={setSearch}
          globalFilter={search}
        />
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
