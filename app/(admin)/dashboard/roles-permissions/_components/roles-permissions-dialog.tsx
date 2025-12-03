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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { permissions } from '../permissions/_data/permissions'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CircleQuestionMark } from 'lucide-react'

type RolesPermissionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: RolePermRes.Role & {
    permIds: number[]
  }
}

const formSchema = z.object({
  id: z.number(), // roleId
  permId: z.number().array(), // list permission id
})

type FormSchema = z.infer<typeof formSchema>

const RolesPermissionsDialog = ({
  open,
  onOpenChange,
  currentRow,
}: RolesPermissionsDialogProps) => {
  const isUpdate = !!currentRow

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      id: undefined,
      permId: [],
    },
  })

  const onSubmit = (data: FormSchema) => {
    onOpenChange(false)
    form.reset()
    showSubmittedData(data)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
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
            {Array(100)
              .fill('')
              .map((_, index) => (
                <div className='space-y-3 mt-3' key={index}>
                  <div className='text-md font-medium p-2 bg-accent rounded-md'>
                    {index + 1} - Page header
                  </div>
                  <div className='grid grid-cols-4 gap-3 p-2'>
                    {permissions.map((perm) => (
                      <div
                        className='flex items-center gap-3 w-full'
                        key={perm.id}
                      >
                        <Checkbox id={`${perm.id}`} />
                        <Label
                          htmlFor={`${perm.id}`}
                          className='flex items-center w-full'
                        >
                          <p className='line-clamp-1 flex-1'>{perm.name}</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className='text-muted-foreground'>
                                <CircleQuestionMark size={12} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className='max-w-sm'>{perm.desc}</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </ScrollArea>
          <DialogFooter className='items-end'>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button type='submit'>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default RolesPermissionsDialog
