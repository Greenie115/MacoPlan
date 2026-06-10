import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

type BrowserClient = SupabaseClient

let browserClient: BrowserClient | null = null

/**
 * Returns the shared browser Supabase client.
 *
 * The underlying client is created lazily on first property access. This
 * keeps `createClient()` safe to call in client-component bodies during
 * static prerendering, where NEXT_PUBLIC_* env vars may be absent — the
 * real client is only constructed in the browser (handlers/effects).
 */
export function createClient(): BrowserClient {
  return new Proxy({} as BrowserClient, {
    get(_target, prop) {
      if (!browserClient) {
        browserClient = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
      }
      const value = Reflect.get(browserClient, prop, browserClient)
      return typeof value === "function" ? value.bind(browserClient) : value
    },
  })
}
