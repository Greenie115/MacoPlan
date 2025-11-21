#!/usr/bin/env node
/**
 * Helper script to apply database migration
 * Opens Supabase SQL editor with instructions
 */

import { exec } from 'child_process'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PROJECT_REF = 'dxhfjhprhxylnhufzaiu'
const SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`

console.log('\n🔧 MacroPlan Database Migration Helper\n')
console.log('=' .repeat(60))

console.log('\n📋 To apply the recipes migration, follow these steps:\n')
console.log('1️⃣  Opening Supabase SQL Editor in your browser...')
console.log(`   URL: ${SQL_EDITOR_URL}`)

// Open browser
exec(`start ${SQL_EDITOR_URL}`, (error) => {
  if (error) {
    console.log(`\n   ⚠️  Couldn't auto-open browser. Please visit:`)
    console.log(`   ${SQL_EDITOR_URL}\n`)
  }
})

console.log('\n2️⃣  Copy the migration SQL:')
console.log('   File: supabase/migrations/20251118123008_create_recipes_schema.sql')

const migrationPath = join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '20251118123008_create_recipes_schema.sql'
)

console.log('\n   📄 Migration file is ready to copy!')
console.log(`   Full path: ${migrationPath}\n`)

// Optionally display first few lines
console.log('   Preview:')
const migrationSQL = readFileSync(migrationPath, 'utf-8')
const previewLines = migrationSQL.split('\n').slice(0, 10).join('\n')
console.log('   ' + '─'.repeat(58))
console.log(previewLines.split('\n').map(l => `   ${l}`).join('\n'))
console.log('   ' + '─'.repeat(58))
console.log(`   ... (${migrationSQL.split('\n').length} total lines)\n`)

console.log('3️⃣  In the SQL Editor:')
console.log('   - Click "New Query"')
console.log('   - Paste the ENTIRE migration SQL')
console.log('   - Click "Run" (or press Ctrl+Enter)\n')

console.log('4️⃣  Verify success:')
console.log('   - You should see "Success. No rows returned"')
console.log('   - Go to Table Editor to see the new tables\n')

console.log('✅ After running, you\'ll have:')
console.log('   • recipes table (7 sample recipes)')
console.log('   • recipe_tags, recipe_ingredients, recipe_instructions')
console.log('   • user_favorite_recipes (with RLS)')
console.log('   • Performance indexes')
console.log('   • Row Level Security policies\n')

console.log('=' .repeat(60))
console.log('\n💡 Tip: You can also copy the SQL with:')
console.log(`   cat "${migrationPath}" | clip\n`)
