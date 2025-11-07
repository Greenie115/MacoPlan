import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow onboarding pages for everyone
  if (request.nextUrl.pathname.startsWith('/onboarding')) {
    return NextResponse.next()
  }

  // For now, allow all dashboard access
  // Auth protection will be added in Phase 5
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/onboarding/:path*', '/dashboard/:path*'],
}
