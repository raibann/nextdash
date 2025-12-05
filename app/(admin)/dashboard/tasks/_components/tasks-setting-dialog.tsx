'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import TaskPropertyTab from './tasks-property'

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
        <div>
          <TaskPropertyTab />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TasksSettingDialog
