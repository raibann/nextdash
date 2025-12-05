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
  TaskLabel,
  listTaskLabel,
  updateTaskLabel,
  createTaskLabel,
  deleteTaskLabel,
} from '@/server/actions/task-actions'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

// Label Form Schema
const labelFormSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Label is required.'),
  icon: z.string().optional(),
  variant: z.string().min(1, 'Variant is required.'),
})

type LabelForm = z.infer<typeof labelFormSchema>

// Label Tab Component
export default function LabelTab() {
  const [editingItem, setEditingItem] = useState<TaskLabel | null>(null)
  const [deleteItem, setDeleteItem] = useState<TaskLabel | null>(null)
  const [isPending, startTransition] = useTransition()

  const { data, isLoading } = useQuery({
    queryKey: ['task-label'],
    queryFn: listTaskLabel,
  })

  const form = useForm<LabelForm>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: {
      label: '',
      icon: '',
      variant: 'default',
    },
  })

  const handleEdit = (item: TaskLabel) => {
    setEditingItem(item)
    form.reset({
      id: item.id,
      label: item.label,
      icon: item.icon || '',
      variant: item.variant,
    })
  }

  const onSubmit = async (data: LabelForm) => {
    const isUpdate = !!editingItem

    if (isUpdate) {
      const res = await updateTaskLabel({
        id: data.id,
        label: data.label,
        icon: data.icon,
        variant: data.variant,
      })
      if (res?.error) {
        toast.error(res.error)
      } else if (res?.data) {
        toast.success('Label updated successfully!')
        form.reset()
        setEditingItem(null)
        getQueryClient().invalidateQueries({ queryKey: ['task-label'] })
      }
    } else {
      const res = await createTaskLabel({
        label: data.label,
        icon: data.icon,
        variant: data.variant,
      })
      if (res?.error) {
        toast.error(res.error)
      } else if (res?.data) {
        toast.success('Label created successfully!')
        form.reset()
        getQueryClient().invalidateQueries({ queryKey: ['task-label'] })
      }
    }
  }

  const handleDelete = () => {
    if (deleteItem) {
      startTransition(async () => {
        const res = await deleteTaskLabel(deleteItem.id)
        if (res?.error) {
          toast.error(res.error)
        } else if (res?.data !== undefined) {
          toast.success('Label deleted successfully!')
          setDeleteItem(null)
          getQueryClient().invalidateQueries({ queryKey: ['task-label'] })
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
            name='label'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Label {editingItem && `(Editing: ${editingItem.label})`}
                </FieldLabel>
                <Input
                  {...field}
                  placeholder='Enter label name'
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
          <Controller
            name='variant'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Variant</FieldLabel>
                <Input
                  {...field}
                  placeholder='Enter variant (e.g., default, destructive, outline)'
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
              <>{editingItem ? 'Update Label' : 'Create Label'}</>
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
        <h3 className='font-semibold'>Existing Labels</h3>
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
                    <div className='font-medium'>{item.label}</div>
                    <div className='text-sm text-muted-foreground'>
                      {item.icon && `Icon: ${item.icon} • `}
                      Variant: {item.variant}
                    </div>
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
                No labels found. Create one above.
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
        title={`Delete Label: ${deleteItem?.label}?`}
        desc={
          <>
            You are about to delete the label{' '}
            <strong>{deleteItem?.label}</strong>. This action cannot be undone.
          </>
        }
        confirmText='Delete'
      />
    </div>
  )
}
