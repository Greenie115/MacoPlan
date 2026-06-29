/**
 * Seed Recipe Library
 *
 * Reads RecipeNLG CSV, filters for batch-prep-friendly recipes,
 * enriches with GLM via OpenRouter for nutrition/metadata,
 * and inserts into Supabase.
 *
 * Usage:
 *   npx tsx scripts/seed-recipe-library.ts [--dry-run] [--limit 100]
 *
 * Requires .env.local with:
 *   OPENROUTER_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { resolve } from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: resolve(__dirname, '..', '.env.local') })

// ============================================================================
// Configuration
// ============================================================================

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GLM 4.7 Flash via OpenRouter — fast and cheap for bulk nutrition estimation.
// Override with OPENROUTER_MODEL, e.g. `z-ai/glm-5.2` for higher-end estimates.
const MODEL = process.env.OPENROUTER_MODEL || 'z-ai/glm-4.7-flash'
const BATCH_SIZE = 10
const RATE_LIMIT_DELAY_MS = 2000

// Batch-prep keyword filters
const PREP_KEYWORDS = [
  'meal prep', 'sheet pan', 'one pot', 'slow cooker', 'crockpot',
  'crock pot', 'instant pot', 'casserole', 'stew', 'bake', 'baked',
  'roast', 'roasted', 'grilled', 'skillet', 'stir fry', 'stir-fry',
  'bowl', 'wrap', 'burrito', 'rice', 'chicken', 'turkey', 'beef',
  'salmon', 'shrimp', 'tofu', 'lentil', 'bean', 'quinoa', 'pasta',
  'soup', 'chili', 'curry', 'teriyaki', 'meatball', 'meatloaf',
  'pulled', 'braised', 'sauteed', 'high protein', 'protein',
  'healthy', 'lean', 'low carb', 'keto', 'paleo',
]

// Discard recipes with these terms (desserts, drinks, etc.)
const EXCLUDE_KEYWORDS = [
  'cake', 'cookie', 'cookies', 'brownie', 'pie', 'cupcake', 'muffin',
  'frosting', 'icing', 'candy', 'fudge', 'cheesecake', 'pudding',
  'cocktail', 'martini', 'margarita', 'sangria', 'smoothie',
  'milkshake', 'lemonade', 'punch', 'eggnog',
  'ice cream', 'sorbet', 'gelato', 'popsicle',
  'jam', 'jelly', 'preserve', 'canning',
  'dip', 'appetizer', 'canape',
]

// ============================================================================
// CSV Parser (streaming — the RecipeNLG dataset is ~2.3 GB, far past Node's
// ~512 MB max string size, so we cannot read it into memory at once)
// ============================================================================

interface RawRecipe {
  title: string
  ingredients: string[]
  instructions: string[]
  link: string
}

/**
 * Parse one RFC-4180 CSV record into fields. Handles double-quoted fields and
 * the "" escape for a literal quote. After unescaping, the ingredients and
 * directions columns are valid JSON arrays.
 */
function parseCSVRecord(record: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < record.length) {
    const ch = record[i]

    if (inQuotes) {
      if (ch === '"') {
        if (record[i + 1] === '"') {
          current += '"' // escaped quote
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      current += ch
      i++
    } else if (ch === '"') {
      inQuotes = true
      i++
    } else if (ch === ',') {
      fields.push(current)
      current = ''
      i++
    } else {
      current += ch
      i++
    }
  }

  fields.push(current)
  return fields
}

/**
 * Stream the CSV, filter for batch-prep-friendly recipes, and dedup by title
 * inline.
 *
 * - `sample` true (default): reservoir-sample `limit` recipes uniformly across
 *   the *entire* file (Algorithm R). This scans all ~2.2M rows but yields far
 *   better cuisine/era variety than the front of the file, which is dominated
 *   by one source's old-fashioned American casseroles.
 * - `sample` false (`--fast`): take the first `limit` qualifying recipes and
 *   stop early. Fast, for previewing the pipeline during development.
 *
 * RecipeNLG columns: index, title, ingredients, directions, link, source, NER
 */
async function collectRecipes(
  csvPath: string,
  limit: number,
  options: {
    sample?: boolean
    excludeSourceIds?: Set<string>
    onProgress?: (scanned: number, kept: number) => void
  } = {}
): Promise<RawRecipe[]> {
  const { sample = true, excludeSourceIds, onProgress } = options

  const rl = createInterface({
    input: createReadStream(csvPath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  })

  const reservoir: RawRecipe[] = []
  const seenTitles = new Set<string>()
  let buffer = ''
  let isHeader = true
  let scanned = 0
  let qualifying = 0 // count of unique batch-prep-friendly recipes seen

  for await (const line of rl) {
    // A record may span multiple physical lines if a quoted field contains a
    // newline. Quotes (including escaped "") always come in pairs, so a record
    // is complete only when the accumulated buffer has an even quote count.
    buffer += (buffer ? '\n' : '') + line
    const quoteCount = (buffer.match(/"/g) || []).length
    if (quoteCount % 2 !== 0) continue

    const record = buffer
    buffer = ''

    if (isHeader) {
      isHeader = false
      continue
    }
    if (!record.trim()) continue

    scanned++
    if (onProgress && scanned % 100000 === 0) onProgress(scanned, qualifying)

    const fields = parseCSVRecord(record)
    if (fields.length < 5) continue

    const title = fields[1].trim()
    if (!title) continue

    let ingredients: string[]
    let instructions: string[]
    try {
      ingredients = JSON.parse(fields[2])
      instructions = JSON.parse(fields[3])
    } catch {
      continue
    }

    if (!Array.isArray(ingredients) || !Array.isArray(instructions)) continue
    if (ingredients.length < 3 || instructions.length < 1) continue

    const raw: RawRecipe = {
      title,
      ingredients,
      instructions,
      link: fields[4]?.trim() || '',
    }

    if (!isBatchPrepFriendly(raw)) continue

    // Skip recipes already seeded (top-up runs pass the existing source_ids).
    if (excludeSourceIds && excludeSourceIds.has(toSourceId(title))) continue

    const normalized = title.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (seenTitles.has(normalized)) continue
    seenTitles.add(normalized)

    if (!sample) {
      reservoir.push(raw)
      if (reservoir.length >= limit) break
      continue
    }

    // Reservoir sampling (Algorithm R): keep a uniform random `limit` subset.
    // `qualifying` is the 0-based index of this item, so the replacement index
    // is drawn from [0, qualifying] inclusive.
    if (reservoir.length < limit) {
      reservoir.push(raw)
    } else {
      const j = Math.floor(Math.random() * (qualifying + 1))
      if (j < limit) reservoir[j] = raw
    }
    qualifying++
  }

  rl.close()
  return reservoir
}

// ============================================================================
// Filtering
// ============================================================================

/** Deterministic stable id derived from the recipe title (the upsert key). */
function toSourceId(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 100)
}

function isBatchPrepFriendly(recipe: RawRecipe): boolean {
  const titleLower = recipe.title.toLowerCase()
  const ingredientsStr = recipe.ingredients.join(' ').toLowerCase()
  const allText = titleLower + ' ' + ingredientsStr

  // Exclude desserts, drinks, etc.
  if (EXCLUDE_KEYWORDS.some(kw => titleLower.includes(kw))) return false

  // Must match at least one prep keyword
  return PREP_KEYWORDS.some(kw => allText.includes(kw))
}

// ============================================================================
// GLM Enrichment
// ============================================================================

/**
 * Pull the JSON object out of a model response. With reasoning disabled and
 * json_object response_format the content is already clean JSON, but this
 * defensively strips markdown fences or stray prose from the first `{` to the
 * last `}`.
 */
function extractJSON(content: string): string {
  const trimmed = content.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return trimmed
  return trimmed.slice(start, end + 1)
}

interface EnrichedRecipe {
  title: string
  description: string
  servings: number
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  total_time_minutes: number | null
  calories: number
  protein_grams: number
  carb_grams: number
  fat_grams: number
  fiber_grams: number | null
  sugar_grams: number | null
  cuisine: string
  dietary_flags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  batch_prep_score: number
  storage_fridge_days: number | null
  storage_freezer_days: number | null
  reheating_notes: string | null
}

interface EnrichmentResult {
  recipes: EnrichedRecipe[]
}

async function enrichBatch(
  batch: RawRecipe[]
): Promise<{ enriched: (EnrichedRecipe & { raw: RawRecipe })[], usage: { prompt_tokens: number, completion_tokens: number } }> {
  const recipeSummaries = batch.map((r, i) => ({
    index: i,
    title: r.title,
    ingredients: r.ingredients.slice(0, 20),
    instructions: r.instructions.slice(0, 10),
  }))

  const systemPrompt = `You are a nutrition analyst and meal-prep expert. For each recipe provided, estimate the nutritional information and metadata. Return ONLY valid JSON matching this schema:

{
  "recipes": [
    {
      "title": "exact title from input",
      "description": "1-2 sentence description of the dish",
      "servings": 4,
      "prep_time_minutes": 15,
      "cook_time_minutes": 30,
      "total_time_minutes": 45,
      "calories": 450,
      "protein_grams": 35,
      "carb_grams": 40,
      "fat_grams": 15,
      "fiber_grams": 5,
      "sugar_grams": 8,
      "cuisine": "american",
      "dietary_flags": ["gluten-free", "dairy-free"],
      "difficulty": "easy",
      "batch_prep_score": 4,
      "storage_fridge_days": 5,
      "storage_freezer_days": 30,
      "reheating_notes": "Microwave 2-3 min or reheat in skillet"
    }
  ]
}

Rules:
- Estimate per-serving nutrition based on typical ingredient amounts
- cuisine: lowercase single word (american, mexican, asian, indian, mediterranean, italian, japanese, korean, thai, greek, middle-eastern, caribbean, african, french, other)
- dietary_flags: only include flags that genuinely apply from: vegetarian, vegan, gluten-free, dairy-free, keto, paleo, nut-free, soy-free, low-carb, high-protein
- batch_prep_score: 1-5 where 5 = perfect for cooking once and eating all week (stores well, reheats well, scales easily)
- difficulty: easy (under 30min active), medium (30-60min), hard (60min+)
- Be realistic with nutrition estimates — don't inflate protein or deflate calories
- If you cannot reasonably estimate a field, use null`

  const userPrompt = `Analyze these ${batch.length} recipes:\n\n${JSON.stringify(recipeSummaries, null, 2)}`

  const body = JSON.stringify({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 8192,
    response_format: { type: 'json_object' },
    // GLM models reason by default, which is slow, costly, and frequently
    // exhausts the token budget before any JSON is emitted (empty content).
    // This task needs no reasoning, so disable it for speed and reliability.
    reasoning: { enabled: false },
  })

  // Retry transient network failures (fetch failed / terminated) and 429/5xx
  // with exponential backoff. A long seed run otherwise silently drops batches.
  const MAX_ATTEMPTS = 4
  let res: Response | undefined
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://macroplan.app',
          'X-Title': 'MacroPlan Recipe Seed',
        },
        body,
      })
    } catch (err) {
      // Network-level error (fetch failed / terminated / ECONNRESET).
      if (attempt === MAX_ATTEMPTS) throw err
      await new Promise(r => setTimeout(r, attempt * 3000))
      continue
    }

    if (res.ok) break

    // Retry rate-limit and server errors; fail fast on other 4xx.
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_ATTEMPTS) {
      await new Promise(r => setTimeout(r, attempt * 3000))
      continue
    }

    const text = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${text}`)
  }

  if (!res) throw new Error('OpenRouter request failed after retries')

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  const usage = data.usage ?? { prompt_tokens: 0, completion_tokens: 0 }

  let parsed: EnrichmentResult
  try {
    parsed = JSON.parse(extractJSON(content)) as EnrichmentResult
  } catch {
    console.error('Failed to parse GLM response:', content.slice(0, 200) || '(empty)')
    return { enriched: [], usage }
  }

  if (!parsed.recipes || !Array.isArray(parsed.recipes)) {
    console.error('Invalid response structure — missing recipes array')
    return { enriched: [], usage }
  }

  const enriched = parsed.recipes
    .filter(r => r.batch_prep_score >= 3 && r.calories > 0 && r.protein_grams >= 0)
    .map(r => {
      const rawMatch = batch.find(raw => raw.title.toLowerCase() === r.title.toLowerCase())
        ?? batch[parsed.recipes.indexOf(r)]
        ?? batch[0]
      return { ...r, raw: rawMatch }
    })

  return { enriched, usage }
}

// ============================================================================
// Supabase Insert
// ============================================================================

async function insertRecipes(
  supabase: SupabaseClient<any, any, any>,
  recipes: (EnrichedRecipe & { raw: RawRecipe })[]
): Promise<number> {
  let inserted = 0

  for (const recipe of recipes) {
    const sourceId = toSourceId(recipe.raw.title)

    // Upsert recipe
    const { data: recipeRow, error: recipeError } = await supabase
      .from('recipes')
      .upsert({
        name: recipe.title,
        description: recipe.description,
        image_url: null,
        calories: Math.round(recipe.calories),
        protein_grams: Math.round(recipe.protein_grams),
        carb_grams: Math.round(recipe.carb_grams),
        fat_grams: Math.round(recipe.fat_grams),
        fiber_grams: recipe.fiber_grams != null ? Math.round(recipe.fiber_grams) : null,
        sugar_grams: recipe.sugar_grams != null ? Math.round(recipe.sugar_grams) : null,
        prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes,
        total_time_minutes: recipe.total_time_minutes,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        cuisine: recipe.cuisine,
        dietary_flags: recipe.dietary_flags,
        batch_prep_score: recipe.batch_prep_score,
        storage_fridge_days: recipe.storage_fridge_days,
        storage_freezer_days: recipe.storage_freezer_days,
        reheating_notes: recipe.reheating_notes,
        source: 'recipenlg',
        source_id: sourceId,
        rating: 0,
        rating_count: 0,
      }, { onConflict: 'source_id' })
      .select('id')
      .single()

    if (recipeError || !recipeRow) {
      console.error(`  Failed to insert recipe "${recipe.title}":`, recipeError?.message)
      continue
    }

    const recipeId = recipeRow.id

    // Delete existing ingredients/instructions (for upsert idempotency)
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId)
    await supabase.from('recipe_instructions').delete().eq('recipe_id', recipeId)

    // Insert ingredients
    const ingredientRows = recipe.raw.ingredients.map((ing, i) => ({
      recipe_id: recipeId,
      ingredient: ing,
      amount: '',
      unit: null,
      order_index: i,
    }))

    if (ingredientRows.length > 0) {
      await supabase.from('recipe_ingredients').insert(ingredientRows)
    }

    // Insert instructions
    const instructionRows = recipe.raw.instructions.map((inst, i) => ({
      recipe_id: recipeId,
      step_number: i + 1,
      instruction: inst,
    }))

    if (instructionRows.length > 0) {
      await supabase.from('recipe_instructions').insert(instructionRows)
    }

    // Insert tags from dietary_flags + cuisine
    const tags = [...recipe.dietary_flags]
    if (recipe.cuisine && recipe.cuisine !== 'other') tags.push(recipe.cuisine)
    if (recipe.batch_prep_score >= 4) tags.push('meal-prep')
    if (recipe.protein_grams >= 30) tags.push('high-protein')
    if (recipe.carb_grams <= 20) tags.push('low-carb')

    if (tags.length > 0) {
      await supabase.from('recipe_tags').delete().eq('recipe_id', recipeId)
      const tagRows = tags.map(tag => ({ recipe_id: recipeId, tag }))
      await supabase.from('recipe_tags').insert(tagRows)
    }

    inserted++
  }

  return inserted
}

/**
 * Fetch all existing recipenlg source_ids, paginating past Supabase's 1000-row
 * default page size.
 */
async function fetchExistingSourceIds(supabase: SupabaseClient<any, any, any>): Promise<Set<string>> {
  const ids = new Set<string>()
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('recipes')
      .select('source_id')
      .eq('source', 'recipenlg')
      .not('source_id', 'is', null)
      .range(from, from + pageSize - 1)
    if (error) throw new Error(`Failed to fetch existing source_ids: ${error.message}`)
    if (!data || data.length === 0) break
    for (const row of data) if (row.source_id) ids.add(row.source_id as string)
    if (data.length < pageSize) break
  }
  return ids
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const fast = args.includes('--fast')
  const topUp = args.includes('--top-up')
  const limitIdx = args.indexOf('--limit')
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity

  if (!OPENROUTER_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing required env vars: OPENROUTER_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const csvPath = resolve(__dirname, '..', 'data', 'recipenlg.csv')
  // Target library size. The dataset has ~2.2M recipes; default to 3000.
  const targetSize = limit === Infinity ? 3000 : limit

  // In top-up mode, exclude recipes already seeded and only collect the
  // shortfall, so we recover dropped batches without re-enriching existing rows.
  let excludeSourceIds: Set<string> | undefined
  let collectLimit = targetSize
  if (topUp) {
    excludeSourceIds = await fetchExistingSourceIds(supabase)
    collectLimit = targetSize - excludeSourceIds.size
    console.log(`Top-up mode: ${excludeSourceIds.size} recipes already seeded, need ${collectLimit} more to reach ${targetSize}`)
    if (collectLimit <= 0) {
      console.log('Library already at target size. Nothing to do.')
      return
    }
  }

  console.log(`Streaming CSV from ${csvPath}...`)
  console.log(
    fast
      ? `Mode: fast (first ${collectLimit} qualifying recipes from the front of the file)`
      : `Mode: sampled (reservoir-sampling ${collectLimit} recipes across the whole dataset for cuisine variety)`
  )

  let filtered: RawRecipe[]
  try {
    filtered = await collectRecipes(csvPath, collectLimit, {
      sample: !fast,
      excludeSourceIds,
      onProgress: (scanned, qualifying) => {
        process.stdout.write(`  scanned ${scanned.toLocaleString()} rows, ${qualifying.toLocaleString()} qualifying...\r`)
      },
    })
  } catch (err) {
    console.error(`\nFailed to read CSV. Download RecipeNLG dataset and place at ${csvPath}`)
    console.error('Download: https://recipenlg.cs.put.poznan.pl/dataset')
    console.error(`Error: ${err instanceof Error ? err.message : err}`)
    process.exit(1)
  }

  console.log(`\nCollected ${filtered.length.toLocaleString()} batch-prep-friendly recipes (deduped)`)

  if (dryRun) {
    console.log('\n=== DRY RUN ===')
    console.log(`Would process ${filtered.length} recipes in ${Math.ceil(filtered.length / BATCH_SIZE)} batches`)
    console.log('\nSample titles:')
    filtered.slice(0, 20).forEach(r => console.log(`  - ${r.title}`))
    return
  }

  let totalInserted = 0
  let totalPromptTokens = 0
  let totalCompletionTokens = 0
  let batchErrors = 0
  const totalBatches = Math.ceil(filtered.length / BATCH_SIZE)

  console.log(`\nProcessing ${filtered.length} recipes in ${totalBatches} batches...\n`)

  for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const batch = filtered.slice(i, i + BATCH_SIZE)

    process.stdout.write(`Batch ${batchNum}/${totalBatches} (${batch.length} recipes)... `)

    try {
      const { enriched, usage } = await enrichBatch(batch)
      totalPromptTokens += usage.prompt_tokens
      totalCompletionTokens += usage.completion_tokens

      if (enriched.length > 0) {
        const inserted = await insertRecipes(supabase, enriched)
        totalInserted += inserted
        console.log(`${enriched.length} enriched, ${inserted} inserted (${usage.prompt_tokens + usage.completion_tokens} tokens)`)
      } else {
        console.log('0 enriched (all filtered out or parse error)')
      }
    } catch (err) {
      batchErrors++
      console.error(`ERROR: ${err instanceof Error ? err.message : err}`)
    }

    // Rate limit
    if (i + BATCH_SIZE < filtered.length) {
      await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS))
    }
  }

  // Rough cost at GLM 4.7 Flash rates ($0.06/M input, $0.40/M output). If you
  // set OPENROUTER_MODEL to a pricier model, actual cost will be higher.
  const estCost = (totalPromptTokens * 0.06 + totalCompletionTokens * 0.4) / 1_000_000

  console.log('\n=== COMPLETE ===')
  console.log(`Model: ${MODEL}`)
  console.log(`Recipes inserted: ${totalInserted}`)
  console.log(`Batch errors: ${batchErrors}`)
  console.log(`Tokens used: ${totalPromptTokens.toLocaleString()} prompt + ${totalCompletionTokens.toLocaleString()} completion`)
  console.log(`Estimated cost (GLM 4.7 Flash rates): ~$${estCost.toFixed(2)}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
