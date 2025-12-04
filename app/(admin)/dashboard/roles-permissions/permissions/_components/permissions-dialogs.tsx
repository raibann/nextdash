'use client'
// import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { getQueryClient } from '@/lib/react-query'
import { deletePermission } from '@/server/actions/permission-actions'
import { PermissionsMutateDrawer } from './permissions-mutate-drawer'
import { usePermission } from './permissions-provider'

export function PermissionDialogs() {
  const [isPending, startTransition] = useTransition()
  const { open, setOpen, currentRow, setCurrentRow } = usePermission()

  const handleConfirmDelete = (id: string) => {
    startTransition(async () => {
      const res = await deletePermission(id)
      if (res?.error !== null) {
        toast.error(res?.error)
      }
      if (res?.data) {
        toast.success('Deleted Permission!')
        setOpen(null)
        getQueryClient().invalidateQueries({
          queryKey: ['permissions'],
        })
      }
    })
  }
  return (
    <>
      <PermissionsMutateDrawer
        key='permission-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <PermissionsMutateDrawer
            key={`permission-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='permission-delete'
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
            title={`Delete this permission: ${currentRow.id} ?`}
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
