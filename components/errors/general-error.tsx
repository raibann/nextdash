'use client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from 'next/navigation'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
  message?: string
}

export function GeneralError({
  className,
  minimal = false,
  message,
}: GeneralErrorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const homeUrl = pathname === '/' ? '/dashboard' : '/'
  return (
    <div className={cn('h-svh w-full', className)}>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        {!minimal && (
          <h1 className='text-[7rem] leading-tight font-bold'>500</h1>
        )}
        <span className='font-medium'>
          {message || `Oops! Something went wrong`} {`:')`}
        </span>
        <p className='text-muted-foreground text-center'>
          We apologize for the inconvenience. <br /> Please try again later.
        </p>
        {!minimal && (
          <div className='mt-6 flex gap-4'>
            <Button variant='outline' onClick={() => router.back()}>
              Go Back
            </Button>
            <Button onClick={() => router.push(homeUrl)}>Back to Home</Button>
          </div>
        )}
      </div>
    </div>
  )
}
