import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add Content Security Policy to block ads
  const csp = [
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' *",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *",
    "style-src 'self' 'unsafe-inline' *",
    "img-src 'self' data: blob: * https:",
    "font-src 'self' data: *",
    "connect-src 'self' *",
    "frame-src 'self' * https://yashintv.xyz",
    "worker-src 'self' blob:",
    "object-src 'none'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  
  // Add permissions policy to block certain features
  response.headers.set('Permissions-Policy', 'interest-cohort=()')
  
  // Add referrer policy
  response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
