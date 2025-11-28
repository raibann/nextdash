'use client'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { Copy, CopyCheck } from 'lucide-react'
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
      className={className}
      onClick={() =>
        copy(text).then(() => toast('Text Copied to your clipboard 🎉.'))
      }
    >
      {isCopied ? <CopyCheck size={14} /> : <Copy size={14} />}
    </Button>
  )
}

export default ClipboardButton
