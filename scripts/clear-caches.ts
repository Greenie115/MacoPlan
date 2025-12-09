/**
 * Clear All Caches Script
 *
 * Run with: npx tsx scripts/clear-caches.ts
 *
 * This script clears:
 * 1. Server-side in-memory recipe cache (by importing and calling clearCache)
 * 2. Database meal plan cache (spoonacular_meal_plans table)
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

  // 2. Clear database meal plan cache
  console.log('2. Clearing database meal plan cache...')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('   ⚠️ Supabase credentials not found, skipping database cache clear')
    console.log('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  } else {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get count before delete
    const { count: beforeCount } = await supabase
      .from('spoonacular_meal_plans')
      .select('*', { count: 'exact', head: true })

    // Delete all cached meal plans
    const { error } = await supabase
      .from('spoonacular_meal_plans')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

    if (error) {
      console.log('   ❌ Error clearing database cache:', error.message)
    } else {
      console.log(`   ✅ Cleared ${beforeCount || 0} cached meal plans from database\n`)
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
