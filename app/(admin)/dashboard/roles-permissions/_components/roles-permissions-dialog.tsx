'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller, useWatch } from 'react-hook-form'
import z from 'zod'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CircleQuestionMark } from 'lucide-react'
import { useRole } from './roles-provider'
import { useQuery } from '@tanstack/react-query'
import { listPermission } from '@/server/actions/permission-actions'
import {
  listRolePermission,
  upsertRolePermission,
} from '@/server/actions/role-actions'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { getQueryClient } from '@/lib/react-query'
import { Spinner } from '@/components/ui/spinner'

type RolesPermissionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formSchema = z.object({
  roleId: z.string().min(1, 'Role ID is required'),
  permissionIds: z.string().array(), // list permission ids
})

type FormSchema = z.infer<typeof formSchema>

const RolesPermissionsDialog = ({
  open,
  onOpenChange,
}: RolesPermissionsDialogProps) => {
  const { currentRow } = useRole()
  const roleId = currentRow?.id

  // Fetch all available permissions
  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions', 'all'],
    queryFn: async () => {
      // Fetch all permissions with a large page size
      const result = await listPermission({
        pageIndex: 0,
        pageSize: 1000,
      })
      return result
    },
    enabled: open && !!roleId,
  })

  // Fetch existing role permissions
  const { data: rolePermissionsData, isLoading: isLoadingRolePermissions } =
    useQuery({
      queryKey: ['role-permissions', roleId],
      queryFn: async () => {
        if (!roleId) return { data: [], error: null }
        const result = await listRolePermission(roleId)
        return result
      },
      enabled: open && !!roleId,
    })

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roleId: '',
      permissionIds: [],
    },
  })

  // Update form when role permissions are loaded or when roleId changes
  useEffect(() => {
    if (open && roleId) {
      if (rolePermissionsData?.data) {
        const existingPermissionIds = rolePermissionsData.data.map(
          (rp) => rp.permissionId
        )
        form.reset({
          roleId: roleId,
          permissionIds: existingPermissionIds,
        })
      } else if (
        !rolePermissionsData?.data &&
        rolePermissionsData !== undefined
      ) {
        // Permissions loaded but empty, set roleId with empty array
        form.reset({
          roleId: roleId,
          permissionIds: [],
        })
      } else {
        // Permissions still loading, set roleId to ensure form is valid
        form.setValue('roleId', roleId)
      }
    }
  }, [open, rolePermissionsData, roleId, form])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset({
        roleId: '',
        permissionIds: [],
      })
    }
  }, [open, form])

  const onSubmit = async (data: FormSchema) => {
    const submitRoleId = roleId || data.roleId

    if (!submitRoleId) {
      toast.error('Role ID is required')
      return
    }

    try {
      const result = await upsertRolePermission(
        submitRoleId,
        data.permissionIds
      )

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Role permissions updated successfully!')
      onOpenChange(false)
      form.reset()
      getQueryClient().invalidateQueries({ queryKey: ['role-permissions'] })
      getQueryClient().invalidateQueries({ queryKey: ['roles'] })
    } catch (error) {
      toast.error('An error occurred while updating role permissions')
      console.error(error)
    }
  }

  const permissions = permissionsData?.data || []
  const isLoading = isLoadingPermissions || isLoadingRolePermissions

  // Watch permissionIds to calculate select all state
  const watchedPermissionIds = useWatch({
    control: form.control,
    name: 'permissionIds',
    defaultValue: [],
  })

  // Calculate select all state
  const allPermissionIds = permissions.map((p) => p.id)
  const selectedCount = watchedPermissionIds?.length || 0
  const totalCount = allPermissionIds.length
  const isAllSelected = totalCount > 0 && selectedCount === totalCount
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount

  // Handle select all toggle
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    // If indeterminate or checked, select all; otherwise deselect all
    if (checked === true || checked === 'indeterminate') {
      form.setValue('permissionIds', allPermissionIds)
    } else {
      form.setValue('permissionIds', [])
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          form.reset()
        }
      }}
    >
      <form id='form-role-permission' onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent className='h-screen max-w-full sm:max-h-[90dvh] sm:min-w-[50dvw] flex flex-col'>
          <DialogHeader>
            <DialogTitle>Modify Role Permission</DialogTitle>
            <DialogDescription>
              Select the permissions you want to assign to this role from the
              list below.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className='flex-1 h-72'>
            {isLoading ? (
              <div className='flex items-center justify-center p-8'>
                <Spinner />
              </div>
            ) : (
              <div className='space-y-3 mt-3 p-2'>
                <div className='flex items-center justify-between p-2 bg-accent rounded-md'>
                  <div className='text-md font-medium'>
                    Available Permissions
                  </div>
                  {permissions.length > 0 && (
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        id='select-all-permissions'
                        checked={
                          isAllSelected || (isIndeterminate && 'indeterminate')
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label='Select all permissions'
                      />
                      <Label
                        htmlFor='select-all-permissions'
                        className='text-sm cursor-pointer'
                      >
                        Select All ({selectedCount}/{totalCount})
                      </Label>
                    </div>
                  )}
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                  {permissions.map((perm) => (
                    <Controller
                      key={perm.id}
                      name='permissionIds'
                      control={form.control}
                      render={({ field }) => {
                        const isChecked =
                          field.value?.includes(perm.id) || false
                        return (
                          <div className='flex items-center gap-3 w-full'>
                            <Checkbox
                              id={`perm-${perm.id}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || []
                                if (checked) {
                                  field.onChange([...currentValue, perm.id])
                                } else {
                                  field.onChange(
                                    currentValue.filter((id) => id !== perm.id)
                                  )
                                }
                              }}
                            />
                            <Label
                              htmlFor={`perm-${perm.id}`}
                              className='flex items-center w-full cursor-pointer'
                            >
                              <p className='line-clamp-1 flex-1'>{perm.name}</p>
                              {perm.desc && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className='text-muted-foreground ml-2'>
                                      <CircleQuestionMark size={12} />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className='max-w-sm'>{perm.desc}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </Label>
                          </div>
                        )
                      }}
                    />
                  ))}
                </div>
                {permissions.length === 0 && !isLoading && (
                  <div className='text-center text-muted-foreground p-8'>
                    No permissions available
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          <DialogFooter className='items-end'>
            <DialogClose asChild>
              <Button variant='outline' type='button'>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type='submit'
              form='form-role-permission'
              disabled={form.formState.isSubmitting || isLoading || !roleId}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Spinner />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default RolesPermissionsDialog
