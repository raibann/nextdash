'use client'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { Copy, CopyCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
type ClipboardButtonProps = {
  text: string
  className?: string
}
const ClipboardButton = ({ text, className }: ClipboardButtonProps) => {
  const [copy, isCopied] = useCopyToClipboard()
  return (
    <Button
      variant='ghost'
      size={'icon-sm'}
      className={cn('size-8', className)}
      onClick={() =>
        copy(text).then(() => toast('Text Copied to your clipboard 🎉.'))
      }
    >
      {isCopied ? (
        <CopyCheck className='size-4' />
      ) : (
        <Copy className='size-4' />
      )}
    </Button>
  )
}

export default ClipboardButton
