import { Spinner } from '@/components/ui/spinner'

const RootLoading = () => {
  return (
    <div className='flex h-full w-full items-center justify-center rounded-lg'>
      <Spinner className='size-6' />
    </div>
  )
}

export default RootLoading
