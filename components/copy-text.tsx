'use client'
import ClipboardButton from './clipboard-btn'

const CopyText = ({ text }: { text: string }) => {
  return (
    <div className='flex items-center space-x-2 group w-25'>
      <span className='text-sm pl-2'>{text}</span>
      <ClipboardButton
        text={text}
        className='hidden group-hover:block transition-all duration-300 ease-in-out'
      />
    </div>
  )
}

export default CopyText
