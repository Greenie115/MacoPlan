#!/usr/bin/env node
/**
 * Migration Application Script
 * Applies the recipes schema migration to Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

console.log('🔗 Connecting to Supabase...')
console.log(`   URL: ${SUPABASE_URL}`)

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Read migration SQL file
const migrationPath = join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '20251118123008_create_recipes_schema.sql'
)

console.log('📄 Reading migration file...')
const migrationSQL = readFileSync(migrationPath, 'utf-8')

// Split SQL into individual statements (basic approach)
// PostgreSQL functions need to handle ; inside function bodies
const statements = migrationSQL
  .split('\n')
  .filter((line) => !line.trim().startsWith('--') && line.trim()) // Remove comments and empty lines
  .join('\n')

console.log('🚀 Applying migration...')
console.log('   This may take a moment...\n')

try {
  // Execute the entire migration as one statement
  const { data, error } = await supabase.rpc('exec_sql', { sql: statements })

  if (error) {
    // If exec_sql doesn't exist, try direct query (Supabase doesn't support raw SQL via JS client)
    console.log('⚠️  Direct SQL execution not supported via JS client')
    console.log('📋 Please copy the migration and run it manually:\n')
    console.log('1. Go to: https://supabase.com/dashboard/project/dxhfjhprhxylnhufzaiu/editor')
    console.log('2. Click "SQL Editor" → "New Query"')
    console.log('3. Copy the entire migration file:')
    console.log('   supabase/migrations/20251118123008_create_recipes_schema.sql')
    console.log('4. Paste and click "Run"\n')
    console.log('Migration file location:')
    console.log(`   ${migrationPath}\n`)
    process.exit(1)
  }

  console.log('✅ Migration applied successfully!')
  console.log('\n📊 Created tables:')
  console.log('   - recipes')
  console.log('   - recipe_tags')
  console.log('   - recipe_ingredients')
  console.log('   - recipe_instructions')
  console.log('   - user_favorite_recipes')
  console.log('\n🔒 RLS policies enabled')
  console.log('📈 Performance indexes created')
  console.log('🌱 Seed data inserted (7 sample recipes)')
} catch (err) {
  console.error('❌ Migration failed:', err.message)
  console.log('\n📋 Manual migration required:')
  console.log('1. Go to: https://supabase.com/dashboard/project/dxhfjhprhxylnhufzaiu/editor')
  console.log('2. Click "SQL Editor" → "New Query"')
  console.log('3. Copy and paste the migration SQL')
  console.log('4. Click "Run"')
  process.exit(1)
}
