'use client'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { getQueryClient } from '@/lib/react-query'
import { deletePage } from '@/server/actions/page-actions'
import { PagesMutateDrawer } from './pages-mutate-drawer'
import { usePage } from './pages-provider'

export function PagesDialogs() {
  const [isPending, startTransition] = useTransition()
  const { open, setOpen, currentRow, setCurrentRow } = usePage()

  const handleConfirmDelete = (id: string) => {
    startTransition(async () => {
      const res = await deletePage(id)
      if (res?.error !== null) {
        toast.error(res?.error)
        return
      }
      if (res?.data) {
        toast.success('Deleted Page!')
        setOpen(null)
        getQueryClient().invalidateQueries({
          queryKey: ['pages'],
        })
        getQueryClient().invalidateQueries({
          queryKey: ['pages-hierarchy'],
        })
      }
    })
  }
  return (
    <>
      <PagesMutateDrawer
        key='page-create'
        open={open === 'create'}
        onOpenChange={(v) => {
          setOpen(v ? 'create' : null)
        }}
      />

      {currentRow && (
        <>
          <PagesMutateDrawer
            key={`page-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(v) => {
              setOpen(v ? 'update' : null)
              if (!v) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='page-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(v) => {
              setOpen(v ? 'delete' : null)
              if (!v) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            isLoading={isPending}
            handleConfirm={() => handleConfirmDelete(currentRow.id)}
            className='max-w-md'
            title={`Delete this page: ${currentRow.name}?`}
            desc={
              <>
                You are about to delete a page with the name{' '}
                <strong>{currentRow.name}</strong>. <br />
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
