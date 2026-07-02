import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Public content pages that never branch on auth/onboarding state.
// Used for both the profile-query skip and the public-route check — one
// list to update when adding a content route.
const CONTENT_ROUTES = [
  '/blog',
  '/pricing',
  '/help',
  '/terms',
  '/privacy',
  '/forgot-password',
  '/reset-password',
]

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isContentRoute = CONTENT_ROUTES.some((r) => pathname.startsWith(r))

  // Content routes never branch on onboarding state — skip the profile query
  const skipProfileCheck =
    isContentRoute ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')

  // Update session and get user
  const { response, user, onboardingCompleted } = await updateSession(request, { skipProfileCheck })

  // API routes handle their own auth (e.g., Stripe webhooks verify signatures)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return response
  }

  // Define public routes that don't require auth
  const isPublicRoute =
    isContentRoute ||
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // static files like favicon.ico

  // Onboarding is open to guests: data lives in localStorage until they sign
  // up, then /onboarding/complete migrates it to Supabase.
  const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding')

  // If user is NOT logged in and tries to access a protected route
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
