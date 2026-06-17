import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define trusted origins. Ideally, this should come from env variables.
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://your-production-domain.com'] 
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const origin = request.headers.get('origin')
  // For same-origin requests, origin might be null. We only restrict cross-origin requests.
  if (origin) {
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Security header
  response.headers.set('X-Content-Type-Options', 'nosniff')

  return response
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
