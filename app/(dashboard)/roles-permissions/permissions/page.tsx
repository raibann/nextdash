'use client'
import { Main } from '@/components/layout/main'
import PermissionTable from './_components/permissions-table'
import { permissions } from './_data/permissions'

const PermissionPage = () => {
  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Permissions</h2>
          <p className='text-muted-foreground'>Manage your permissions.</p>
        </div>
        {/* <UsersPrimaryButtons /> */}
      </div>
      <PermissionTable data={permissions} search={{}} navigate={() => {}} />
    </Main>
  )
}

export default PermissionPage
