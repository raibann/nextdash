'use client'
import ClipboardButton from './clipboard-btn'
import { cn } from '@/lib/utils'

const CopyText = ({
  text,
  className,
}: {
  text: string
  className?: string
}) => {
  return (
    <div className={cn('flex items-center space-x-2 group w-25', className)}>
      <span className='text-sm pl-2'>{text}</span>
      <ClipboardButton text={text} className='hidden group-hover:flex' />
    </div>
  )
}

export default CopyText
