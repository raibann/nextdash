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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { getQueryClient } from '@/lib/react-query'
import {
  createPermission,
  Permission,
  updatePermission,
} from '@/server/actions/permission-actions'

type PermissionsMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Permission
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  desc: z.string().optional(),
})

type FormSchema = z.infer<typeof formSchema>

export function PermissionsMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: PermissionsMutateDrawerProps) {
  const isUpdate = !!currentRow

  const form = useForm<FormSchema>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: currentRow?.id,
      name: currentRow?.name ?? '',
      desc: currentRow?.desc ?? '',
    },
  })

  const onReset = () => {
    toast.success(
      isUpdate ? 'Update Permission Success!' : 'Create Permission Success!'
    )
    onOpenChange(false)
    form.reset()
    getQueryClient().invalidateQueries({
      queryKey: ['permissions'],
    })
  }

  const onSubmit = async (data: FormSchema) => {
    // update
    if (isUpdate) {
      const res = await updatePermission({
        id: data.id,
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, '.'),
        desc: data.desc,
      })
      if (res?.error !== null) {
        console.log('error', res?.error)
        toast.error(res?.error)
      }
      if (res?.data) {
        onReset()
        // if (process.env.NODE_ENV === 'development') {
        //   showSubmittedData(data)
        // }
      }
    } else {
      const res = await createPermission({
        name: data.name,
        desc: data.desc,
        slug: data.name.toLowerCase().replace(/\s+/g, '.'),
      })

      if (res?.error) {
        toast.error(res.error)
      }

      if (res?.data) {
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
      <SheetContent className='flex flex-col mr-4 h-[calc(100dvh-32px)] my-auto rounded-lg'>
        <SheetHeader className='text-start'>
          <SheetTitle>
            {isUpdate ? 'Update Permission' : 'Create Permission'}
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the permission information below.'
              : 'Create a new permission using the fields below.'}
          </SheetDescription>
        </SheetHeader>

        <form
          id='form-permission'
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex-1 space-y-6 overflow-y-auto px-4'
        >
          <FieldGroup>
            {/* Name */}
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='col-span-2'>
                  <FieldLabel htmlFor='permission-name'>
                    Name <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id='permission-name'
                    placeholder='Enter permission name'
                    aria-invalid={fieldState.invalid}
                    autoComplete='off'
                    onChange={(e) => {
                      // Capitalize first letter of each word using regex
                      const value = e.target.value.replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )
                      field.onChange(value)
                    }}
                    value={
                      typeof field.value === 'string'
                        ? field.value.replace(/\b\w/g, (char) =>
                            char.toUpperCase()
                          )
                        : field.value
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* DESCRIPTION */}
            <Controller
              name='desc'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='permission-desc'>Description</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id='permission-desc'
                      placeholder='Write something about this permission.'
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
            form='form-permission'
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
