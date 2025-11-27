'use client'
// import { useNavigate, useLocation } from '@tanstack/react-router'
// import { useAuthStore } from '@/stores/auth-store'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const router = useRouter()

  const handleSignOut = () => {
    signOut()
    // Preserve current location for redirect after sign-in
    const currentPath = location.href
    router.replace('/sign-in?redirect=' + encodeURIComponent(currentPath))
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
