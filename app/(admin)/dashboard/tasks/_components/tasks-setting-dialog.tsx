'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import StatusTab from './tasks-setting-status'
import PriorityTab from './tasks-setting-priority'
import LabelTab from './tasks-setting-label'

type TasksSettingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TasksSettingDialog = ({
  open,
  onOpenChange,
}: TasksSettingDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='gap-2 sm:max-w-2xl max-h-[90dvh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Tasks Setting</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue='status' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='status'>Status</TabsTrigger>
            <TabsTrigger value='priority'>Priority</TabsTrigger>
            <TabsTrigger value='label'>Label</TabsTrigger>
          </TabsList>
          <TabsContent value='status' className='mt-4'>
            <StatusTab />
          </TabsContent>
          <TabsContent value='priority' className='mt-4'>
            <PriorityTab />
          </TabsContent>
          <TabsContent value='label' className='mt-4'>
            <LabelTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default TasksSettingDialog
