'use client'
import { RoleDialogs } from './_components/roles-dialogs'
import { RolesPrimaryButtons } from './_components/roles-primary-buttons'
import { RoleProvider } from './_components/roles-provider'
import RolesTable from './_components/roles-table'
import { roles } from './_data/roles'
import { Main } from '@/components/layout/main'

const Roles = () => {
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
        <RolesTable data={roles} search={{}} navigate={() => {}} />
      </Main>
      <RoleDialogs />
    </RoleProvider>
  )
}

export default Roles
