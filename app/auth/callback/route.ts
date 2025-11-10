import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      // If there's an error, redirect back to onboarding with error
      return NextResponse.redirect(`${origin}/onboarding/6?error=auth_failed`)
    }
  }

  // After successful auth, redirect to data migration page
  return NextResponse.redirect(`${origin}/onboarding/complete`)
}
