import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  // Optional post-auth destination, restricted to onboarding paths so the
  // param can't be abused as an open redirect.
  const next = requestUrl.searchParams.get('next')
  const safeNext = next && /^\/onboarding(\/|$)/.test(next) ? next : '/onboarding/1'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      // If there's an error, redirect back to login with error
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Check if user has completed onboarding
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()

      // If onboarding is complete, go to dashboard
      if (profile?.onboarding_completed) {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  // After successful auth, migrate a pending guest plan or start onboarding
  return NextResponse.redirect(`${origin}${safeNext}`)
}
