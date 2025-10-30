import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']
const SESSION_COOKIE_NAME = 'drama_tracker_session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

  if (!sessionCookie) {
    // Redirect to login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Note: Cannot validate user exists in database here because Prisma
  // doesn't work in Edge Runtime (middleware). Validation happens in
  // API routes and getSessionUser() instead.

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
