import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { getQueryClient } from '@/lib/react-query'
import {
  TaskPriority,
  listTaskPriority,
  updateTaskPriority,
  createTaskPriority,
  deleteTaskPriority,
} from '@/server/actions/task-actions'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

// Priority Form Schema
const priorityFormSchema = z.object({
  id: z.string().optional(),
  priority: z.string().min(1, 'Priority is required.'),
  icon: z.string().optional(),
})

type PriorityForm = z.infer<typeof priorityFormSchema>

// Priority Tab Component
export default function PriorityTab() {
  const [editingItem, setEditingItem] = useState<TaskPriority | null>(null)
  const [deleteItem, setDeleteItem] = useState<TaskPriority | null>(null)
  const [isPending, startTransition] = useTransition()

  const { data, isLoading } = useQuery({
    queryKey: ['task-priority'],
    queryFn: listTaskPriority,
  })

  const form = useForm<PriorityForm>({
    resolver: zodResolver(priorityFormSchema),
    defaultValues: {
      priority: '',
      icon: '',
    },
  })

  const handleEdit = (item: TaskPriority) => {
    setEditingItem(item)
    form.reset({
      id: item.id,
      priority: item.priority,
      icon: item.icon || '',
    })
  }

  const onSubmit = async (data: PriorityForm) => {
    const isUpdate = !!editingItem

    if (isUpdate) {
      const res = await updateTaskPriority({
        id: data.id,
        priority: data.priority,
        icon: data.icon,
      })
      if (res?.error) {
        toast.error(res.error)
      } else if (res?.data) {
        toast.success('Priority updated successfully!')
        form.reset()
        setEditingItem(null)
        getQueryClient().invalidateQueries({ queryKey: ['task-priority'] })
      }
    } else {
      const res = await createTaskPriority({
        priority: data.priority,
        icon: data.icon,
      })
      if (res?.error) {
        toast.error(res.error)
      } else if (res?.data) {
        toast.success('Priority created successfully!')
        form.reset()
        getQueryClient().invalidateQueries({ queryKey: ['task-priority'] })
      }
    }
  }

  const handleDelete = () => {
    if (deleteItem) {
      startTransition(async () => {
        const res = await deleteTaskPriority(deleteItem.id)
        if (res?.error) {
          toast.error(res.error)
        } else if (res?.data !== undefined) {
          toast.success('Priority deleted successfully!')
          setDeleteItem(null)
          getQueryClient().invalidateQueries({ queryKey: ['task-priority'] })
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
        <FieldGroup>
          <Controller
            name='priority'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Priority {editingItem && `(Editing: ${editingItem.priority})`}
                </FieldLabel>
                <Input
                  {...field}
                  placeholder='Enter priority name'
                  autoComplete='off'
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='icon'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Icon (optional)</FieldLabel>
                <Input
                  {...field}
                  placeholder='Enter icon name'
                  autoComplete='off'
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <div className='flex gap-2'>
          <Button
            type='submit'
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Spinner />
                {editingItem ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{editingItem ? 'Update Priority' : 'Create Priority'}</>
            )}
          </Button>
          {editingItem && (
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                form.reset()
                setEditingItem(null)
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className='space-y-2'>
        <h3 className='font-semibold'>Existing Priorities</h3>
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
                    <div className='font-medium'>{item.priority}</div>
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
                No priorities found. Create one above.
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
        title={`Delete Priority: ${deleteItem?.priority}?`}
        desc={
          <>
            You are about to delete the priority{' '}
            <strong>{deleteItem?.priority}</strong>. This action cannot be
            undone.
          </>
        }
        confirmText='Delete'
      />
    </div>
  )
}
