import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const maxDuration = 60

const RECIPE_API_BASE_URL = 'https://recipe-api.com/api/v1'
const BATCH_SIZE = 20
const PACING_MS = 1500 // detail endpoint rate-limits hard bursts
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Daily cron: fetch full details (ingredients, instructions, storage, etc.)
 * for cached recipes that only have lightweight list data, so detail pages
 * are complete without waiting on a live API fetch. Paced to respect the
 * Recipe-API detail endpoint's tight rate limit.
 */
export async function GET(request: Request) {
  // Vercel sends Authorization: Bearer <CRON_SECRET> for scheduled invocations
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.RECIPE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'RECIPE_API_KEY not configured' }, { status: 500 })
  }

  const supabase = createServiceRoleClient()

  // Rows missing instructions entirely, or cached before the rich detail
  // fields (storage/equipment/chef notes) were added to meta.rich
  const { data: lightweight, error: queryError } = await supabase
    .from('recipe_api_cache')
    .select('recipe_api_id')
    .or('instructions.is.null,meta->rich.is.null')
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (queryError) {
    return NextResponse.json({ error: 'Failed to query cache' }, { status: 500 })
  }

  if (!lightweight || lightweight.length === 0) {
    return NextResponse.json({ ok: true, backfilled: 0, remaining: 0 })
  }

  const expiresAt = new Date(Date.now() + CACHE_TTL_MS).toISOString()
  let backfilled = 0
  let rateLimited = false

  for (const { recipe_api_id } of lightweight) {
    try {
      const response = await fetch(`${RECIPE_API_BASE_URL}/recipes/${recipe_api_id}`, {
        headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
      })

      if (response.status === 429) {
        // Quota exhausted for now — stop and let tomorrow's run continue
        rateLimited = true
        break
      }
      if (!response.ok) continue

      const { data: recipe } = await response.json()
      if (!recipe) continue

      const { error } = await supabase.from('recipe_api_cache').upsert(
        {
          recipe_api_id: recipe.id,
          name: recipe.name,
          description: recipe.description || null,
          category: recipe.category || null,
          cuisine: recipe.cuisine || null,
          difficulty: recipe.difficulty || null,
          tags: recipe.tags || [],
          nutrition: recipe.nutrition,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          meta: {
            ...recipe.meta,
            rich: {
              dietary: recipe.dietary,
              storage: recipe.storage,
              equipment: recipe.equipment,
              troubleshooting: recipe.troubleshooting,
              chef_notes: recipe.chef_notes,
              cultural_context: recipe.cultural_context,
            },
          },
          cache_expires_at: expiresAt,
        },
        { onConflict: 'recipe_api_id' }
      )

      if (!error) backfilled++
    } catch (error) {
      console.error(`[cron/backfill-recipes] Failed for ${recipe_api_id}:`, error)
    }

    await new Promise((resolve) => setTimeout(resolve, PACING_MS))
  }

  const { count: remaining } = await supabase
    .from('recipe_api_cache')
    .select('*', { count: 'exact', head: true })
    .or('instructions.is.null,meta->rich.is.null')

  console.log(`[cron/backfill-recipes] backfilled=${backfilled} rateLimited=${rateLimited} remaining=${remaining}`)
  return NextResponse.json({ ok: true, backfilled, rateLimited, remaining: remaining ?? null })
}
