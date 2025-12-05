'use client'

import { z } from 'zod'
import { Controller, useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { SelectDropdown } from '@/components/select-dropdown'
import { queryOptions, useQueries } from '@tanstack/react-query'
import {
  listTaskProperties,
  TaskProperty,
  Task,
  createTask,
  updateTask,
} from '@/server/actions/task-actions'
import { Textarea } from '@/components/ui/textarea'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { getQueryClient } from '@/lib/react-query'

type TaskMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  status: z.string().min(1, 'Please select a status.'),
  label: z.string().min(1, 'Please select a label.'),
  priority: z.string().min(1, 'Please choose a priority.'),
  desc: z.string().optional(),
})
type TaskForm = z.infer<typeof formSchema>

export function TasksMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: TaskMutateDrawerProps) {
  const isUpdate = !!currentRow

  // Multiple queries for status, priority, label
  const [taskStatusQuery, taskPriorityQuery, taskLabelQuery] = useQueries({
    queries: [
      queryOptions({
        queryKey: ['task-properties', 'status'],
        queryFn: () => listTaskProperties('status'),
      }),
      queryOptions({
        queryKey: ['task-properties', 'priority'],
        queryFn: () => listTaskProperties('priority'),
      }),
      queryOptions({
        queryKey: ['task-properties', 'label'],
        queryFn: () => listTaskProperties('label'),
      }),
    ],
  })

  const form = useForm<TaskForm>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: currentRow?.title ?? '',
      status: currentRow?.status ?? '',
      label: currentRow?.label ?? '',
      priority: currentRow?.priority ?? '',
      desc: currentRow?.desc ?? '',
    },
  })

  // Reset form when currentRow changes
  useEffect(() => {
    form.reset({
      title: currentRow?.title ?? '',
      status: currentRow?.status ?? '',
      label: currentRow?.label ?? '',
      priority: currentRow?.priority ?? '',
      desc: currentRow?.desc ?? '',
    })
  }, [currentRow, form])

  // Map query results to dropdown items
  // Use 'value' field because task table stores the value from taskProperty
  const statusItems =
    taskStatusQuery.data?.data?.map((s: TaskProperty) => ({
      label: s.label,
      value: s.value,
    })) ?? []

  const priorityItems =
    taskPriorityQuery.data?.data?.map((p: TaskProperty) => ({
      label: p.label,
      value: p.value,
    })) ?? []

  const labelItems =
    taskLabelQuery.data?.data?.map((l: TaskProperty) => ({
      label: l.label,
      value: l.value,
    })) ?? []

  const isLoading =
    taskStatusQuery.isLoading ||
    taskPriorityQuery.isLoading ||
    taskLabelQuery.isLoading

  const onSubmit = async (data: TaskForm) => {
    const isUpdate = !!currentRow

    try {
      if (isUpdate) {
        if (!currentRow?.id) {
          toast.error('Task ID is required for update')
          return
        }
        const res = await updateTask({
          id: currentRow.id,
          title: data.title,
          desc: data.desc,
          label: data.label,
          status: data.status,
          priority: data.priority,
          startDate: currentRow.startDate,
          endDate: currentRow.endDate,
          assignedTo: currentRow.assignedTo,
          createdBy: currentRow.createdBy,
          parentId: currentRow.parentId,
        })
        if (res?.error) {
          toast.error(res.error)
        } else if (res?.data) {
          toast.success('Task updated successfully!')
          onOpenChange(false)
          form.reset()
          getQueryClient().invalidateQueries({ queryKey: ['tasks'] })
        }
      } else {
        // For new tasks, set default dates (today and 7 days from now)
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 7)

        const res = await createTask({
          title: data.title,
          desc: data.desc,
          label: data.label,
          status: data.status,
          priority: data.priority,
          startDate,
          endDate,
        })
        if (res?.error) {
          toast.error(res.error)
        } else if (res?.data) {
          toast.success('Task created successfully!')
          onOpenChange(false)
          form.reset()
          getQueryClient().invalidateQueries({ queryKey: ['tasks'] })
        }
      }
    } catch {
      toast.error('An error occurred while saving the task')
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update Task' : 'Create Task'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the task information below.'
              : 'Create a new task using the fields below.'}
          </SheetDescription>
        </SheetHeader>

        <FormProvider {...form}>
          <form
            id='tasks-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FieldGroup>
              {/* Title */}
              <Controller
                name='title'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='task-title'>
                      Title <span className='text-destructive'>*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id='task-title'
                      placeholder='Enter a title'
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Status */}
              <Controller
                name='status'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='task-status'>
                      Status <span className='text-destructive'>*</span>
                    </FieldLabel>
                    <SelectDropdown
                      disabled={taskStatusQuery.isLoading}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder={
                        taskStatusQuery.isLoading
                          ? 'Loading...'
                          : 'Select status'
                      }
                      items={statusItems}
                      isControlled={true}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Label */}
              <Controller
                name='label'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='task-label'>
                      Label <span className='text-destructive'>*</span>
                    </FieldLabel>
                    <SelectDropdown
                      disabled={taskLabelQuery.isLoading}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder={
                        taskLabelQuery.isLoading ? 'Loading...' : 'Select label'
                      }
                      items={labelItems}
                      isControlled={true}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Priority */}
              <Controller
                name='priority'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='task-priority'>
                      Priority <span className='text-destructive'>*</span>
                    </FieldLabel>
                    <SelectDropdown
                      disabled={taskPriorityQuery.isLoading}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder={
                        taskPriorityQuery.isLoading
                          ? 'Loading...'
                          : 'Select priority'
                      }
                      items={priorityItems}
                      isControlled={true}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Description */}
              <Controller
                name='desc'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='task-desc'>Description</FieldLabel>
                    <Textarea
                      {...field}
                      id='task-desc'
                      placeholder='Enter a description'
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </FormProvider>

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button
            type='submit'
            form='tasks-form'
            disabled={
              !form.formState.isValid ||
              form.formState.isSubmitting ||
              isLoading
            }
          >
            {form.formState.isSubmitting || isLoading ? (
              <>
                <Spinner />
                Saving
              </>
            ) : (
              <>{isUpdate ? 'Save changes' : 'Save'}</>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
