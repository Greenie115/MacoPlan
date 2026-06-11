import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient, type User } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { cache } from "react"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Per-request cached auth lookup. `supabase.auth.getUser()` is a network
 * round trip to Supabase Auth; pages that compose several actions were
 * paying it 3-5x per render. React's cache() collapses those into one
 * call per request — always prefer this in server components/actions.
 */
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/**
 * Create a Supabase client with service role key.
 * Use for admin operations that bypass RLS (rate limiting, etc.)
 * WARNING: Only use in server-side code, never expose to client.
 */
export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
