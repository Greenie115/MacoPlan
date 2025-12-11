import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update session and get user
  const { response, user } = await updateSession(request)

  // Define public routes that don't require auth
  const isPublicRoute = 
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/onboarding') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.') // static files like favicon.ico

  // If user is NOT logged in and tries to access a protected route
  if (!user && !isPublicRoute) {
    // Redirect to login
    const loginUrl = new URL('/login', request.url)
    // Optional: Add ?next= param to redirect back after login
    // loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user IS logged in and tries to access login or onboarding, redirect to dashboard
  // (Optional, but good UX)
  // If user IS logged in and tries to access login or onboarding, redirect to dashboard
  // (Optional, but good UX)
  if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
     return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
