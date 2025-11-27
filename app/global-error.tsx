'use client'
import { GeneralError } from '@/components/errors/general-error'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  console.log('error', error)
  return <GeneralError />
}
