'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

type LocationShape = {
  pathname: string
  search: string
  href: string
  params: Record<string, string>
}

export function useLocation<T = LocationShape>(options?: {
  select?: (location: LocationShape) => T
}): T {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const location = useMemo<LocationShape>(() => {
    const search = searchParams.toString()
    const href = search ? `${pathname}?${search}` : pathname

    return {
      pathname,
      search,
      href,
      params: Object.fromEntries(searchParams.entries()),
    }
  }, [pathname, searchParams])

  return options?.select ? options.select(location) : (location as T)
}
