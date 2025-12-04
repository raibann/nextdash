import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // console.log('log-session', session)
  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  const url = new URL(request.url)
  const pathname = url.pathname

  if (!session && pathname.startsWith('/')) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(
      new URL(`${url.origin}/sign-in?callbackUrl=${callbackUrl}`, request.url)
    )
  }

  // if (!session) {
  //   return NextResponse.redirect(new URL('/sign-in', request.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard'],
}
