/**
 * Clear All Caches Script
 *
 * Run with: npx tsx scripts/clear-caches.ts
 *
 * This script clears:
 * 1. Server-side in-memory recipe cache (by importing and calling clearCache)
 * 2. Database FatSecret cache tables
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { clearCache } from '../lib/cache/recipe-cache'

async function clearAllCaches() {
  console.log('🧹 Clearing all caches...\n')

  // 1. Clear in-memory recipe cache
  console.log('1. Clearing in-memory recipe cache...')
  clearCache()
  console.log('   ✅ In-memory cache cleared\n')

  // 2. Clear database FatSecret cache
  console.log('2. Clearing database FatSecret cache...')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('   ⚠️ Supabase credentials not found, skipping database cache clear')
    console.log('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  } else {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Clear FatSecret search cache
    const { count: searchCacheCount } = await supabase
      .from('fatsecret_search_cache')
      .select('*', { count: 'exact', head: true })

    const { error: searchError } = await supabase
      .from('fatsecret_search_cache')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (searchError) {
      console.log('   ⚠️ Error clearing search cache:', searchError.message)
    } else {
      console.log(`   ✅ Cleared ${searchCacheCount || 0} search cache entries`)
    }

    // Clear FatSecret recipes cache
    const { count: recipesCount } = await supabase
      .from('fatsecret_recipes')
      .select('*', { count: 'exact', head: true })

    const { error: recipesError } = await supabase
      .from('fatsecret_recipes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (recipesError) {
      console.log('   ⚠️ Error clearing recipes cache:', recipesError.message)
    } else {
      console.log(`   ✅ Cleared ${recipesCount || 0} cached recipes\n`)
    }
  }

  // 3. Instructions for client-side cache
  console.log('3. Client-side session storage cache:')
  console.log('   ℹ️ To clear client cache, open browser DevTools and run:')
  console.log('   sessionStorage.clear()\n')
  console.log('   Or just close and reopen your browser tab.\n')

  // 4. Instructions for full server cache clear
  console.log('4. For a complete server cache reset:')
  console.log('   Restart the Next.js dev server (Ctrl+C and npm run dev)\n')

  console.log('✨ Cache clearing complete!')
}

clearAllCaches().catch(console.error)
