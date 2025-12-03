'use client'

import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
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
import { IconName, IconPicker } from '@/components/ui/icon-picker'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { createRole, Role, updateRole } from '@/server/actions/role-action'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { getQueryClient } from '@/lib/react-query'

type RolesMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Role
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  desc: z.string().optional(),
  icon: z.string().optional(),
})

type FormSchema = z.infer<typeof formSchema>

export function RolesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: RolesMutateDrawerProps) {
  const isUpdate = !!currentRow

  const form = useForm<FormSchema>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: currentRow?.id,
      name: currentRow?.name ?? '',
      desc: currentRow?.desc ?? '',
      icon: currentRow?.icon ?? 'shield',
    },
  })

  const onReset = () => {
    toast.success(isUpdate ? 'Update Role Success!' : 'Create Role Success!')
    onOpenChange(false)
    form.reset()
    getQueryClient().invalidateQueries({
      queryKey: ['roles'],
    })
  }

  const onSubmit = async (data: FormSchema) => {
    // update
    if (isUpdate) {
      const res = await updateRole({
        id: data.id,
        name: data.name,
        icon: data.icon,
        desc: data.desc,
      })
      if (res.error !== null) {
        toast.error(res.error)
      }
      if (res.data) {
        onReset()
        // if (process.env.NODE_ENV === 'development') {
        //   showSubmittedData(data)
        // }
      }
    } // Create
    else {
      const res = await createRole({
        name: data.name,
        desc: data.desc,
        icon: data.icon,
      })

      if (res.error !== null) {
        toast.error(res.error)
      }

      if (res.data) {
        onReset()
        // if (process.env.NODE_ENV === 'development') {
        //   showSubmittedData(data)
        // }
      }
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
          <SheetTitle>{isUpdate ? 'Update Role' : 'Create Role'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the role information below.'
              : 'Create a new role using the fields below.'}
          </SheetDescription>
        </SheetHeader>

        <form
          id='form-role'
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex-1 space-y-6 overflow-y-auto px-4'
        >
          <FieldGroup>
            <div className='flex items-center gap-3'>
              {/* ICON */}
              <Controller
                name='icon'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='w-10'>
                    <FieldLabel htmlFor='role-icon'>Icon</FieldLabel>
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
              {/* NAME */}
              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className='col-span-2'
                  >
                    <FieldLabel htmlFor='role-name'>
                      Name <span className='text-destructive'>*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id='role-name'
                      placeholder='Enter role name'
                      aria-invalid={fieldState.invalid}
                      autoComplete='off'
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* DESCRIPTION */}
            <Controller
              name='desc'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='role-desc'>Description</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id='role-desc'
                      placeholder='Write something about this role.'
                      rows={6}
                      className='min-h-24 resize-none'
                      aria-invalid={fieldState.invalid}
                      maxLength={100}
                    />
                    <InputGroupAddon align='block-end'>
                      <InputGroupText className='tabular-nums'>
                        {field?.value?.length}/100 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button
            type='submit'
            form='form-role'
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
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
