'use client'

import { Globe } from 'lucide-react'
import { useTransition } from 'react'
import { Locale } from '@/i18n/config'
import { setUserLocale } from '@/server/services/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type Props = {
  defaultValue: string
  items: Array<{ value: string; label: string; icon?: React.ReactNode }>
  label: string
}

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
  label,
}: Props) {
  const [isPending, startTransition] = useTransition()

  function onChange(value: string) {
    const locale = value as Locale
    startTransition(() => {
      setUserLocale(locale)
    })
  }

  return (
    <Select defaultValue={defaultValue} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          'h-auto w-auto border-none bg-transparent p-2 shadow-none hover:bg-accent',
          isPending && 'pointer-events-none opacity-60'
        )}
      >
        <Globe className='h-6 w-6 text-muted-foreground transition-colors group-hover:text-foreground' />
        <SelectValue className='sr-only' />
      </SelectTrigger>
      <SelectContent align='end' position='popper'>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
