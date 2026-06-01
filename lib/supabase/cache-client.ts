import { createClient } from '@supabase/supabase-js'

// Cookie-free Supabase client for use inside unstable_cache.
// Only for queries on publicly-readable tables (recipe_api_cache, recipe_images, user_recipe_favorites aggregate).
export function createCacheClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
