'use client'
import RolesTable from './_components/roles-table'
import { roles } from './_data/roles'
import { Main } from '@/components/layout/main'

const Roles = () => {
  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Roles</h2>
          <p className='text-muted-foreground'>Manage your roles.</p>
        </div>
        {/* <UsersPrimaryButtons /> */}
      </div>
      <RolesTable data={roles} search={{}} navigate={() => {}} />
    </Main>
  )
}

export default Roles
