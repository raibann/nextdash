'use client'
// import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useRole } from './roles-provider'
import { RolesMutateDrawer } from './roles-mutate-drawer'
import RolesPermissionsDialog from './roles-permissions-dialog'
import { useTransition } from 'react'
import { deleteRole } from '@/server/actions/role-actions'
import { toast } from 'sonner'
import { getQueryClient } from '@/lib/react-query'

export function RoleDialogs() {
  const [isPending, startTransition] = useTransition()
  const { open, setOpen, currentRow, setCurrentRow } = useRole()

  const handleConfirmDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteRole(id)
      if (res.error !== null) {
        toast.error(res.error)
      }
      if (res.data) {
        toast.success('Deleted Role!')
        setOpen(null)
        getQueryClient().invalidateQueries({
          queryKey: ['roles'],
        })
      }
    })
  }
  return (
    <>
      <RolesMutateDrawer
        key='role-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <RolesMutateDrawer
            key={`role-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <RolesPermissionsDialog
            key={`role-permission-${currentRow.id}`}
            open={open == 'permission'}
            onOpenChange={() => {
              setOpen('permission')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
          />

          <ConfirmDialog
            key='role-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            isLoading={isPending}
            handleConfirm={() => handleConfirmDelete(currentRow.id)}
            className='max-w-md'
            title={`Delete this role: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a task with the ID{' '}
                <strong>{currentRow.id}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}
