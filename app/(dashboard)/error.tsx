'use client'
import { GeneralError } from '@/components/errors/general-error'

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
}) {
  console.log('error', error)
  return <GeneralError message='dashboard' />
}
