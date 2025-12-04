'use client'

import { z } from 'zod'
import { Controller, useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
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
  listTaskPriority,
  listTaskLabel,
  listTaskStatus,
  TaskStatus,
  TaskPriority,
  TaskLabel,
  Task,
} from '@/server/actions/task-actions'
import { Textarea } from '@/components/ui/textarea'
import { useEffect } from 'react'

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
        queryKey: ['task-status'],
        queryFn: () => listTaskStatus(),
      }),
      queryOptions({
        queryKey: ['task-priority'],
        queryFn: () => listTaskPriority(),
      }),
      queryOptions({
        queryKey: ['task-label'],
        queryFn: () => listTaskLabel(),
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
  const statusItems =
    taskStatusQuery.data?.data?.map((s: TaskStatus) => ({
      label: s.status,
      value: s.id,
    })) ?? []

  const priorityItems =
    taskPriorityQuery.data?.data?.map((p: TaskPriority) => ({
      label: p.priority,
      value: p.id,
    })) ?? []

  const labelItems =
    taskLabelQuery.data?.data?.map((l: TaskLabel) => ({
      label: l.label,
      value: l.id,
    })) ?? []

  const isLoading =
    taskStatusQuery.isLoading ||
    taskPriorityQuery.isLoading ||
    taskLabelQuery.isLoading

  const onSubmit = async (data: TaskForm) => {
    // do something with the form data
    onOpenChange(false)
    form.reset()
    showSubmittedData(data)
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
