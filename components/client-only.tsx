'use client'

import { PropsWithChildren, useEffect, useState } from 'react'

export function ClientOnly({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(typeof window !== 'undefined')
  }, [])

  // Prevent SSR mismatch by rendering nothing on the server
  if (!mounted) {
    return null
  }

  return <>{children}</>
}
