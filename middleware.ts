import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Redirect HTTP to HTTPS in production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https' &&
    // Skip localhost (sometimes Hostinger binds to localhost internally without forwarding headers properly, but usually it does)
    !request.nextUrl.hostname.includes('localhost')
  ) {
    const httpsUrl = `https://${request.headers.get('host')}${request.nextUrl.pathname}${request.nextUrl.search}`
    return NextResponse.redirect(httpsUrl, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
