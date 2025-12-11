/**
 * Spoonacular Cache Warming Script
 *
 * Pre-caches popular high-protein recipes to ensure fast initial page loads
 * and reduce API costs. Run this script before deployment.
 *
 * Usage: npx tsx scripts/warm-spoonacular-cache.ts
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const spoonacularApiKey = process.env.SPOONACULAR_API_KEY!

if (!supabaseUrl || !supabaseServiceKey || !spoonacularApiKey) {
  console.error('❌ Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SPOONACULAR_API_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// Configuration
// ============================================================================

const SEARCH_QUERIES = [
  { query: 'high protein chicken', category: 'chicken' },
  { query: 'high protein beef', category: 'beef' },
  { query: 'high protein breakfast', category: 'breakfast' },
  { query: 'high protein vegetarian', category: 'vegetarian' },
  { query: 'high protein fish', category: 'fish' },
]

const RECIPES_PER_QUERY = 10
const CACHE_TTL_DAYS = 90 // Longer TTL for popular recipes

// ============================================================================
// Helper Functions
// ============================================================================

async function searchRecipes(query: string, number: number) {
  const params = new URLSearchParams({
    apiKey: spoonacularApiKey,
    query,
    number: number.toString(),
    addRecipeInformation: 'true',
    fillIngredients: 'true',
    sort: 'popularity',
  })

  const response = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?${params}`
  )

  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.status}`)
  }

  return response.json()
}

async function cacheRecipe(recipe: any) {
  const nutrients = recipe.nutrition?.nutrients || []
  const getN = (name: string) =>
    nutrients.find((n: any) => n.name === name)?.amount || null

  const recipeData = {
    spoonacular_id: recipe.id,
    title: recipe.title,
    image_url: recipe.image || null,
    image_type: recipe.imageType || null,
    summary: recipe.summary || null,
    servings: recipe.servings,
    ready_in_minutes: recipe.readyInMinutes || null,
    calories: getN('Calories'),
    protein_grams: getN('Protein'),
    carb_grams: getN('Carbohydrates'),
    fat_grams: getN('Fat'),
    fiber_grams: getN('Fiber'),
    sugar_grams: getN('Sugar'),
    sodium_mg: getN('Sodium'),
    nutrition_data: recipe.nutrition || null,
    cuisines: recipe.cuisines || [],
    dish_types: recipe.dishTypes || [],
    diets: recipe.diets || [],
    ingredients: recipe.extendedIngredients || null,
    instructions: recipe.analyzedInstructions || null,
    source_url: recipe.sourceUrl || null,
    source_name: recipe.sourceName || null,
    spoonacular_source_url: recipe.spoonacularSourceUrl || null,
    health_score: recipe.healthScore || null,
    spoonacular_score: recipe.spoonacularScore || null,
    price_per_serving: recipe.pricePerServing || null,
    cheap: recipe.cheap || false,
    dairy_free: recipe.dairyFree || false,
    gluten_free: recipe.glutenFree || false,
    ketogenic: recipe.ketogenic || false,
    vegan: recipe.vegan || false,
    vegetarian: recipe.vegetarian || false,
    very_healthy: recipe.veryHealthy || false,
    very_popular: recipe.veryPopular || false,
    cache_expires_at: new Date(
      Date.now() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000
    ).toISOString(),
  }

  const { error } = await supabase
    .from('spoonacular_recipes')
    .upsert(recipeData, { onConflict: 'spoonacular_id' })

  if (error) {
    console.error(`  ❌ Error caching recipe ${recipe.id}:`, error.message)
  } else {
    console.log(`  ✅ Cached: ${recipe.title} (ID: ${recipe.id})`)
  }
}

async function cacheSearchResults(queryHash: string, params: any, results: any[]) {
  const recipeIds = results.map((r) => r.id)

  const searchData = {
    query_hash: queryHash,
    query_params: params,
    recipe_ids: recipeIds,
    total_results: results.length,
    expires_at: new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000 // 14 days
    ).toISOString(),
  }

  const { error } = await supabase
    .from('spoonacular_search_cache')
    .upsert(searchData, { onConflict: 'query_hash' })

  if (error) {
    console.error(`  ❌ Error caching search:`, error.message)
  }
}

// ============================================================================
// Main Script
// ============================================================================

async function main() {
  console.log('🚀 Starting Spoonacular cache warming...\n')

  let totalCached = 0
  let totalApiCalls = 0

  for (const { query, category } of SEARCH_QUERIES) {
    console.log(`\n📦 Searching for: "${query}"`)

    try {
      const data = await searchRecipes(query, RECIPES_PER_QUERY)
      totalApiCalls++

      if (!data.results || data.results.length === 0) {
        console.log(`  ⚠️  No results found`)
        continue
      }

      console.log(`  Found ${data.results.length} recipes`)

      // Cache search results
      const queryHash = Buffer.from(JSON.stringify({ query, category })).toString('base64')
      await cacheSearchResults(queryHash, { query, category }, data.results)

      // Cache individual recipes
      for (const recipe of data.results) {
        await cacheRecipe(recipe)
        totalCached++

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error(`  ❌ Error:`, error instanceof Error ? error.message : error)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✨ Cache warming complete!')
  console.log('='.repeat(60))
  console.log(`📊 Total recipes cached: ${totalCached}`)
  console.log(`🔌 Total API calls made: ${totalApiCalls}`)
  console.log(`💰 Estimated cost: ~${totalApiCalls} points`)
  console.log(`⏰ Cache expiration: ${CACHE_TTL_DAYS} days`)
  console.log('='.repeat(60) + '\n')

  // Verify cache
  const { count } = await supabase
    .from('spoonacular_recipes')
    .select('*', { count: 'exact', head: true })

  console.log(`✅ Total recipes in cache: ${count}`)
}

// Run the script
main()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
