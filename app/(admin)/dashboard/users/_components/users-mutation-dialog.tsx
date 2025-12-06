'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { User, createUser, updateUser } from '@/server/actions/user-actions'
import { useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { getQueryClient } from '@/lib/react-query'
import { useQuery } from '@tanstack/react-query'
import { getAllRoles } from '@/server/actions/role-actions'

const formSchema = z
  .object({
    name: z.string().min(1, 'Name is required.'),
    username: z.string().min(1, 'Username is required.'),
    // phoneNumber: z.string().min(1, 'Phone number is required.'),
    email: z.email({
      error: (iss) => (iss.input === '' ? 'Email is required.' : undefined),
    }),
    password: z.string().transform((pwd) => pwd.trim()),
    role: z.string().min(1, 'Role is required.'),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isEdit && !data.password) return true
      return data.password.length > 0
    },
    {
      message: 'Password is required.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return password.length >= 8
    },
    {
      message: 'Password must be at least 8 characters long.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /[a-z]/.test(password)
    },
    {
      message: 'Password must contain at least one lowercase letter.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /\d/.test(password)
    },
    {
      message: 'Password must contain at least one number.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password, confirmPassword }) => {
      if (isEdit && !password) return true
      return password === confirmPassword
    },
    {
      message: "Passwords don't match.",
      path: ['confirmPassword'],
    }
  )
type UserForm = z.infer<typeof formSchema>

type UserMutationDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersMutationDialog({
  currentRow,
  open,
  onOpenChange,
}: UserMutationDialogProps) {
  const isEdit = !!currentRow
  const [isPending, startTransition] = useTransition()

  // Fetch roles for dropdown
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles', 'all'],
    queryFn: async () => {
      const result = await getAllRoles()
      return result
    },
    enabled: open,
  })

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          password: '',
          confirmPassword: '',
          name: currentRow?.name || '',
          isEdit,
          role: currentRow?.role || '',
          username: currentRow?.username || '',
        }
      : {
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          isEdit,
          role: '',
          username: '',
        },
  })

  // Reset form when dialog opens/closes or currentRow changes
  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        form.reset({
          ...currentRow,
          password: '',
          confirmPassword: '',
          name: currentRow?.name || '',
          isEdit,
          role: currentRow?.role || '',
          username: currentRow?.username || '',
        })
      } else {
        form.reset({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          isEdit: false,
          role: '',
          username: '',
        })
      }
    }
  }, [open, isEdit, currentRow, form])

  const onReset = () => {
    toast.success(
      isEdit ? 'User updated successfully!' : 'User created successfully!'
    )
    onOpenChange(false)
    form.reset()
    getQueryClient().invalidateQueries({
      queryKey: ['users'],
    })
  }

  const onSubmit = async (values: UserForm) => {
    startTransition(async () => {
      if (isEdit) {
        const res = await updateUser({
          id: currentRow!.id,
          name: values.name,
          email: values.email,
          password: values.password || undefined,
          role: values.role,
          username: values.username,
          displayUsername:
            values.username.charAt(0).toUpperCase() + values.username.slice(1),
        })

        if (res.error !== null) {
          toast.error(res.error)
        }

        if (res.data) {
          onReset()
        }
      } else {
        const res = await createUser({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
          username: values.username,
          displayUsername:
            values.username.charAt(0).toUpperCase() + values.username.slice(1),
        })

        if (res.error !== null) {
          toast.error(res.error)
        }

        if (res.data) {
          onReset()
        }
      }
    })
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password

  // Prepare role items for dropdown
  const roleItems =
    rolesData?.data?.map((role) => ({
      label: role.name,
      value: role.slug,
    })) || []

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user here. ' : 'Create new user here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John Doe'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@gmail.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Role</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='Select a role'
                        className='col-span-4 w-full'
                        items={roleItems}
                        isPending={isLoadingRoles}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='e.g., S3cur3P@ssw0rd'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!isPasswordTouched}
                        placeholder='e.g., S3cur3P@ssw0rd'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form' disabled={isPending}>
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
