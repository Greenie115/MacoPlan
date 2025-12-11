/**
 * FatSecret API Connection Test Script
 *
 * Tests OAuth 2.0 authentication and basic API calls to FatSecret
 *
 * Usage: npx ts-node --esm scripts/test-fatsecret-connection.ts
 * Or: npx tsx scripts/test-fatsecret-connection.ts
 */

// Load environment variables
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const FATSECRET_CLIENT_ID = process.env.FATSECRET_ID
const FATSECRET_CLIENT_SECRET = process.env.FATSECRET_API_KEY

const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token'
const API_BASE_URL = 'https://platform.fatsecret.com/rest'

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface FoodSearchResult {
  foods: {
    food: Array<{
      food_id: string
      food_name: string
      food_type: string
      brand_name?: string
      food_description: string
      food_url: string
    }>
    max_results: string
    page_number: string
    total_results: string
  }
}

interface RecipeSearchResult {
  recipes: {
    recipe: Array<{
      recipe_id: string
      recipe_name: string
      recipe_description: string
      recipe_image?: string
      recipe_nutrition: {
        calories: string
        carbohydrate: string
        fat: string
        protein: string
      }
    }>
    max_results: string
    page_number: string
    total_results: string
  }
}

async function getAccessToken(): Promise<TokenResponse> {
  console.log('\n🔐 Attempting OAuth 2.0 authentication...')
  console.log(`   Client ID: ${FATSECRET_CLIENT_ID?.substring(0, 8)}...`)

  if (!FATSECRET_CLIENT_ID || !FATSECRET_CLIENT_SECRET) {
    throw new Error('Missing FatSecret credentials in .env.local')
  }

  // Create Basic auth header
  const credentials = Buffer.from(`${FATSECRET_CLIENT_ID}:${FATSECRET_CLIENT_SECRET}`).toString('base64')

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'basic',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token request failed (${response.status}): ${errorText}`)
  }

  const tokenData: TokenResponse = await response.json()
  console.log('   ✅ Authentication successful!')
  console.log(`   Token type: ${tokenData.token_type}`)
  console.log(`   Expires in: ${tokenData.expires_in} seconds (${Math.round(tokenData.expires_in / 3600)} hours)`)
  console.log(`   Scope: ${tokenData.scope}`)

  return tokenData
}

async function searchFoods(accessToken: string, query: string): Promise<FoodSearchResult> {
  console.log(`\n🔍 Searching foods for: "${query}"`)

  const params = new URLSearchParams({
    method: 'foods.search',
    search_expression: query,
    format: 'json',
    max_results: '5',
  })

  const response = await fetch(`${API_BASE_URL}/server.api?${params}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Food search failed (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  console.log('   Raw response:', JSON.stringify(data, null, 2).substring(0, 500))
  return data as FoodSearchResult
}

async function searchRecipes(accessToken: string, query: string): Promise<RecipeSearchResult> {
  console.log(`\n🍳 Searching recipes for: "${query}"`)

  const params = new URLSearchParams({
    method: 'recipes.search',
    search_expression: query,
    format: 'json',
    max_results: '5',
  })

  const response = await fetch(`${API_BASE_URL}/server.api?${params}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Recipe search failed (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  console.log('   Raw response:', JSON.stringify(data, null, 2).substring(0, 500))
  return data as RecipeSearchResult
}

async function getFoodDetails(accessToken: string, foodId: string): Promise<any> {
  console.log(`\n📋 Getting food details for ID: ${foodId}`)

  const params = new URLSearchParams({
    method: 'food.get.v4',
    food_id: foodId,
    format: 'json',
  })

  const response = await fetch(`${API_BASE_URL}/server.api?${params}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Food details failed (${response.status}): ${errorText}`)
  }

  return response.json()
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('           FatSecret API Connection Test')
  console.log('═══════════════════════════════════════════════════════════════')

  try {
    // Step 1: Get access token
    const tokenData = await getAccessToken()

    // Step 2: Test food search
    const foodResults = await searchFoods(tokenData.access_token, 'chicken breast')

    // Check for IP whitelist error
    if ((foodResults as any).error?.code === 21) {
      const ipMatch = (foodResults as any).error.message.match(/IP address detected:\s+'([^']+)'/)
      const detectedIP = ipMatch ? ipMatch[1] : 'unknown'

      console.log('\n═══════════════════════════════════════════════════════════════')
      console.log('   ⚠️  IP ADDRESS NOT WHITELISTED')
      console.log('═══════════════════════════════════════════════════════════════')
      console.log(`\n   Your current IP: ${detectedIP}`)
      console.log('\n   To fix this:')
      console.log('   1. Go to https://platform.fatsecret.com/api-key-management')
      console.log('   2. Click on your application')
      console.log('   3. Add your IP address to the "OAuth 2.0 IP Addresses" list')
      console.log(`   4. Add: ${detectedIP}`)
      console.log('\n   For development, you can add multiple IPs.')
      console.log('   For production, whitelist your server IP.')
      console.log('\n   OAuth 2.0 authentication is WORKING ✅')
      console.log('   Just need to whitelist your IP for API calls.')
      console.log('═══════════════════════════════════════════════════════════════\n')
      return
    }

    if (foodResults.foods?.food) {
      console.log(`   ✅ Found ${foodResults.foods.total_results} total results`)
      console.log('\n   Top 5 food results:')
      foodResults.foods.food.forEach((food, index) => {
        console.log(`   ${index + 1}. ${food.food_name} (${food.food_type})`)
        console.log(`      ID: ${food.food_id}`)
        console.log(`      ${food.food_description.substring(0, 80)}...`)
      })

      // Step 3: Get detailed nutrition for first result
      const firstFoodId = foodResults.foods.food[0].food_id
      const foodDetails = await getFoodDetails(tokenData.access_token, firstFoodId)

      if (foodDetails.food) {
        console.log('\n   📊 Detailed nutrition for first result:')
        console.log(`      Food: ${foodDetails.food.food_name}`)

        const servings = foodDetails.food.servings?.serving
        if (servings) {
          const serving = Array.isArray(servings) ? servings[0] : servings
          console.log(`      Serving: ${serving.serving_description}`)
          console.log(`      Calories: ${serving.calories} kcal`)
          console.log(`      Protein: ${serving.protein}g`)
          console.log(`      Carbs: ${serving.carbohydrate}g`)
          console.log(`      Fat: ${serving.fat}g`)
        }
      }
    } else {
      console.log('   ⚠️ No food results found')
    }

    // Step 4: Test recipe search
    const recipeResults = await searchRecipes(tokenData.access_token, 'grilled chicken')

    if (recipeResults.recipes?.recipe) {
      console.log(`\n   ✅ Found ${recipeResults.recipes.total_results} total recipes`)
      console.log('\n   Top 5 recipe results:')
      recipeResults.recipes.recipe.forEach((recipe, index) => {
        console.log(`   ${index + 1}. ${recipe.recipe_name}`)
        console.log(`      ID: ${recipe.recipe_id}`)
        console.log(`      Calories: ${recipe.recipe_nutrition?.calories || 'N/A'} kcal`)
        console.log(`      Protein: ${recipe.recipe_nutrition?.protein || 'N/A'}g`)
      })
    } else {
      console.log('   ⚠️ No recipe results found')
    }

    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('   ✅ All tests passed! FatSecret API is working correctly.')
    console.log('═══════════════════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('\n   ❌ Error:', error instanceof Error ? error.message : error)
    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('   ❌ Connection test failed. Check your credentials.')
    console.log('═══════════════════════════════════════════════════════════════\n')
    process.exit(1)
  }
}

main()
