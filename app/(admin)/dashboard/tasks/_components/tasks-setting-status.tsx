import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { IconName, IconPicker } from '@/components/ui/icon-picker'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { getQueryClient } from '@/lib/react-query'
import {
  TaskStatus,
  listTaskStatus,
  updateTaskStatus,
  createTaskStatus,
  deleteTaskStatus,
} from '@/server/actions/task-actions'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Loader2, PencilIcon, Save, TrashIcon, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

// Status Form Schema
const statusFormSchema = z.object({
  id: z.string().optional(),
  status: z.string().min(1, 'Status is required.'),
  icon: z.string().optional(),
})

type StatusForm = z.infer<typeof statusFormSchema>

// Status Tab Component
export default function StatusTab() {
  const [editingItem, setEditingItem] = useState<TaskStatus | null>(null)
  const [deleteItem, setDeleteItem] = useState<TaskStatus | null>(null)
  const [isPending, startTransition] = useTransition()

  const { data, isLoading } = useQuery({
    queryKey: ['task-status'],
    queryFn: listTaskStatus,
  })

  const form = useForm<StatusForm>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      status: '',
      icon: 'circle-dashed',
    },
  })

  const handleEdit = (item: TaskStatus) => {
    setEditingItem(item)
    form.reset({
      id: item.id,
      status: item.status,
      icon: item.icon || '',
    })
  }

  const onSubmit = async (data: StatusForm) => {
    const isUpdate = !!editingItem

    if (isUpdate) {
      const res = await updateTaskStatus({
        id: data.id,
        status: data.status,
        icon: data.icon,
      })
      if (res?.error) {
        toast.error(res.error)
      } else if (res?.data) {
        toast.success('Status updated successfully!')
        form.reset()
        setEditingItem(null)
        getQueryClient().invalidateQueries({ queryKey: ['task-status'] })
      }
    } else {
      const res = await createTaskStatus({
        status: data.status,
        icon: data.icon,
      })
      if (res?.error) {
        toast.error(res.error)
      } else if (res?.data) {
        toast.success('Status created successfully!')
        form.reset()
        getQueryClient().invalidateQueries({ queryKey: ['task-status'] })
      }
    }
  }

  const handleDelete = () => {
    if (deleteItem) {
      startTransition(async () => {
        const res = await deleteTaskStatus(deleteItem.id)
        if (res?.error) {
          toast.error(res.error)
        } else if (res?.data !== undefined) {
          toast.success('Status deleted successfully!')
          setDeleteItem(null)
          getQueryClient().invalidateQueries({ queryKey: ['task-status'] })
        }
      })
    }
  }

  return (
    <div className='space-y-4'>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-4 p-4 border rounded-lg'
      >
        <FieldGroup className='flex flex-row gap-3 w-full items-end'>
          <Controller
            name='icon'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='w-10'>
                <FieldLabel htmlFor='status-icon'>Icon</FieldLabel>
                <IconPicker
                  value={field.value as IconName}
                  onValueChange={field.onChange}
                  triggerPlaceholder=''
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='status'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Status {editingItem && `(Editing: ${editingItem.status})`}
                </FieldLabel>
                <Input
                  {...field}
                  placeholder='Enter status name'
                  autoComplete='off'
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className='flex gap-2'>
            <Button
              type='submit'
              size={'icon'}
              disabled={!form.formState.isValid || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className='size-4 animate-spin' />
                </>
              ) : (
                <Save className='size-4' />
              )}
            </Button>
            {editingItem && (
              <Button
                type='button'
                size={'icon'}
                variant='outline'
                onClick={() => {
                  form.reset()
                  setEditingItem(null)
                }}
              >
                <X className='size-4' />
              </Button>
            )}
          </div>
        </FieldGroup>
      </form>

      <div className='space-y-2'>
        <h3 className='font-semibold'>Existing Statuses</h3>
        {isLoading ? (
          <div className='flex justify-center py-4'>
            <Spinner />
          </div>
        ) : (
          <div className='space-y-2'>
            {Array.isArray(data) && data.length > 0 ? (
              data.map((item) => (
                <div
                  key={item.id}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div>
                    <div className='font-medium'>{item.status}</div>
                    {item.icon && (
                      <div className='text-sm text-muted-foreground'>
                        Icon: {item.icon}
                      </div>
                    )}
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleEdit(item)}
                    >
                      <PencilIcon className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => setDeleteItem(item)}
                    >
                      <TrashIcon className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-4 text-muted-foreground'>
                No statuses found. Create one above.
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        destructive
        isLoading={isPending}
        handleConfirm={handleDelete}
        title={`Delete Status: ${deleteItem?.status}?`}
        desc={
          <>
            You are about to delete the status{' '}
            <strong>{deleteItem?.status}</strong>. This action cannot be undone.
          </>
        }
        confirmText='Delete'
      />
    </div>
  )
}
