import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update session and get user
  const { response, user, onboardingCompleted } = await updateSession(request)

  // API routes handle their own auth (e.g., Stripe webhooks verify signatures)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return response
  }

  // Define public routes that don't require auth
  const isPublicRoute =
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/blog') ||
    request.nextUrl.pathname.startsWith('/pricing') ||
    request.nextUrl.pathname.startsWith('/help') ||
    request.nextUrl.pathname.startsWith('/terms') ||
    request.nextUrl.pathname.startsWith('/privacy') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.') // static files like favicon.ico

  // Onboarding requires auth - users must sign in first
  const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding')

  // If user is NOT logged in and tries to access a protected route (including onboarding)
  if (!user && !isPublicRoute) {
    // Redirect to login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If user IS logged in and tries to access login, signup, or the landing page, redirect appropriately
  if (
    user &&
    (request.nextUrl.pathname === '/' ||
      request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup'))
  ) {
    // Redirect to dashboard if onboarding is complete, otherwise to onboarding
    if (onboardingCompleted) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/onboarding/1', request.url))
  }

  // If user IS logged in but hasn't completed onboarding, redirect protected routes to onboarding
  if (user && !onboardingCompleted && !isPublicRoute && !isOnboardingRoute) {
    return NextResponse.redirect(new URL('/onboarding/1', request.url))
  }

  // If user IS logged in and HAS completed onboarding, redirect onboarding routes to dashboard
  if (user && onboardingCompleted && isOnboardingRoute) {
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
