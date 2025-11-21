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

async function seedProteinYogurtBowl() {
  console.log('Seeding data for Protein Yogurt Bowl...')

  // 1. Get the recipe ID
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id')
    .eq('name', 'Protein Yogurt Bowl')
    .single()

  if (recipeError || !recipe) {
    console.error('Error fetching recipe:', recipeError)
    return
  }

  const recipeId = recipe.id
  console.log('Found recipe ID:', recipeId)

  // 2. Insert Ingredients
  const ingredients = [
    { recipe_id: recipeId, ingredient: 'Greek yogurt', amount: '1', unit: 'cup', order_index: 1 },
    { recipe_id: recipeId, ingredient: 'mixed berries', amount: '1/2', unit: 'cup', order_index: 2 },
    { recipe_id: recipeId, ingredient: 'honey', amount: '1', unit: 'tbsp', order_index: 3 },
    { recipe_id: recipeId, ingredient: 'granola', amount: '1/4', unit: 'cup', order_index: 4 },
  ]

  const { error: ingError } = await supabase
    .from('recipe_ingredients')
    .insert(ingredients)

  if (ingError) {
    console.error('Error inserting ingredients:', ingError)
  } else {
    console.log('Ingredients inserted successfully.')
  }

  // 3. Insert Instructions
  const instructions = [
    { recipe_id: recipeId, step_number: 1, instruction: 'Scoop the Greek yogurt into a bowl.' },
    { recipe_id: recipeId, step_number: 2, instruction: 'Top with mixed berries and granola.' },
    { recipe_id: recipeId, step_number: 3, instruction: 'Drizzle with honey and serve immediately.' },
  ]

  const { error: instError } = await supabase
    .from('recipe_instructions')
    .insert(instructions)

  if (instError) {
    console.error('Error inserting instructions:', instError)
  } else {
    console.log('Instructions inserted successfully.')
  }
}

seedProteinYogurtBowl()
