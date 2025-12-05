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
  createTaskProperty,
  TaskProperty,
  updateTaskProperty,
  deleteTaskProperty,
  listTaskProperties,
} from '@/server/actions/task-actions'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, PencilIcon, Save, TrashIcon, X } from 'lucide-react'
import { useState, useTransition, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Status Form Schema
const taskPropertyFormSchema = z.object({
  id: z.string().optional(),
  field: z.string().min(1, 'Field is required.'),
  label: z.string().min(1, 'Label is required.'),
  value: z.string().min(1, 'Value is required.'),
  type: z.string().min(1, 'Type is required.'),
  icon: z.string().optional(),
})

type TaskPropertyForm = z.infer<typeof taskPropertyFormSchema>

// Status Tab Component
export default function TaskPropertyTab() {
  const [editingItem, setEditingItem] = useState<TaskProperty | null>(null)
  const [deleteItem, setDeleteItem] = useState<TaskProperty | null>(null)
  const [selectedField, setSelectedField] = useState<string>('status')
  const [isPending, startTransition] = useTransition()

  const form = useForm<TaskPropertyForm>({
    resolver: zodResolver(taskPropertyFormSchema),
    defaultValues: {
      field: '',
      type: '',
      icon: '',
      label: '',
      value: '',
    },
  })

  // Query task properties for the selected field
  const { data, isLoading } = useQuery({
    queryKey: ['task-properties', selectedField],
    queryFn: () => listTaskProperties(selectedField),
  })

  const taskProperties = data?.data || []

  // Populate form when editing
  useEffect(() => {
    if (editingItem) {
      form.reset({
        id: editingItem.id,
        field: editingItem.field,
        type: editingItem.type,
        icon: editingItem.icon || '',
        label: editingItem.label,
        value: editingItem.value,
      })
    }
  }, [editingItem, form])

  // Reset form when field changes
  useEffect(() => {
    if (!editingItem) {
      form.reset({
        field: selectedField,
        type: '',
        icon: '',
        label: '',
        value: '',
      })
    }
  }, [selectedField, form, editingItem])

  const handleEdit = (item: TaskProperty) => {
    setEditingItem(item)
  }

  const onSubmit = async (data: TaskPropertyForm) => {
    const isUpdate = !!editingItem

    if (isUpdate) {
      if (!data.id) {
        toast.error('ID is required for update')
        return
      }
      const res = await updateTaskProperty({
        id: data.id,
        field: data.field,
        type: data.type,
        icon: data.icon || null,
        label: data.label,
        value: data.value,
      })
      if (res?.error) {
        toast.error(res.error)
      } else if (res?.data) {
        toast.success('Property updated successfully!')
        form.reset({
          field: selectedField,
          type: '',
          icon: '',
          label: '',
          value: '',
        })
        setEditingItem(null)
        getQueryClient().invalidateQueries({
          queryKey: ['task-properties', selectedField],
        })
      }
    } else {
      const res = await createTaskProperty({
        field: data.field,
        type: data.type,
        icon: data.icon || null,
        label: data.label,
        value: data.value,
      })
      if (res?.error) {
        toast.error(res.error)
      } else if (res?.data) {
        toast.success('Property created successfully!')
        form.reset({
          field: selectedField,
          type: '',
          icon: '',
          label: '',
          value: '',
        })
        getQueryClient().invalidateQueries({
          queryKey: ['task-properties', selectedField],
        })
      }
    }
  }

  const handleDelete = () => {
    if (deleteItem) {
      startTransition(async () => {
        const res = await deleteTaskProperty(deleteItem.id)
        if (res?.error) {
          toast.error(res.error)
        } else if (res?.data !== undefined) {
          toast.success('Property deleted successfully!')
          setDeleteItem(null)
          getQueryClient().invalidateQueries({
            queryKey: ['task-properties', selectedField],
          })
        }
      })
    }
  }

  return (
    <div className='space-y-4'>
      <Field>
        <FieldLabel>Field</FieldLabel>
        <Select
          value={selectedField}
          onValueChange={(value) => setSelectedField(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select field' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='status'>Status</SelectItem>
            <SelectItem value='priority'>Priority</SelectItem>
            <SelectItem value='label'>Label</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-4 p-4 border rounded-lg'
      >
        <FieldGroup className='space-y-4'>
          <Controller
            name='field'
            control={form.control}
            render={({ field }) => (
              <input type='hidden' {...field} value={selectedField} />
            )}
          />

          <div className='flex flex-row gap-3 w-full items-end'>
            <Controller
              name='icon'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='w-10'>
                  <FieldLabel htmlFor='property-icon'>Icon</FieldLabel>
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
              name='label'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='flex-1'>
                  <FieldLabel>
                    Label {editingItem && `(Editing: ${editingItem.label})`}
                  </FieldLabel>
                  <Input
                    {...field}
                    placeholder='Enter label'
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name='value'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='flex-1'>
                  <FieldLabel>Value</FieldLabel>
                  <Input
                    {...field}
                    placeholder='Enter value'
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name='type'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='w-32'>
                  <FieldLabel>Type</FieldLabel>
                  <Input {...field} placeholder='Type' autoComplete='off' />
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
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
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
                    form.reset({
                      field: selectedField,
                      type: '',
                      icon: '',
                      label: '',
                      value: '',
                    })
                    setEditingItem(null)
                  }}
                >
                  <X className='size-4' />
                </Button>
              )}
            </div>
          </div>
        </FieldGroup>
      </form>

      <div className='space-y-2'>
        <h3 className='font-semibold'>Existing Properties ({selectedField})</h3>
        {isLoading ? (
          <div className='flex justify-center py-4'>
            <Spinner />
          </div>
        ) : (
          <div className='space-y-2'>
            {Array.isArray(taskProperties) && taskProperties.length > 0 ? (
              taskProperties.map((item) => (
                <div
                  key={item.id}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div>
                    <div className='font-medium'>{item.label}</div>
                    <div className='text-sm text-muted-foreground'>
                      Value: {item.value} | Type: {item.type}
                    </div>
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
                No properties found. Create one above.
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
        title={`Delete Property: ${deleteItem?.label}?`}
        desc={
          <>
            You are about to delete the property{' '}
            <strong>{deleteItem?.label}</strong>. This action cannot be undone.
          </>
        }
        confirmText='Delete'
      />
    </div>
  )
}
