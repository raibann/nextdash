'use client'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { checkIsActiveByPath } from '@/lib/validation'
import { useLocation } from '@/hooks/use-location'

type TopNavProps = React.HTMLAttributes<HTMLElement> & {
  links: {
    title: string
    href: string
    disabled?: boolean
  }[]
}

export function TopNav({ className, links, ...props }: TopNavProps) {
  const currHref = useLocation({ select: (location) => location.href })
  return (
    <>
      <div className='lg:hidden'>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size='icon' variant='outline' className='md:size-7'>
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side='bottom' align='start'>
            {links.map(({ title, href, disabled }) => {
              const isActive = checkIsActiveByPath(currHref, href)
              return (
                <DropdownMenuItem key={`${title}-${href}`} asChild>
                  <Link
                    href={href}
                    className={cn(
                      !isActive ? 'text-muted-foreground' : '',
                      'data-[link=true]:pointer-events-none data-[link=true]:opacity-50 data-[link=true]:cursor-not-allowed'
                    )}
                    data-link={disabled}
                  >
                    {title}
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav
        className={cn(
          'hidden items-center space-x-4 lg:flex lg:space-x-4 xl:space-x-6',
          className
        )}
        {...props}
      >
        {links.map(({ title, href, disabled }) => {
          const isActive = checkIsActiveByPath(currHref, href)
          return (
            <Link
              key={`${title}-${href}`}
              href={href}
              data-link={disabled}
              className={cn(
                `hover:text-primary text-sm font-medium transition-colors ${isActive ? '' : 'text-muted-foreground'}`,
                'data-[link=true]:pointer-events-none data-[link=true]:opacity-50 data-[link=true]:cursor-not-allowed'
              )}
            >
              {title}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
