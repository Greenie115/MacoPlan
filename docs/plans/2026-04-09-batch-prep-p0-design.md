# Batch Prep Mode (P0) — Design Document

**Date:** 2026-04-09
**Status:** Validated, ready for implementation
**Spec source:** `C:\Users\danie\Downloads\macroplan-v2-spec.md`
**Implementation plan:** `docs/plans/2026-04-09-batch-prep-p0.md`

---

## Context

MacroPlan (macroplan.app) currently has AI meal plan generation, macro calculator, recipe database via Recipe-API.com, meal swapping, shopping lists, and freemium pricing. The feature set is undifferentiated from Eat This Much, Prospre, and Kitchendary. This design implements the P0 slice of a positioning pivot to target a specific unmet need:

> **AI-powered batch meal prep planning specifically for people who lift.**

The P0 slice is the minimum that establishes the USP: a batch-aware Claude-generated plan, training day / rest day macro split, and a cooking-order timeline view.

## Scope

### In scope (P0)
- Training day / rest day macro split
- Batch Prep Mode — replaces the existing daily meal plan generator entirely
- Cooking timeline view (`/meal-plans/[id]/prep-day`)
- Landing page copy replacement
- Pricing page feature table update

### Out of scope (deferred to P1+)
- Fridge scanner (Claude Vision)
- Phase cycling (bulk/cut/maintain/recomp)
- Supplement integration
- Recipe ratings / AI learning
- Meal prep cost tracking
- Public share links
- SEO article writing
- Onboarding flow changes (test users only, no new-user acquisition yet)

## Architecture

### Data flow

```
User (logged in)
  ↓
/meal-plans/generate  [rewritten — replaces old Recipe-API.com generator]
  ↓ form submit
Server Action: generateBatchPrepPlan()
  ↓
Anthropic Claude Sonnet 4.6 (structured JSON output)
  ↓
Zod validation + macro accuracy check (±10%)
  ↓ (retry once on macro miss)
Persist to batch_prep_plans table
  ↓ (parallel, non-blocking)
Unsplash image fetch per recipe
  ↓
Redirect → /meal-plans/[id]
```

### Tech additions
- `@anthropic-ai/sdk` npm package
- `ANTHROPIC_API_KEY` env var (already provisioned by user)
- Model: `claude-sonnet-4-6` (Sonnet 4.6 — fastest 4.6-class model, ~3s generation)

### Tech preserved
- **Recipe-API.com** — still used for `/recipes` browse, NOT for meal plan generation
- **Unsplash** — still used for recipe imagery (hero image per generated recipe)
- **Supabase** — all new tables with RLS
- **Existing subscription system** — 3 lifetime plans free, unlimited premium

### Tech deleted
- `lib/services/meal-plan-generator.ts` — the Recipe-API.com-based daily plan generator
- `components/meal-plans/meal-plan-view.tsx`
- `components/meal-plans/swap-meal-modal.tsx`
- `components/meal-plans/meal-placeholder.tsx`

## Database schema

Two new tables added in migration `20260409_batch_prep_mode.sql`. No changes to existing tables.

### `user_training_profile`

One row per user. Stores lifter preferences. Upserted on first successful batch prep generation.

```sql
CREATE TABLE user_training_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  training_days_per_week INT NOT NULL DEFAULT 5
    CHECK (training_days_per_week BETWEEN 0 AND 7),
  training_day_macros JSONB NOT NULL, -- {calories, protein_g, carbs_g, fat_g}
  rest_day_macros JSONB NOT NULL,
  prep_day TEXT NOT NULL DEFAULT 'sunday'
    CHECK (prep_day IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  containers_per_week INT NOT NULL DEFAULT 10
    CHECK (containers_per_week BETWEEN 3 AND 21),
  max_prep_time_mins INT NOT NULL DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_training_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_training_profile" ON user_training_profile
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### `batch_prep_plans`

Generated plans. Parallel to existing `meal_plans` table — the two do not share records.

```sql
CREATE TABLE batch_prep_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_starting DATE NOT NULL,
  training_day_plan JSONB NOT NULL,
  rest_day_plan JSONB NOT NULL,
  prep_timeline JSONB NOT NULL,
  shopping_list JSONB NOT NULL,
  container_assignments JSONB NOT NULL,
  total_containers INT NOT NULL,
  estimated_prep_time_mins INT NOT NULL,
  generation_params JSONB, -- training profile snapshot at gen time
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE batch_prep_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_batch_prep_plans" ON batch_prep_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_batch_prep_plans_user_week
  ON batch_prep_plans(user_id, week_starting DESC);
```

### `anthropic_usage_log` (observability)

Cost visibility — not a gate.

```sql
CREATE TABLE anthropic_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL, -- e.g. 'batch_prep_generate'
  model TEXT NOT NULL,
  input_tokens INT NOT NULL,
  output_tokens INT NOT NULL,
  status TEXT NOT NULL, -- 'success' | 'validation_fail' | 'retry' | 'error'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE anthropic_usage_log ENABLE ROW LEVEL SECURITY;
-- No read policy for users — admin only via service role
```

## Claude API integration

### Service layer: `lib/services/anthropic.ts`

Lazy singleton pattern matching existing `recipeApiService` / `unsplashService`. Constructor does not throw at module evaluation — env var checked on first use.

```typescript
import Anthropic from '@anthropic-ai/sdk'

export class AnthropicService {
  private _client: Anthropic | null = null

  private get client(): Anthropic {
    if (!this._client) {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is required')
      this._client = new Anthropic({ apiKey })
    }
    return this._client
  }

  async generate(params: Anthropic.MessageCreateParams): Promise<Anthropic.Message> {
    return this.client.messages.create(params)
  }
}

export const anthropicService = new AnthropicService()
```

### Generator: `lib/services/batch-prep-generator.ts`

Orchestrates the full generation flow: build prompt → call Claude → parse JSON → validate → retry on macro miss → persist.

```typescript
export async function generateBatchPrepPlan(
  userId: string,
  profile: TrainingProfile,
  dietaryPrefs: DietaryPreferences
): Promise<BatchPrepPlan> {
  const response = await anthropicService.generate({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: BATCH_PREP_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(profile, dietaryPrefs) }],
  })

  await logUsage(userId, 'batch_prep_generate', response.usage, 'success')

  const json = extractJsonBlock(textContent(response))
  const validated = BatchPrepPlanSchema.parse(json)

  const accuracyCheck = checkMacroAccuracy(validated, profile)
  if (!accuracyCheck.passed) {
    // Retry once with correction
    return retryWithCorrection(userId, profile, dietaryPrefs, validated, accuracyCheck)
  }

  return await persistBatchPrepPlan(userId, validated, profile)
}
```

### System prompt

```
You are a meal prep planning engine for bodybuilders and strength athletes.
You generate BATCH COOKING plans, not daily meal plans.

HARD RULES:
1. Output MUST be valid JSON matching the schema below — no prose, no markdown fences.
2. Generate 3–4 distinct recipes total. Each recipe is cooked ONCE and portioned into
   multiple containers across the week.
3. Every ingredient MUST have a gram weight. Never "1 cup", "a handful", "to taste".
4. Recipes must be batch-cookable: refrigeratable for 5 days minimum, bulk-scalable.
5. Maximise ingredient overlap between recipes (e.g. chicken thighs in 2 recipes,
   rice in 3 recipes) to shrink the shopping list and reduce waste.
6. Cooking instructions MUST be in PREP ORDER (what goes in the oven first, what can
   cook in parallel), NOT meal order. Group by equipment: oven → rice_cooker → stovetop → none.
7. Assign each recipe.equipment as one of: "oven" | "rice_cooker" | "stovetop" | "none".
8. Training day macros and rest day macros MUST each be within 5% of the targets provided.
9. Spread protein 30–50g per meal; never concentrate 100g+ in a single sitting.
10. Respect dietary exclusions absolutely — no prohibited ingredients anywhere.

OUTPUT SCHEMA: { ... complete schema ... }
```

### Validation

Zod schema enforces structural correctness. `checkMacroAccuracy()` enforces totals within 10% of targets (retry tolerance is 10% on first check, strict 5% never enforced to avoid infinite retry).

### Error handling

| Error | Handling |
|---|---|
| Zod validation fail | Throw `BatchPrepValidationError` → server action returns generic `{ error }` |
| Macro accuracy fail | Retry once with correction prompt; if still off, return with warning banner |
| Anthropic rate limit | Generic error, do NOT charge user's free-tier quota |
| Network / 5xx | Generic error, do NOT charge quota |
| Prompt injection via dietary exclusions | User-provided strings are JSON-stringified, not concatenated raw |

### Cost estimate

~$0.02–0.04 per plan generation at Sonnet 4.6 pricing (3k input tokens, 3–5k output tokens).

## Frontend

### New routes
- `/meal-plans/generate` — **rewritten** as the batch prep generator form
- `/meal-plans/[id]` — **updated** to render batch prep plan view (with fallback for legacy plans)
- `/meal-plans/[id]/prep-day` — **new** cooking timeline view

### Training profile collection

No separate settings page. Inline on the generator page with smart defaults:
- `training_days_per_week` defaults to 5
- `prep_day` defaults to Sunday
- `containers_per_week` defaults to 10
- `max_prep_time_mins` defaults to 120
- **Training day macros** = user's existing daily macros from `user_profiles`
- **Rest day macros** = training day minus 20% carbs, protein/fat unchanged

On successful generation, upsert to `user_training_profile` so next visit is pre-filled. First generation IS the setup — no separate onboarding step.

### Components added (all in `components/batch-prep/`)
- `generator-form.tsx` — training profile + generate button (client component, React Hook Form + Zod)
- `plan-view.tsx` — training / rest day toggle + container grid + meal card list
- `meal-card.tsx` — single-recipe card (macros, ingredients, servings, storage days)
- `prep-timeline.tsx` — timeline with checkboxes (local state in localStorage, ephemeral)
- `shopping-list-panel.tsx` — consolidated list with checkbox UX

### Components deleted (from old daily plan flow)
- `components/meal-plans/meal-plan-view.tsx`
- `components/meal-plans/swap-meal-modal.tsx`
- `components/meal-plans/meal-placeholder.tsx`

### Page layout — `/meal-plans/[id]`

```
  Training Day | Rest Day    [toggle]
  ──────────────────────────────────
  Containers: ▓▓▓▓▓▓▓▓▓▓ (10)

  [ Meal Card: Chicken & Rice Bowl ]
    Servings: 5 | Storage: 5 days | 650 cal 45P 65C 15F

  [ Meal Card: Ground Beef & Sweet Potato ]
    Servings: 5 | Storage: 5 days | 720 cal 50P 55C 22F

  [ View Shopping List → ]   [ Start Prep Day → /prep-day ]
```

### Meal plan discriminator

`/meal-plans/[id]` uses a discriminator: if the ID exists in `batch_prep_plans`, render the new view. If it only exists in the legacy `meal_plans` table (pre-v2 plans from test users), render a stub "Legacy plan — generate a new batch prep plan to see the new UI" with a link to `/meal-plans/generate`. Legacy plans are not deleted but are no longer the focus.

## Landing page changes

All changes in `app/page.tsx` and `components/landing/`:

### Hero (replace)
- Headline: **"Your meal prep, planned."**
- Subheadline: "AI-generated batch cooking plans that hit your exact macros. Tell us your prep day, your macros, and how many containers to fill — done in 3 seconds."
- CTA: "Start your first prep — free"

### "How it works" (replace the 3 steps)
1. **Set your macros + training days** — Training 5x/week? We calculate your training day and rest day targets automatically.
2. **Generate your prep plan** — AI builds a batch-cook plan optimised for cooking once, eating all week. 3–4 recipes, one shopping list, one prep session.
3. **Cook, container, crush it** — Follow the step-by-step cooking timeline. Fill your containers. Hit your macros every day without thinking.

### New differentiator section
**"Built for people who actually meal prep"**
- Batch-optimised recipes — Every meal designed for bulk cooking and 5-day refrigeration
- Cooking timeline — Oven first, rice cooker second, stovetop third. We tell you what to do and when.
- Training day / rest day macros — Different targets for different days, automatically
- Fridge-aware replanning — *Coming soon* (teases P1)

## Pricing

Updated feature comparison table (`app/pricing/page.tsx`):

| | Free | Premium ($9.99/mo) |
|---|---|---|
| Batch prep plans | 3 lifetime | Unlimited |
| Training / rest day split | ✗ | ✓ |
| Cooking timeline | ✗ | ✓ |
| Shopping list | ✓ | ✓ |
| PDF export | ✓ | ✓ |

**Feature gating implementation:** New function `canGenerateBatchPrepPlan(userId)` in `app/actions/subscription.ts`. Free tier check counts rows in `batch_prep_plans` (lifetime count, same semantics as existing daily plan limit). Premium tier = unlimited.

## Testing strategy

Following TDD discipline — test first, minimal implementation, refactor.

### Unit tests (`__tests__/batch-prep/`)
- `anthropic-service.test.ts` — mocked SDK, verify env var check + lazy init
- `batch-prep-generator.test.ts` — fixture-driven: valid JSON → success, invalid JSON → throw, off-by-macros → retry
- `macro-accuracy.test.ts` — tolerance math edge cases
- `prompts.test.ts` — verify user prompt includes dietary exclusions, macros, profile
- `types.test.ts` — Zod schema edge cases

### Component tests
- `generator-form.test.tsx` — smart default calculation, form validation errors, submit happy path
- `prep-timeline.test.tsx` — checkbox state + localStorage persistence on reload

### Integration test
- `batch-prep-flow.test.ts` — mocked Anthropic, full pipeline: submit form → DB row → redirect → page render

### Manual verification checklist
1. Generate with valid profile → plan renders correctly
2. Generate with macros that Claude misses first try → retry succeeds, no visible retry to user
3. Generate on free tier at quota limit → blocked with upgrade CTA
4. Generate on premium → unlimited
5. Open a legacy `meal_plans` row → fallback view renders
6. Prep timeline checkboxes persist across page reload
7. Shopping list consolidated quantities are accurate
8. Training day / rest day toggle shows different meals
9. Landing page hero matches new copy
10. Pricing page shows updated feature table

## Non-goals and deferred decisions

- **No E2E tests for P0** — Playwright setup exists but not worth maintenance cost for MVP.
- **No USDA/Edamam nutrition lookup** — trust Claude's output for P0; revisit if accuracy complaints surface.
- **No fridge scanner** — deferred to P1.
- **No phase cycling** — deferred to P1.
- **No supplement integration** — deferred to P1.
- **No recipe ratings** — deferred to P2.
- **No public share links** — deferred to P2.
- **No SEO article writing** — separate copywriting workstream, not code.
- **No onboarding changes** — test users only, defer until acquisition restart.
