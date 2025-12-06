import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { UserProvider } from '@/context/user-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { PropsWithChildren } from 'react'
import { ClientOnly } from '../client-only'
import type { Session } from '@/lib/auth'

type AuthenticatedLayoutProps = PropsWithChildren & {
  session: Session | null
}

export function AuthenticatedLayout({
  children,
  session,
}: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return (
    <ClientOnly>
      <UserProvider session={session}>
        <SearchProvider>
          <LayoutProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
              <SkipToMain />
              <AppSidebar session={session} />
              <SidebarInset
                className={cn(
                  // Set content container, so we can use container queries
                  '@container/content',

                  // If layout is fixed, set the height
                  // to 100svh to prevent overflow
                  'has-data-[layout=fixed]:h-svh',

                  // If layout is fixed and sidebar is inset,
                  // set the height to 100svh - spacing (total margins) to prevent overflow
                  'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
                )}
              >
                {children}
              </SidebarInset>
            </SidebarProvider>
          </LayoutProvider>
        </SearchProvider>
      </UserProvider>
    </ClientOnly>
  )
}
