import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function listRecipes() {
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, name')

  if (error) {
    console.error('Error fetching recipes:', error)
    return
  }

  console.log('Recipes found:')
  recipes.forEach((recipe) => {
    console.log(`${recipe.id}: ${recipe.name}`)
  })
}

listRecipes()
