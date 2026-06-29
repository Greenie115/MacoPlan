# Self-hosted recipe library

**Date:** 2026-06-29
**Goal:** Replace Recipe-API.com dependency with a self-hosted recipe library seeded from open data, enriched with GLM via OpenRouter. Eliminate ongoing API costs and give the batch-prep generator access to curated, real recipes.

## Architecture overview

```
RecipeNLG CSV (2M)
  → filter script (keywords, dedup, quality) → ~3-5k candidates
  → GLM enrichment via OpenRouter (nutrition, tags, scores) → ~2-2.5k recipes
  → Supabase `recipes` table (service role insert)

User generates a prep plan:
  1. Server queries recipes table (macros, dietary flags, cuisine, exclusions)
  2. ~20-30 candidates sent to GLM via OpenRouter
  3. GLM picks 3-4, assigns portions, builds cooking timeline
  4. Same Zod schema, same frontend — nothing changes downstream
```

## Data pipeline

### Source
RecipeNLG dataset (~2M recipes, CSV). Downloaded once, processed locally.

### Filtering (local, no AI)
- Keyword match for batch-prep suitability: "sheet pan", "slow cooker", "one pot", "meal prep", "casserole", "stew", "bake", high-protein terms
- Discard: < 3 ingredients, no instructions, desserts, cocktails, appetizer-only
- Deduplicate by normalized title similarity
- Target: ~3-5k candidates pass filtering

### GLM enrichment (OpenRouter)
For each recipe batch (15 per call), GLM returns structured JSON:
- Per-serving macros: calories, protein, carbs, fat, fiber, sugar
- Serving count estimate
- Prep time, cook time (minutes)
- Cuisine tag (e.g. "mexican", "asian", "mediterranean")
- Dietary flags array (gluten-free, dairy-free, vegetarian, vegan, keto, etc.)
- Difficulty: easy / medium / hard
- Batch-prep suitability score (1-5)
- Storage: fridge days, freezer days, reheating notes

Discard recipes with batch_prep_score < 3.

**Cost estimate:** ~$2-4 total (GLM is ~$0.001-0.002/1k tokens, ~1.5M tokens for 3k recipes).

## Database schema

### `recipes` table — new columns
```sql
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cuisine text;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS dietary_flags text[] DEFAULT '{}';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS batch_prep_score integer;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS storage_fridge_days integer;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS storage_freezer_days integer;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS reheating_notes text;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS source text DEFAULT 'library';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS source_id text;
```

### New indexes
```sql
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_batch_prep_score ON recipes(batch_prep_score);
CREATE INDEX IF NOT EXISTS idx_recipes_macros ON recipes(calories, protein_grams);
CREATE INDEX IF NOT EXISTS idx_recipes_dietary_flags ON recipes USING GIN(dietary_flags);
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipes_source_id ON recipes(source_id);
```

### RLS
Recipes are public read for all authenticated users. Only the import script writes via service role.

```sql
CREATE POLICY "Authenticated users can read recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (true);
```

### Existing tables — no changes
- `recipe_tags` — works as-is
- `recipe_ingredients` — works as-is
- `recipe_instructions` — works as-is

## Batch-prep generator changes

### Current flow
1. Build prompt with user macros/preferences
2. Send to Claude → generates recipes from scratch
3. Zod parse → macro accuracy check → retry → persist

### New flow
1. **Query candidate recipes** from `recipes` table:
   - `batch_prep_score >= 3`
   - `dietary_flags @> user_dietary_flags` (array containment)
   - Exclude recipes containing user's excluded ingredients (join to `recipe_ingredients`)
   - Filter calorie/protein range near user targets
   - Prefer cuisine diversity
   - Return ~20-30 candidates with full ingredient/instruction data
2. **Send candidates + user macros to GLM** via OpenRouter:
   - Prompt: "Pick 3-4 recipes from this list, assign portion multipliers to hit these daily macros, build a cooking timeline"
   - Same Zod output schema as current generator
3. **Validate, retry, persist** — same logic as today

### What stays the same
- Zod output schema and validation
- Best-of-two retry logic
- Persistence to `batch_prep_plans`
- Entire frontend (consumes the same shape)

### What changes
- `batch-prep-generator.ts` gains `fetchCandidateRecipes()` before LLM call
- System prompt: "select and assemble" instead of "invent"
- Anthropic SDK → OpenRouter fetch (GLM)
- `anthropic_usage_log` → add `provider` column or rename to `llm_usage_log`

## OpenRouter integration

### Client: `lib/services/openrouter.ts`
Simple fetch wrapper using OpenAI-compatible API format:
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Auth: `Authorization: Bearer ${OPENROUTER_API_KEY}`
- Model: `google/glm-4-plus` (or cheapest GLM variant available)
- Supports structured JSON output via `response_format`

### New env var
```
OPENROUTER_API_KEY=sk-or-...
```

## Import script

### `scripts/seed-recipe-library.ts`
Standalone Node script, run locally against production Supabase.

1. Read RecipeNLG CSV
2. Filter by keywords, discard junk, deduplicate
3. Batch 15 recipes per GLM call
4. Parse response, discard score < 3
5. Insert to Supabase via service role client (upsert on `source_id`)
6. Insert ingredients to `recipe_ingredients`, instructions to `recipe_instructions`
7. Log progress, cost, and error rate

Run time: ~30-60 minutes for 3k recipes.

## Migration path

### Phase 1: Schema + import
- Run migration SQL in Supabase
- Download RecipeNLG, run seed script
- Verify data quality in Supabase dashboard

### Phase 2: Browse page
- Update `/recipes` page to query own `recipes` table instead of Recipe-API.com
- Keep existing filter UI, connect to new columns
- Remove Recipe-API.com search actions

### Phase 3: Generator integration
- Add `fetchCandidateRecipes()` to batch-prep generator
- Build OpenRouter client
- Update generator prompt from "invent" to "select"
- Test with real users

### Phase 4: Cleanup
- Remove `recipe-api.ts` service and related types
- Remove `recipe_api_cache` and `recipe_api_search_cache` tables
- Remove `RECIPE_API_KEY` env var
- Update CLAUDE.md

## Files to create/modify

### New files
- `scripts/seed-recipe-library.ts` — import pipeline
- `lib/services/openrouter.ts` — OpenRouter client
- `supabase/migrations/20260629_recipe_library_columns.sql` — schema migration

### Modified files
- `lib/services/batch-prep-generator.ts` — candidate query + OpenRouter
- `lib/services/batch-prep-persistence.ts` — if usage log changes
- `app/actions/recipe-search.ts` — query own table instead of API
- `app/actions/recipes.ts` — remove API dependency
- `lib/types/recipe.ts` — add `source` to NormalizedRecipe union
- `components/recipes/*` — minor: remove API-specific UI if any
