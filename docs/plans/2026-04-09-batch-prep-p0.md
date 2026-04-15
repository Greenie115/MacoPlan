# Batch Prep Mode (P0) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship the P0 slice of MacroPlan v2 — replace the existing daily meal plan generator with a Claude Sonnet 4.6-powered batch meal prep generator, including training/rest day macro split, cooking timeline view, and updated landing page copy.

**Architecture:** Claude Sonnet 4.6 generates batch-cookable meal plans as structured JSON (validated with Zod), persisted to new Supabase tables. Existing Recipe-API.com and Unsplash services are preserved but only used for `/recipes` browse and per-recipe imagery respectively. Old `meal-plan-generator.ts` service and associated components are deleted.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Supabase (RLS), `@anthropic-ai/sdk`, React Hook Form + Zod, Vitest, Tailwind CSS.

**Design doc:** `docs/plans/2026-04-09-batch-prep-p0-design.md`
**Spec source:** `C:\Users\danie\Downloads\macroplan-v2-spec.md`

**Conventions:**
- Every file path is absolute-from-repo-root unless stated otherwise
- Every task ends with a commit
- Run `npx vitest run <path>` to run a single test file; `npx tsc --noEmit` for type check
- If a step says "expected: FAIL with X" and it passes instead, STOP and debug — the test isn't actually testing what you think
- Working directory: `C:\Users\danie\Documents\01 Projects\MacoPlan\maco-plan`

---

## Phase 0: Environment setup

### Task 0.1: Install @anthropic-ai/sdk

**Files:**
- Modify: `package.json`

**Step 1: Install the package**

```bash
npm install @anthropic-ai/sdk
```

**Step 2: Verify install**

```bash
grep '@anthropic-ai/sdk' package.json
```
Expected: `"@anthropic-ai/sdk": "^0.x.x"` line appears in dependencies.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @anthropic-ai/sdk for batch prep generation"
```

---

### Task 0.2: Add ANTHROPIC_API_KEY to test env and docs

**Files:**
- Modify: `vitest.setup.ts`
- Modify: `CLAUDE.md`

**Step 1: Add env var to vitest setup (line ~end of existing env stubs)**

Read `vitest.setup.ts` and add after the existing env var setup:

```typescript
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
```

**Step 2: Update CLAUDE.md "Required for recipes/meal plans" block**

Change the existing block to:

```markdown
Required for recipes/meal plans:
```
RECIPE_API_KEY=your-recipe-api-key          # From recipe-api.com (still used for /recipes browse)
UNSPLASH_ACCESS_KEY=your-unsplash-key       # From unsplash.com/developers
ANTHROPIC_API_KEY=sk-ant-...                # From console.anthropic.com (batch prep generation)
```
```

**Step 3: Commit**

```bash
git add vitest.setup.ts CLAUDE.md
git commit -m "chore: add ANTHROPIC_API_KEY to test env and docs"
```

---

## Phase 1: Types and validation schemas

### Task 1.1: Create batch-prep types file with Zod schemas

**Files:**
- Create: `lib/types/batch-prep.ts`
- Test: `__tests__/batch-prep/types.test.ts`

**Step 1: Write the failing test**

Create `__tests__/batch-prep/types.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  BatchPrepPlanSchema,
  MacrosSchema,
  MealSchema,
  PrepStepSchema,
  TrainingProfileSchema,
} from '@/lib/types/batch-prep'

describe('batch-prep types', () => {
  describe('MacrosSchema', () => {
    it('accepts valid macros', () => {
      const result = MacrosSchema.parse({ calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 })
      expect(result.calories).toBe(2600)
    })

    it('rejects negative values', () => {
      expect(() => MacrosSchema.parse({ calories: -100, protein_g: 200, carbs_g: 280, fat_g: 70 })).toThrow()
    })
  })

  describe('PrepStepSchema', () => {
    it('accepts valid equipment', () => {
      const result = PrepStepSchema.parse({
        step: 1,
        time: '0:00',
        action: 'Preheat oven to 200°C',
        duration_mins: 5,
        equipment: 'oven',
      })
      expect(result.equipment).toBe('oven')
    })

    it('rejects invalid equipment', () => {
      expect(() =>
        PrepStepSchema.parse({
          step: 1,
          time: '0:00',
          action: 'Do a thing',
          duration_mins: 5,
          equipment: 'microwave',
        })
      ).toThrow()
    })
  })

  describe('BatchPrepPlanSchema', () => {
    it('requires 2-5 meals per day', () => {
      const planWithOneMeal = {
        training_day: {
          meals: [{ name: 'x', meal_slot: 'breakfast', ingredients: [{ name: 'chicken', quantity_g: 200, macros: { calories: 330, protein_g: 62, carbs_g: 0, fat_g: 7 } }], total_macros: { calories: 330, protein_g: 62, carbs_g: 0, fat_g: 7 }, equipment: 'oven', servings_to_prep: 5, storage_days: 5 }],
          daily_totals: { calories: 330, protein_g: 62, carbs_g: 0, fat_g: 7 },
        },
        rest_day: { meals: [], daily_totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 } },
        prep_timeline: [],
        shopping_list: [],
        container_assignments: [],
        total_containers: 10,
        estimated_prep_time_mins: 90,
      }
      expect(() => BatchPrepPlanSchema.parse(planWithOneMeal)).toThrow()
    })
  })

  describe('TrainingProfileSchema', () => {
    it('accepts valid profile', () => {
      const result = TrainingProfileSchema.parse({
        training_days_per_week: 5,
        training_day_macros: { calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 },
        rest_day_macros: { calories: 2300, protein_g: 200, carbs_g: 200, fat_g: 70 },
        prep_day: 'sunday',
        containers_per_week: 10,
        max_prep_time_mins: 120,
      })
      expect(result.prep_day).toBe('sunday')
    })

    it('rejects training_days_per_week > 7', () => {
      expect(() =>
        TrainingProfileSchema.parse({
          training_days_per_week: 8,
          training_day_macros: { calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 },
          rest_day_macros: { calories: 2300, protein_g: 200, carbs_g: 200, fat_g: 70 },
          prep_day: 'sunday',
          containers_per_week: 10,
          max_prep_time_mins: 120,
        })
      ).toThrow()
    })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/batch-prep/types.test.ts
```
Expected: FAIL — module `@/lib/types/batch-prep` does not exist.

**Step 3: Write the type file**

Create `lib/types/batch-prep.ts`:

```typescript
import { z } from 'zod'

export const MacrosSchema = z.object({
  calories: z.number().nonnegative(),
  protein_g: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fat_g: z.number().nonnegative(),
})
export type Macros = z.infer<typeof MacrosSchema>

export const EquipmentSchema = z.enum(['oven', 'rice_cooker', 'stovetop', 'none'])
export type Equipment = z.infer<typeof EquipmentSchema>

export const MealSlotSchema = z.enum(['breakfast', 'lunch', 'snack', 'dinner'])
export type MealSlot = z.infer<typeof MealSlotSchema>

export const IngredientSchema = z.object({
  name: z.string().min(1),
  quantity_g: z.number().positive(),
  macros: MacrosSchema,
})
export type Ingredient = z.infer<typeof IngredientSchema>

export const MealSchema = z.object({
  name: z.string().min(1),
  meal_slot: MealSlotSchema,
  ingredients: z.array(IngredientSchema).min(1),
  total_macros: MacrosSchema,
  equipment: EquipmentSchema,
  servings_to_prep: z.number().int().positive(),
  storage_days: z.number().int().positive().max(7),
  prep_time_mins: z.number().int().nonnegative().optional(),
})
export type Meal = z.infer<typeof MealSchema>

export const PrepStepSchema = z.object({
  step: z.number().int().positive(),
  time: z.string().regex(/^\d+:\d{2}$/),
  action: z.string().min(1),
  duration_mins: z.number().int().nonnegative(),
  equipment: EquipmentSchema,
})
export type PrepStep = z.infer<typeof PrepStepSchema>

export const ShoppingItemSchema = z.object({
  ingredient: z.string().min(1),
  quantity_g: z.number().positive(),
  category: z.string().optional(),
})
export type ShoppingItem = z.infer<typeof ShoppingItemSchema>

export const ContainerAssignmentSchema = z.object({
  container_num: z.number().int().positive(),
  day_type: z.enum(['training', 'rest']),
  meal_slot: MealSlotSchema,
  recipe_name: z.string().min(1),
})
export type ContainerAssignment = z.infer<typeof ContainerAssignmentSchema>

export const DayPlanSchema = z.object({
  meals: z.array(MealSchema).min(2).max(5),
  daily_totals: MacrosSchema,
})
export type DayPlan = z.infer<typeof DayPlanSchema>

export const BatchPrepPlanSchema = z.object({
  training_day: DayPlanSchema,
  rest_day: DayPlanSchema,
  prep_timeline: z.array(PrepStepSchema).min(3),
  shopping_list: z.array(ShoppingItemSchema).min(3),
  container_assignments: z.array(ContainerAssignmentSchema),
  total_containers: z.number().int().positive(),
  estimated_prep_time_mins: z.number().int().positive(),
})
export type BatchPrepPlan = z.infer<typeof BatchPrepPlanSchema>

export const PrepDaySchema = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
])
export type PrepDay = z.infer<typeof PrepDaySchema>

export const TrainingProfileSchema = z.object({
  training_days_per_week: z.number().int().min(0).max(7),
  training_day_macros: MacrosSchema,
  rest_day_macros: MacrosSchema,
  prep_day: PrepDaySchema,
  containers_per_week: z.number().int().min(3).max(21),
  max_prep_time_mins: z.number().int().positive(),
})
export type TrainingProfile = z.infer<typeof TrainingProfileSchema>

export const DietaryPreferencesSchema = z.object({
  diet_type: z.string().optional(),
  exclusions: z.array(z.string()).default([]),
})
export type DietaryPreferences = z.infer<typeof DietaryPreferencesSchema>

export class BatchPrepValidationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'BatchPrepValidationError'
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/batch-prep/types.test.ts
```
Expected: PASS — all tests green.

**Step 5: Commit**

```bash
git add lib/types/batch-prep.ts __tests__/batch-prep/types.test.ts
git commit -m "feat: add batch-prep types with Zod schemas"
```

---

## Phase 2: Supabase migration

### Task 2.1: Create database migration SQL

**Files:**
- Create: `supabase/migrations/20260409_batch_prep_mode.sql`

**Step 1: Write the migration file**

```sql
-- Batch Prep Mode (P0) migration
-- 2026-04-09

-- ============================================================================
-- Table: user_training_profile
-- ============================================================================

CREATE TABLE user_training_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  training_days_per_week INT NOT NULL DEFAULT 5
    CHECK (training_days_per_week BETWEEN 0 AND 7),
  training_day_macros JSONB NOT NULL,
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
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_training_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_training_profile_updated_at
  BEFORE UPDATE ON user_training_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_user_training_profile_updated_at();

-- ============================================================================
-- Table: batch_prep_plans
-- ============================================================================

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
  generation_params JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE batch_prep_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_batch_prep_plans" ON batch_prep_plans
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_batch_prep_plans_user_week
  ON batch_prep_plans(user_id, week_starting DESC);

-- ============================================================================
-- Table: anthropic_usage_log (observability — no user read policy)
-- ============================================================================

CREATE TABLE anthropic_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INT NOT NULL,
  output_tokens INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'validation_fail', 'retry', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE anthropic_usage_log ENABLE ROW LEVEL SECURITY;
-- No user policy — only service role can read/write

CREATE INDEX idx_anthropic_usage_log_created ON anthropic_usage_log(created_at DESC);
```

**Step 2: Document migration in plan notes (manual run required)**

Note for the executor: this migration must be run manually in the Supabase SQL Editor. There is no local Supabase CLI setup per CLAUDE.md. Do NOT attempt to run it programmatically.

**Step 3: Commit**

```bash
git add supabase/migrations/20260409_batch_prep_mode.sql
git commit -m "feat: add batch prep mode database migration"
```

---

### Task 2.2: Add new table types to database.ts

**Files:**
- Modify: `lib/types/database.ts`

**Step 1: Read current database.ts and find the appropriate location**

```bash
grep -n "export interface" lib/types/database.ts | head -20
```

**Step 2: Add new interfaces at the end of the file**

Append these interfaces (adjust capitalisation style to match existing conventions):

```typescript
export interface UserTrainingProfile {
  id: string
  user_id: string
  training_days_per_week: number
  training_day_macros: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }
  rest_day_macros: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }
  prep_day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  containers_per_week: number
  max_prep_time_mins: number
  created_at: string
  updated_at: string
}

export interface BatchPrepPlanRow {
  id: string
  user_id: string
  week_starting: string
  training_day_plan: unknown // validated via Zod in service layer
  rest_day_plan: unknown
  prep_timeline: unknown
  shopping_list: unknown
  container_assignments: unknown
  total_containers: number
  estimated_prep_time_mins: number
  generation_params: unknown | null
  created_at: string
}

export interface AnthropicUsageLogRow {
  id: string
  user_id: string | null
  endpoint: string
  model: string
  input_tokens: number
  output_tokens: number
  status: 'success' | 'validation_fail' | 'retry' | 'error'
  error_message: string | null
  created_at: string
}
```

**Step 3: Verify type check**

```bash
npx tsc --noEmit
```
Expected: PASS (no errors).

**Step 4: Commit**

```bash
git add lib/types/database.ts
git commit -m "feat: add batch prep DB row types to database.ts"
```

---

## Phase 3: Anthropic service layer

### Task 3.1: Create anthropic service singleton

**Files:**
- Create: `lib/services/anthropic.ts`
- Test: `__tests__/batch-prep/anthropic-service.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('AnthropicService', () => {
  const originalKey = process.env.ANTHROPIC_API_KEY

  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = originalKey
  })

  it('lazy-initialises client only on first use', async () => {
    // Re-import to get fresh module state
    vi.resetModules()
    delete process.env.ANTHROPIC_API_KEY

    const { AnthropicService } = await import('@/lib/services/anthropic')
    const service = new AnthropicService()

    // Constructor does not throw
    expect(service).toBeDefined()

    // First use throws
    process.env.ANTHROPIC_API_KEY = ''
    await expect(
      service.generate({
        model: 'claude-sonnet-4-6',
        max_tokens: 100,
        messages: [{ role: 'user', content: 'hi' }],
      })
    ).rejects.toThrow('ANTHROPIC_API_KEY environment variable is required')
  })

  it('exports a singleton instance', async () => {
    vi.resetModules()
    process.env.ANTHROPIC_API_KEY = 'test-key'
    const { anthropicService } = await import('@/lib/services/anthropic')
    expect(anthropicService).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/batch-prep/anthropic-service.test.ts
```
Expected: FAIL — module not found.

**Step 3: Write minimal implementation**

```typescript
// lib/services/anthropic.ts
import Anthropic from '@anthropic-ai/sdk'

export class AnthropicService {
  private _client: Anthropic | null = null

  private get client(): Anthropic {
    if (!this._client) {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is required')
      }
      this._client = new Anthropic({ apiKey })
    }
    return this._client
  }

  async generate(params: Anthropic.MessageCreateParams): Promise<Anthropic.Message> {
    return this.client.messages.create(params) as Promise<Anthropic.Message>
  }
}

export const anthropicService = new AnthropicService()
```

**Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/batch-prep/anthropic-service.test.ts
```
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/services/anthropic.ts __tests__/batch-prep/anthropic-service.test.ts
git commit -m "feat: add lazy-initialised Anthropic service singleton"
```

---

### Task 3.2: Create batch prep system prompt constant

**Files:**
- Create: `lib/services/batch-prep-prompts.ts`
- Test: `__tests__/batch-prep/prompts.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import { BATCH_PREP_SYSTEM_PROMPT, buildUserPrompt } from '@/lib/services/batch-prep-prompts'
import type { TrainingProfile, DietaryPreferences } from '@/lib/types/batch-prep'

describe('batch-prep prompts', () => {
  describe('BATCH_PREP_SYSTEM_PROMPT', () => {
    it('mentions batch cooking explicitly', () => {
      expect(BATCH_PREP_SYSTEM_PROMPT).toContain('BATCH COOKING')
    })

    it('requires JSON output without markdown', () => {
      expect(BATCH_PREP_SYSTEM_PROMPT).toContain('valid JSON')
      expect(BATCH_PREP_SYSTEM_PROMPT).toContain('no markdown fences')
    })

    it('requires gram weights', () => {
      expect(BATCH_PREP_SYSTEM_PROMPT).toContain('gram weight')
    })

    it('requires equipment ordering', () => {
      expect(BATCH_PREP_SYSTEM_PROMPT.toLowerCase()).toContain('oven')
      expect(BATCH_PREP_SYSTEM_PROMPT.toLowerCase()).toContain('rice_cooker')
    })
  })

  describe('buildUserPrompt', () => {
    const profile: TrainingProfile = {
      training_days_per_week: 5,
      training_day_macros: { calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 },
      rest_day_macros: { calories: 2300, protein_g: 200, carbs_g: 200, fat_g: 70 },
      prep_day: 'sunday',
      containers_per_week: 10,
      max_prep_time_mins: 120,
    }

    it('includes training day macros', () => {
      const prompt = buildUserPrompt(profile, { exclusions: [] })
      expect(prompt).toContain('2600')
      expect(prompt).toContain('200')
    })

    it('includes rest day macros', () => {
      const prompt = buildUserPrompt(profile, { exclusions: [] })
      expect(prompt).toContain('2300')
    })

    it('includes dietary exclusions when present', () => {
      const prompt = buildUserPrompt(profile, { exclusions: ['peanuts', 'shellfish'] })
      expect(prompt).toContain('peanuts')
      expect(prompt).toContain('shellfish')
    })

    it('omits exclusions section when empty', () => {
      const prompt = buildUserPrompt(profile, { exclusions: [] })
      expect(prompt).not.toContain('EXCLUDE')
    })

    it('safely serializes exclusions via JSON', () => {
      const prompt = buildUserPrompt(profile, { exclusions: ['"); DROP TABLE users; --'] })
      // Injection attempt should be JSON-escaped, not interpreted
      expect(prompt).toContain('DROP TABLE')
      expect(prompt).toContain('\\"')
    })
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/batch-prep/prompts.test.ts
```
Expected: FAIL — module not found.

**Step 3: Write the prompts file**

```typescript
// lib/services/batch-prep-prompts.ts
import type { TrainingProfile, DietaryPreferences } from '@/lib/types/batch-prep'

export const BATCH_PREP_SYSTEM_PROMPT = `You are a meal prep planning engine for bodybuilders and strength athletes. You generate BATCH COOKING plans, not daily meal plans.

HARD RULES:
1. Output MUST be valid JSON matching the schema below — no prose, no markdown fences, no code blocks.
2. Generate 3–4 distinct recipes total. Each recipe is cooked ONCE and portioned into multiple containers across the week.
3. Every ingredient MUST have a gram weight. Never use "1 cup", "a handful", or "to taste".
4. Recipes must be batch-cookable: refrigeratable for 5 days minimum, bulk-scalable.
5. Maximise ingredient overlap between recipes (e.g. chicken thighs in 2 recipes, rice in 3 recipes) to shrink the shopping list and reduce waste.
6. Cooking instructions MUST be in PREP ORDER (what goes in the oven first, what can cook in parallel), NOT meal order. Group by equipment priority: oven → rice_cooker → stovetop → none.
7. Assign each meal.equipment as exactly one of: "oven" | "rice_cooker" | "stovetop" | "none".
8. Training day daily_totals and rest day daily_totals MUST each be within 5% of the targets provided in the user prompt.
9. Spread protein 30–50g per meal; never concentrate 100g+ in a single sitting.
10. Respect dietary exclusions absolutely — no prohibited ingredients anywhere.

OUTPUT SCHEMA:
{
  "training_day": {
    "meals": [
      {
        "name": "string",
        "meal_slot": "breakfast|lunch|snack|dinner",
        "ingredients": [
          {"name": "string", "quantity_g": number, "macros": {"calories": number, "protein_g": number, "carbs_g": number, "fat_g": number}}
        ],
        "total_macros": {"calories": number, "protein_g": number, "carbs_g": number, "fat_g": number},
        "equipment": "oven|rice_cooker|stovetop|none",
        "servings_to_prep": number,
        "storage_days": number
      }
    ],
    "daily_totals": {"calories": number, "protein_g": number, "carbs_g": number, "fat_g": number}
  },
  "rest_day": { /* same structure as training_day */ },
  "prep_timeline": [
    {
      "step": number,
      "time": "H:MM",
      "action": "string (imperative, specific)",
      "duration_mins": number,
      "equipment": "oven|rice_cooker|stovetop|none"
    }
  ],
  "shopping_list": [
    {"ingredient": "string", "quantity_g": number, "category": "protein|grain|vegetable|dairy|fat|other"}
  ],
  "container_assignments": [
    {"container_num": number, "day_type": "training|rest", "meal_slot": "breakfast|lunch|snack|dinner", "recipe_name": "string"}
  ],
  "total_containers": number,
  "estimated_prep_time_mins": number
}

Return ONLY the JSON object. No explanation. No markdown.`

export function buildUserPrompt(
  profile: TrainingProfile,
  preferences: DietaryPreferences
): string {
  const td = profile.training_day_macros
  const rd = profile.rest_day_macros
  const restDaysPerWeek = 7 - profile.training_days_per_week

  const exclusionsBlock =
    preferences.exclusions.length > 0
      ? `\nEXCLUDE these ingredients entirely: ${JSON.stringify(preferences.exclusions)}`
      : ''

  const dietBlock = preferences.diet_type
    ? `\nDIET TYPE: ${JSON.stringify(preferences.diet_type)}`
    : ''

  return `Generate a batch meal prep plan for this lifter:

MACROS:
- Training days (${profile.training_days_per_week}x/week): ${td.calories} cal | ${td.protein_g}g P | ${td.carbs_g}g C | ${td.fat_g}g F
- Rest days (${restDaysPerWeek}x/week): ${rd.calories} cal | ${rd.protein_g}g P | ${rd.carbs_g}g C | ${rd.fat_g}g F

PREFERENCES:
- Prep day: ${profile.prep_day}
- Containers to fill: ${profile.containers_per_week}
- Max prep session length: ${profile.max_prep_time_mins} minutes${dietBlock}${exclusionsBlock}

Return the plan as a JSON object matching the schema in your instructions. No markdown, no prose.`
}
```

**Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/batch-prep/prompts.test.ts
```
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/services/batch-prep-prompts.ts __tests__/batch-prep/prompts.test.ts
git commit -m "feat: add batch prep system prompt and user prompt builder"
```

---

### Task 3.3: Create macro accuracy checker

**Files:**
- Create: `lib/services/batch-prep-accuracy.ts`
- Test: `__tests__/batch-prep/macro-accuracy.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import { checkMacroAccuracy } from '@/lib/services/batch-prep-accuracy'
import type { BatchPrepPlan, TrainingProfile } from '@/lib/types/batch-prep'

const baseProfile: TrainingProfile = {
  training_days_per_week: 5,
  training_day_macros: { calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 },
  rest_day_macros: { calories: 2300, protein_g: 200, carbs_g: 200, fat_g: 70 },
  prep_day: 'sunday',
  containers_per_week: 10,
  max_prep_time_mins: 120,
}

function makePlan(trainingTotals: any, restTotals: any): BatchPrepPlan {
  return {
    training_day: { meals: [] as any, daily_totals: trainingTotals },
    rest_day: { meals: [] as any, daily_totals: restTotals },
    prep_timeline: [],
    shopping_list: [],
    container_assignments: [],
    total_containers: 10,
    estimated_prep_time_mins: 90,
  } as BatchPrepPlan
}

describe('checkMacroAccuracy', () => {
  it('passes when totals are within 10% of targets', () => {
    const plan = makePlan(
      { calories: 2650, protein_g: 205, carbs_g: 275, fat_g: 68 },
      { calories: 2310, protein_g: 198, carbs_g: 202, fat_g: 71 }
    )
    const result = checkMacroAccuracy(plan, baseProfile)
    expect(result.passed).toBe(true)
    expect(result.deviations.training_day.calories).toBeLessThan(0.1)
  })

  it('fails when calories are off by more than 10%', () => {
    const plan = makePlan(
      { calories: 3200, protein_g: 200, carbs_g: 280, fat_g: 70 }, // 23% over
      { calories: 2300, protein_g: 200, carbs_g: 200, fat_g: 70 }
    )
    const result = checkMacroAccuracy(plan, baseProfile)
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('training_day')
  })

  it('fails when protein is off by more than 10%', () => {
    const plan = makePlan(
      { calories: 2600, protein_g: 150, carbs_g: 280, fat_g: 70 }, // 25% under protein
      { calories: 2300, protein_g: 200, carbs_g: 200, fat_g: 70 }
    )
    const result = checkMacroAccuracy(plan, baseProfile)
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('protein')
  })

  it('fails when rest day is off', () => {
    const plan = makePlan(
      { calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 },
      { calories: 1500, protein_g: 200, carbs_g: 200, fat_g: 70 } // 35% under calories
    )
    const result = checkMacroAccuracy(plan, baseProfile)
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('rest_day')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/batch-prep/macro-accuracy.test.ts
```
Expected: FAIL — module not found.

**Step 3: Write implementation**

```typescript
// lib/services/batch-prep-accuracy.ts
import type { BatchPrepPlan, TrainingProfile, Macros } from '@/lib/types/batch-prep'

const TOLERANCE = 0.1 // 10%
const MACRO_KEYS: (keyof Macros)[] = ['calories', 'protein_g', 'carbs_g', 'fat_g']

export interface AccuracyResult {
  passed: boolean
  reason?: string
  deviations: {
    training_day: Record<keyof Macros, number>
    rest_day: Record<keyof Macros, number>
  }
}

function deviation(actual: number, target: number): number {
  if (target === 0) return actual === 0 ? 0 : 1
  return Math.abs(actual - target) / target
}

function computeDeviations(actual: Macros, target: Macros): Record<keyof Macros, number> {
  return {
    calories: deviation(actual.calories, target.calories),
    protein_g: deviation(actual.protein_g, target.protein_g),
    carbs_g: deviation(actual.carbs_g, target.carbs_g),
    fat_g: deviation(actual.fat_g, target.fat_g),
  }
}

export function checkMacroAccuracy(
  plan: BatchPrepPlan,
  profile: TrainingProfile
): AccuracyResult {
  const trainingDeviations = computeDeviations(
    plan.training_day.daily_totals,
    profile.training_day_macros
  )
  const restDeviations = computeDeviations(
    plan.rest_day.daily_totals,
    profile.rest_day_macros
  )

  const failures: string[] = []

  for (const key of MACRO_KEYS) {
    if (trainingDeviations[key] > TOLERANCE) {
      failures.push(
        `training_day.${key} off by ${(trainingDeviations[key] * 100).toFixed(1)}%`
      )
    }
    if (restDeviations[key] > TOLERANCE) {
      failures.push(
        `rest_day.${key} off by ${(restDeviations[key] * 100).toFixed(1)}%`
      )
    }
  }

  return {
    passed: failures.length === 0,
    reason: failures.length > 0 ? failures.join('; ') : undefined,
    deviations: { training_day: trainingDeviations, rest_day: restDeviations },
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/batch-prep/macro-accuracy.test.ts
```
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/services/batch-prep-accuracy.ts __tests__/batch-prep/macro-accuracy.test.ts
git commit -m "feat: add macro accuracy checker with 10% tolerance"
```

---

### Task 3.4: Create batch prep generator (happy path)

**Files:**
- Create: `lib/services/batch-prep-generator.ts`
- Test: `__tests__/batch-prep/batch-prep-generator.test.ts`
- Create: `__tests__/batch-prep/fixtures/valid-plan.json`

**Step 1: Create fixture — valid plan JSON**

Create `__tests__/batch-prep/fixtures/valid-plan.json`:

```json
{
  "training_day": {
    "meals": [
      {
        "name": "Chicken & Rice Bowl",
        "meal_slot": "lunch",
        "ingredients": [
          { "name": "chicken thigh", "quantity_g": 200, "macros": { "calories": 440, "protein_g": 52, "carbs_g": 0, "fat_g": 25 } },
          { "name": "white rice", "quantity_g": 150, "macros": { "calories": 195, "protein_g": 4, "carbs_g": 42, "fat_g": 0 } }
        ],
        "total_macros": { "calories": 635, "protein_g": 56, "carbs_g": 42, "fat_g": 25 },
        "equipment": "oven",
        "servings_to_prep": 5,
        "storage_days": 5
      },
      {
        "name": "Ground Beef & Sweet Potato",
        "meal_slot": "dinner",
        "ingredients": [
          { "name": "lean ground beef", "quantity_g": 250, "macros": { "calories": 500, "protein_g": 65, "carbs_g": 0, "fat_g": 25 } },
          { "name": "sweet potato", "quantity_g": 300, "macros": { "calories": 260, "protein_g": 4, "carbs_g": 60, "fat_g": 0 } }
        ],
        "total_macros": { "calories": 760, "protein_g": 69, "carbs_g": 60, "fat_g": 25 },
        "equipment": "stovetop",
        "servings_to_prep": 5,
        "storage_days": 5
      }
    ],
    "daily_totals": { "calories": 2600, "protein_g": 200, "carbs_g": 280, "fat_g": 70 }
  },
  "rest_day": {
    "meals": [
      {
        "name": "Chicken & Rice Bowl (smaller)",
        "meal_slot": "lunch",
        "ingredients": [
          { "name": "chicken thigh", "quantity_g": 180, "macros": { "calories": 396, "protein_g": 47, "carbs_g": 0, "fat_g": 22 } }
        ],
        "total_macros": { "calories": 396, "protein_g": 47, "carbs_g": 0, "fat_g": 22 },
        "equipment": "oven",
        "servings_to_prep": 2,
        "storage_days": 5
      },
      {
        "name": "Ground Beef & Sweet Potato (smaller)",
        "meal_slot": "dinner",
        "ingredients": [
          { "name": "lean ground beef", "quantity_g": 200, "macros": { "calories": 400, "protein_g": 52, "carbs_g": 0, "fat_g": 20 } }
        ],
        "total_macros": { "calories": 400, "protein_g": 52, "carbs_g": 0, "fat_g": 20 },
        "equipment": "stovetop",
        "servings_to_prep": 2,
        "storage_days": 5
      }
    ],
    "daily_totals": { "calories": 2300, "protein_g": 200, "carbs_g": 200, "fat_g": 70 }
  },
  "prep_timeline": [
    { "step": 1, "time": "0:00", "action": "Preheat oven to 200°C. Season 2kg chicken thighs.", "duration_mins": 5, "equipment": "oven" },
    { "step": 2, "time": "0:05", "action": "Put rice cooker on with 1.5kg rice + 2.25L water.", "duration_mins": 0, "equipment": "rice_cooker" },
    { "step": 3, "time": "0:10", "action": "Brown 2.5kg ground beef on stovetop.", "duration_mins": 20, "equipment": "stovetop" }
  ],
  "shopping_list": [
    { "ingredient": "chicken thigh", "quantity_g": 2000, "category": "protein" },
    { "ingredient": "white rice", "quantity_g": 1500, "category": "grain" },
    { "ingredient": "lean ground beef", "quantity_g": 2500, "category": "protein" },
    { "ingredient": "sweet potato", "quantity_g": 3000, "category": "vegetable" }
  ],
  "container_assignments": [
    { "container_num": 1, "day_type": "training", "meal_slot": "lunch", "recipe_name": "Chicken & Rice Bowl" },
    { "container_num": 2, "day_type": "training", "meal_slot": "dinner", "recipe_name": "Ground Beef & Sweet Potato" }
  ],
  "total_containers": 10,
  "estimated_prep_time_mins": 90
}
```

**Step 2: Write the failing test**

```typescript
// __tests__/batch-prep/batch-prep-generator.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { TrainingProfile, DietaryPreferences } from '@/lib/types/batch-prep'
import validPlanFixture from './fixtures/valid-plan.json'

// Mock the anthropic service BEFORE importing the generator
vi.mock('@/lib/services/anthropic', () => ({
  anthropicService: {
    generate: vi.fn(),
  },
}))

// Mock usage log (no-op)
vi.mock('@/lib/services/anthropic-usage-log', () => ({
  logUsage: vi.fn().mockResolvedValue(undefined),
}))

import { anthropicService } from '@/lib/services/anthropic'
import { generateBatchPrepPlan } from '@/lib/services/batch-prep-generator'

const profile: TrainingProfile = {
  training_days_per_week: 5,
  training_day_macros: { calories: 2600, protein_g: 200, carbs_g: 280, fat_g: 70 },
  rest_day_macros: { calories: 2300, protein_g: 200, carbs_g: 200, fat_g: 70 },
  prep_day: 'sunday',
  containers_per_week: 10,
  max_prep_time_mins: 120,
}

const prefs: DietaryPreferences = { exclusions: [] }

function mockClaudeResponse(jsonString: string) {
  ;(anthropicService.generate as any).mockResolvedValue({
    content: [{ type: 'text', text: jsonString }],
    usage: { input_tokens: 1500, output_tokens: 3000 },
  })
}

describe('generateBatchPrepPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns validated plan when Claude returns valid JSON with accurate macros', async () => {
    mockClaudeResponse(JSON.stringify(validPlanFixture))
    const plan = await generateBatchPrepPlan(profile, prefs)
    expect(plan.total_containers).toBe(10)
    expect(plan.training_day.meals).toHaveLength(2)
  })

  it('strips markdown code fences if Claude wraps the JSON', async () => {
    mockClaudeResponse('```json\n' + JSON.stringify(validPlanFixture) + '\n```')
    const plan = await generateBatchPrepPlan(profile, prefs)
    expect(plan.total_containers).toBe(10)
  })

  it('throws BatchPrepValidationError on malformed JSON', async () => {
    mockClaudeResponse('not valid json at all')
    await expect(generateBatchPrepPlan(profile, prefs)).rejects.toThrow()
  })

  it('throws BatchPrepValidationError on schema mismatch', async () => {
    mockClaudeResponse(JSON.stringify({ training_day: 'wrong shape' }))
    await expect(generateBatchPrepPlan(profile, prefs)).rejects.toThrow()
  })
})
```

**Step 3: Run test to verify it fails**

```bash
npx vitest run __tests__/batch-prep/batch-prep-generator.test.ts
```
Expected: FAIL — module not found.

**Step 4: Write the generator (no retry logic yet — retry in next task)**

```typescript
// lib/services/batch-prep-generator.ts
import { anthropicService } from './anthropic'
import { BATCH_PREP_SYSTEM_PROMPT, buildUserPrompt } from './batch-prep-prompts'
import { checkMacroAccuracy } from './batch-prep-accuracy'
import {
  BatchPrepPlanSchema,
  BatchPrepValidationError,
  type BatchPrepPlan,
  type TrainingProfile,
  type DietaryPreferences,
} from '@/lib/types/batch-prep'

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 8000

function extractTextContent(response: { content: Array<{ type: string; text?: string }> }): string {
  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock?.text) {
    throw new BatchPrepValidationError('No text content in Claude response')
  }
  return textBlock.text
}

function extractJsonBlock(text: string): unknown {
  // Strip markdown code fences if present
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch (err) {
    throw new BatchPrepValidationError(
      `Failed to parse JSON from Claude response: ${(err as Error).message}`,
      err
    )
  }
}

export async function generateBatchPrepPlan(
  profile: TrainingProfile,
  preferences: DietaryPreferences
): Promise<BatchPrepPlan> {
  const response = await anthropicService.generate({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: BATCH_PREP_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(profile, preferences) }],
  })

  const text = extractTextContent(response as any)
  const json = extractJsonBlock(text)

  let validated: BatchPrepPlan
  try {
    validated = BatchPrepPlanSchema.parse(json)
  } catch (err) {
    throw new BatchPrepValidationError(
      `Claude response failed Zod validation: ${(err as Error).message}`,
      err
    )
  }

  // Note: macro accuracy check + retry handled in follow-up task
  const accuracy = checkMacroAccuracy(validated, profile)
  if (!accuracy.passed) {
    throw new BatchPrepValidationError(
      `Macro accuracy check failed: ${accuracy.reason}`
    )
  }

  return validated
}
```

**Step 5: Run test to verify it passes**

```bash
npx vitest run __tests__/batch-prep/batch-prep-generator.test.ts
```
Expected: PASS on 4 tests.

**Step 6: Commit**

```bash
git add lib/services/batch-prep-generator.ts __tests__/batch-prep/batch-prep-generator.test.ts __tests__/batch-prep/fixtures/valid-plan.json
git commit -m "feat: add batch prep generator happy path with Zod validation"
```

---

### Task 3.5: Add retry-on-macro-miss logic

**Files:**
- Modify: `lib/services/batch-prep-generator.ts`
- Modify: `__tests__/batch-prep/batch-prep-generator.test.ts`

**Step 1: Write the failing retry test**

Append to `__tests__/batch-prep/batch-prep-generator.test.ts`:

```typescript
describe('generateBatchPrepPlan retry behaviour', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retries once when macros are off, succeeds on retry', async () => {
    // First call: calories way off (3200 vs 2600 target = 23%)
    const offPlan = {
      ...validPlanFixture,
      training_day: {
        ...validPlanFixture.training_day,
        daily_totals: { calories: 3200, protein_g: 200, carbs_g: 280, fat_g: 70 },
      },
    }

    ;(anthropicService.generate as any)
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(offPlan) }],
        usage: { input_tokens: 1500, output_tokens: 3000 },
      })
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(validPlanFixture) }],
        usage: { input_tokens: 1700, output_tokens: 3000 },
      })

    const plan = await generateBatchPrepPlan(profile, prefs)
    expect(plan.training_day.daily_totals.calories).toBe(2600)
    expect(anthropicService.generate).toHaveBeenCalledTimes(2)
  })

  it('throws after retry still fails', async () => {
    const offPlan = {
      ...validPlanFixture,
      training_day: {
        ...validPlanFixture.training_day,
        daily_totals: { calories: 3200, protein_g: 200, carbs_g: 280, fat_g: 70 },
      },
    }

    ;(anthropicService.generate as any)
      .mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(offPlan) }],
        usage: { input_tokens: 1500, output_tokens: 3000 },
      })

    await expect(generateBatchPrepPlan(profile, prefs)).rejects.toThrow('Macro accuracy')
    expect(anthropicService.generate).toHaveBeenCalledTimes(2)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/batch-prep/batch-prep-generator.test.ts -t "retry"
```
Expected: FAIL — the throw test currently only calls generate once.

**Step 3: Refactor generator to add retry**

Replace the body of `generateBatchPrepPlan` in `lib/services/batch-prep-generator.ts`:

```typescript
export async function generateBatchPrepPlan(
  profile: TrainingProfile,
  preferences: DietaryPreferences
): Promise<BatchPrepPlan> {
  // First attempt
  const firstAttempt = await callAndValidate(profile, preferences, null)
  if (firstAttempt.accuracy.passed) {
    return firstAttempt.plan
  }

  // Retry once with correction
  const retryAttempt = await callAndValidate(
    profile,
    preferences,
    firstAttempt.accuracy.reason || 'macros were off target'
  )
  if (!retryAttempt.accuracy.passed) {
    throw new BatchPrepValidationError(
      `Macro accuracy check failed after retry: ${retryAttempt.accuracy.reason}`
    )
  }
  return retryAttempt.plan
}

async function callAndValidate(
  profile: TrainingProfile,
  preferences: DietaryPreferences,
  correctionHint: string | null
): Promise<{ plan: BatchPrepPlan; accuracy: ReturnType<typeof checkMacroAccuracy> }> {
  const userPrompt = correctionHint
    ? buildUserPrompt(profile, preferences) +
      `\n\nIMPORTANT: Your previous attempt had this problem: ${correctionHint}. Regenerate with the macros strictly within 5% of the targets.`
    : buildUserPrompt(profile, preferences)

  const response = await anthropicService.generate({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: BATCH_PREP_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = extractTextContent(response as any)
  const json = extractJsonBlock(text)

  let validated: BatchPrepPlan
  try {
    validated = BatchPrepPlanSchema.parse(json)
  } catch (err) {
    throw new BatchPrepValidationError(
      `Claude response failed Zod validation: ${(err as Error).message}`,
      err
    )
  }

  const accuracy = checkMacroAccuracy(validated, profile)
  return { plan: validated, accuracy }
}
```

**Step 4: Run all generator tests to verify green**

```bash
npx vitest run __tests__/batch-prep/batch-prep-generator.test.ts
```
Expected: all PASS.

**Step 5: Commit**

```bash
git add lib/services/batch-prep-generator.ts __tests__/batch-prep/batch-prep-generator.test.ts
git commit -m "feat: add retry-on-macro-miss for batch prep generation"
```

---

### Task 3.6: Add usage logging

**Files:**
- Create: `lib/services/anthropic-usage-log.ts`
- Modify: `lib/services/batch-prep-generator.ts`

**Step 1: Write the usage log module**

```typescript
// lib/services/anthropic-usage-log.ts
import { createClient } from '@/lib/supabase/server'

export async function logUsage(
  userId: string | null,
  endpoint: string,
  usage: { input_tokens: number; output_tokens: number },
  status: 'success' | 'validation_fail' | 'retry' | 'error',
  errorMessage?: string
): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.from('anthropic_usage_log').insert({
      user_id: userId,
      endpoint,
      model: 'claude-sonnet-4-6',
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      status,
      error_message: errorMessage ?? null,
    })
  } catch {
    // Logging must never fail the request
  }
}
```

**Step 2: Wire logging into generator**

Modify `lib/services/batch-prep-generator.ts` to call `logUsage` after each Claude call. Accept an optional `userId` parameter:

```typescript
import { logUsage } from './anthropic-usage-log'

export async function generateBatchPrepPlan(
  userId: string | null,
  profile: TrainingProfile,
  preferences: DietaryPreferences
): Promise<BatchPrepPlan> { /* ... */ }
```

Update each call site to pass the response `usage` object to `logUsage` with the appropriate status (`success`, `retry`, `error`). On error paths, call `logUsage` with `'error'` and the message before re-throwing.

**Step 3: Update generator tests to pass `null` as first argument**

In `__tests__/batch-prep/batch-prep-generator.test.ts` update all calls to `generateBatchPrepPlan(profile, prefs)` to `generateBatchPrepPlan(null, profile, prefs)`.

**Step 4: Run tests**

```bash
npx vitest run __tests__/batch-prep/
```
Expected: all PASS.

**Step 5: Commit**

```bash
git add lib/services/anthropic-usage-log.ts lib/services/batch-prep-generator.ts __tests__/batch-prep/batch-prep-generator.test.ts
git commit -m "feat: log anthropic usage to supabase for cost visibility"
```

---

## Phase 4: Persistence and server actions

### Task 4.1: Create persistence helpers

**Files:**
- Create: `lib/services/batch-prep-persistence.ts`

**Step 1: Write the persistence helpers**

```typescript
// lib/services/batch-prep-persistence.ts
import { createClient } from '@/lib/supabase/server'
import type { BatchPrepPlan, TrainingProfile } from '@/lib/types/batch-prep'

function startOfWeekISO(): string {
  const now = new Date()
  const day = now.getUTCDay() // 0 = Sunday
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + mondayOffset)
  return monday.toISOString().split('T')[0]
}

export async function persistBatchPrepPlan(
  userId: string,
  plan: BatchPrepPlan,
  profileSnapshot: TrainingProfile
): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('batch_prep_plans')
    .insert({
      user_id: userId,
      week_starting: startOfWeekISO(),
      training_day_plan: plan.training_day,
      rest_day_plan: plan.rest_day,
      prep_timeline: plan.prep_timeline,
      shopping_list: plan.shopping_list,
      container_assignments: plan.container_assignments,
      total_containers: plan.total_containers,
      estimated_prep_time_mins: plan.estimated_prep_time_mins,
      generation_params: profileSnapshot,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to persist batch prep plan: ${error.message}`)
  return data.id
}

export async function upsertTrainingProfile(
  userId: string,
  profile: TrainingProfile
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('user_training_profile').upsert(
    {
      user_id: userId,
      training_days_per_week: profile.training_days_per_week,
      training_day_macros: profile.training_day_macros,
      rest_day_macros: profile.rest_day_macros,
      prep_day: profile.prep_day,
      containers_per_week: profile.containers_per_week,
      max_prep_time_mins: profile.max_prep_time_mins,
    },
    { onConflict: 'user_id' }
  )
  if (error) throw new Error(`Failed to upsert training profile: ${error.message}`)
}

export async function getTrainingProfile(userId: string): Promise<TrainingProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_training_profile')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null

  return {
    training_days_per_week: data.training_days_per_week,
    training_day_macros: data.training_day_macros,
    rest_day_macros: data.rest_day_macros,
    prep_day: data.prep_day,
    containers_per_week: data.containers_per_week,
    max_prep_time_mins: data.max_prep_time_mins,
  }
}

export async function getBatchPrepPlan(userId: string, id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('batch_prep_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch batch prep plan: ${error.message}`)
  return data
}

export async function countBatchPrepPlans(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('batch_prep_plans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) return 0
  return count ?? 0
}
```

**Step 2: Verify type check**

```bash
npx tsc --noEmit
```
Expected: PASS.

**Step 3: Commit**

```bash
git add lib/services/batch-prep-persistence.ts
git commit -m "feat: add batch prep persistence helpers"
```

---

### Task 4.2: Create batch-prep server action

**Files:**
- Create: `app/actions/batch-prep.ts`
- Modify: `app/actions/subscription.ts`

**Step 1: Add feature gating to subscription.ts**

Append to `app/actions/subscription.ts`:

```typescript
import { countBatchPrepPlans } from '@/lib/services/batch-prep-persistence'

const FREE_TIER_BATCH_PREP_LIMIT = 3

export async function canGenerateBatchPrepPlan(
  userId: string
): Promise<{ allowed: boolean; reason?: 'free_tier_limit'; used?: number; limit?: number }> {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .maybeSingle()

  if (profile?.subscription_tier === 'premium') {
    return { allowed: true }
  }

  const used = await countBatchPrepPlans(userId)
  if (used >= FREE_TIER_BATCH_PREP_LIMIT) {
    return { allowed: false, reason: 'free_tier_limit', used, limit: FREE_TIER_BATCH_PREP_LIMIT }
  }
  return { allowed: true, used, limit: FREE_TIER_BATCH_PREP_LIMIT }
}
```

Note: adjust the `user_profiles` query to match the actual column name used in the existing codebase. Grep `user_profiles` + `subscription` to find the canonical pattern.

**Step 2: Write the server action**

```typescript
// app/actions/batch-prep.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateBatchPrepPlan } from '@/lib/services/batch-prep-generator'
import {
  persistBatchPrepPlan,
  upsertTrainingProfile,
  getTrainingProfile,
  getBatchPrepPlan as fetchBatchPrepPlan,
} from '@/lib/services/batch-prep-persistence'
import { canGenerateBatchPrepPlan } from './subscription'
import {
  TrainingProfileSchema,
  DietaryPreferencesSchema,
  type TrainingProfile,
  type DietaryPreferences,
} from '@/lib/types/batch-prep'

export type GenerateBatchPrepResult =
  | { success: true; planId: string }
  | { success: false; error: string; code?: 'not_authenticated' | 'free_tier_limit' | 'generation_failed' }

export async function generateBatchPrepPlanAction(
  rawProfile: unknown,
  rawPreferences: unknown
): Promise<GenerateBatchPrepResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', code: 'not_authenticated' }
  }

  const gate = await canGenerateBatchPrepPlan(user.id)
  if (!gate.allowed) {
    return {
      success: false,
      error: 'Free tier limit reached. Upgrade to Premium for unlimited batch prep plans.',
      code: 'free_tier_limit',
    }
  }

  let profile: TrainingProfile
  let preferences: DietaryPreferences
  try {
    profile = TrainingProfileSchema.parse(rawProfile)
    preferences = DietaryPreferencesSchema.parse(rawPreferences)
  } catch (err) {
    return { success: false, error: 'Invalid form data' }
  }

  try {
    const plan = await generateBatchPrepPlan(user.id, profile, preferences)
    const planId = await persistBatchPrepPlan(user.id, plan, profile)
    await upsertTrainingProfile(user.id, profile)
    revalidatePath('/meal-plans')
    return { success: true, planId }
  } catch (err) {
    console.error('[batch-prep] generation failed:', err)
    return {
      success: false,
      error: 'Generation failed — please try again.',
      code: 'generation_failed',
    }
  }
}

export async function getTrainingProfileAction(): Promise<TrainingProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return getTrainingProfile(user.id)
}
```

**Step 3: Verify type check**

```bash
npx tsc --noEmit
```
Expected: PASS.

**Step 4: Commit**

```bash
git add app/actions/batch-prep.ts app/actions/subscription.ts
git commit -m "feat: add batch prep server action with subscription gating"
```

---

## Phase 5: Frontend — Generator page

### Task 5.1: Create training profile generator form component

**Files:**
- Create: `components/batch-prep/generator-form.tsx`

**Step 1: Scan existing form patterns**

```bash
grep -rn "useForm" components/onboarding components/meal-plans 2>&1 | head -5
```
Note: use the same react-hook-form + Zod pattern as existing forms.

**Step 2: Write the component**

```typescript
'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrainingProfileSchema, type TrainingProfile } from '@/lib/types/batch-prep'
import { generateBatchPrepPlanAction } from '@/app/actions/batch-prep'

const FormSchema = TrainingProfileSchema

interface Props {
  defaults: TrainingProfile
  userDietType?: string
  userExclusions: string[]
}

export function GeneratorForm({ defaults, userDietType, userExclusions }: Props) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<TrainingProfile>({
      resolver: zodResolver(FormSchema),
      defaultValues: defaults,
    })

  const onSubmit = (data: TrainingProfile) => {
    setServerError(null)
    startTransition(async () => {
      const result = await generateBatchPrepPlanAction(data, {
        diet_type: userDietType,
        exclusions: userExclusions,
      })
      if (result.success) {
        router.push(`/meal-plans/${result.planId}`)
      } else {
        setServerError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="training_days_per_week">Training days per week</Label>
          <Input
            id="training_days_per_week"
            type="number"
            min={0}
            max={7}
            {...register('training_days_per_week', { valueAsNumber: true })}
          />
          {errors.training_days_per_week && (
            <p className="text-sm text-red-500">{errors.training_days_per_week.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="prep_day">Prep day</Label>
          <Select
            defaultValue={defaults.prep_day}
            onValueChange={(v) => setValue('prep_day', v as any)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].map((d) => (
                <SelectItem key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="containers_per_week">Containers to fill</Label>
          <Input
            id="containers_per_week"
            type="number"
            min={3}
            max={21}
            {...register('containers_per_week', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="max_prep_time_mins">Max prep time (minutes)</Label>
          <Input
            id="max_prep_time_mins"
            type="number"
            min={30}
            {...register('max_prep_time_mins', { valueAsNumber: true })}
          />
        </div>
      </div>

      <details className="rounded border p-4">
        <summary className="cursor-pointer font-medium">Macro targets (click to override)</summary>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold mb-2">Training days</p>
            <Input type="number" placeholder="calories" {...register('training_day_macros.calories', { valueAsNumber: true })} />
            <Input type="number" placeholder="protein (g)" {...register('training_day_macros.protein_g', { valueAsNumber: true })} />
            <Input type="number" placeholder="carbs (g)" {...register('training_day_macros.carbs_g', { valueAsNumber: true })} />
            <Input type="number" placeholder="fat (g)" {...register('training_day_macros.fat_g', { valueAsNumber: true })} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">Rest days</p>
            <Input type="number" placeholder="calories" {...register('rest_day_macros.calories', { valueAsNumber: true })} />
            <Input type="number" placeholder="protein (g)" {...register('rest_day_macros.protein_g', { valueAsNumber: true })} />
            <Input type="number" placeholder="carbs (g)" {...register('rest_day_macros.carbs_g', { valueAsNumber: true })} />
            <Input type="number" placeholder="fat (g)" {...register('rest_day_macros.fat_g', { valueAsNumber: true })} />
          </div>
        </div>
      </details>

      {serverError && <p className="text-red-500">{serverError}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Generating your prep plan…' : 'Generate my prep plan →'}
      </Button>
    </form>
  )
}
```

**Step 3: Verify type check**

```bash
npx tsc --noEmit
```
Expected: PASS.

**Step 4: Commit**

```bash
git add components/batch-prep/generator-form.tsx
git commit -m "feat: add batch prep generator form component"
```

---

### Task 5.2: Rewrite meal-plans/generate page

**Files:**
- Modify: `app/meal-plans/generate/page.tsx`

**Step 1: Read the current page to understand structure**

```bash
cat app/meal-plans/generate/page.tsx | head -40
```

**Step 2: Rewrite as a server component that computes defaults and renders the form**

```typescript
// app/meal-plans/generate/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTrainingProfile } from '@/lib/services/batch-prep-persistence'
import { GeneratorForm } from '@/components/batch-prep/generator-form'
import type { TrainingProfile } from '@/lib/types/batch-prep'

function computeDefaultProfile(userProfile: {
  calories?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
}): TrainingProfile {
  const cal = userProfile.calories ?? 2500
  const protein = userProfile.protein_g ?? 180
  const carbs = userProfile.carbs_g ?? 250
  const fat = userProfile.fat_g ?? 70

  return {
    training_days_per_week: 5,
    prep_day: 'sunday',
    containers_per_week: 10,
    max_prep_time_mins: 120,
    training_day_macros: {
      calories: Math.round(cal),
      protein_g: Math.round(protein),
      carbs_g: Math.round(carbs),
      fat_g: Math.round(fat),
    },
    // Rest day = -20% carbs, keep protein and fat
    rest_day_macros: {
      calories: Math.round(cal - carbs * 0.2 * 4),
      protein_g: Math.round(protein),
      carbs_g: Math.round(carbs * 0.8),
      fat_g: Math.round(fat),
    },
  }
}

export default async function GenerateBatchPrepPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Try existing training profile first
  let defaults = await getTrainingProfile(user.id)
  let userDietType: string | undefined
  let userExclusions: string[] = []

  // Fall back to computed from user_profiles
  const { data: profileRow } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (profileRow) {
    userDietType = profileRow.diet_type ?? undefined
    userExclusions = profileRow.excluded_ingredients ?? []
    if (!defaults) {
      defaults = computeDefaultProfile(profileRow)
    }
  }

  if (!defaults) {
    // Extreme fallback if no profile row at all
    defaults = {
      training_days_per_week: 5,
      training_day_macros: { calories: 2500, protein_g: 180, carbs_g: 250, fat_g: 70 },
      rest_day_macros: { calories: 2300, protein_g: 180, carbs_g: 200, fat_g: 70 },
      prep_day: 'sunday',
      containers_per_week: 10,
      max_prep_time_mins: 120,
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Your batch prep plan</h1>
      <p className="text-muted-foreground mb-6">
        Tell us your training schedule and we'll generate a batch cooking plan that hits
        your macros. Takes about 3 seconds.
      </p>
      <GeneratorForm
        defaults={defaults}
        userDietType={userDietType}
        userExclusions={userExclusions}
      />
    </main>
  )
}
```

Note: the column names on `user_profiles` (`calories`, `protein_g`, `diet_type`, `excluded_ingredients`) must match the actual schema. Verify with:

```bash
grep -rn "from('user_profiles')" lib/ app/ 2>&1 | head -10
```

Adjust field names to match the canonical schema used elsewhere in the codebase.

**Step 3: Verify type check + build**

```bash
npx tsc --noEmit
```
Expected: PASS.

**Step 4: Commit**

```bash
git add app/meal-plans/generate/page.tsx
git commit -m "feat: rewrite /meal-plans/generate as batch prep entry point"
```

---

## Phase 6: Frontend — Plan view

### Task 6.1: Create plan view components

**Files:**
- Create: `components/batch-prep/plan-view.tsx`
- Create: `components/batch-prep/meal-card.tsx`
- Create: `components/batch-prep/shopping-list-panel.tsx`

**Step 1: Write meal-card.tsx**

```typescript
// components/batch-prep/meal-card.tsx
import type { Meal } from '@/lib/types/batch-prep'

export function MealCard({ meal }: { meal: Meal }) {
  const m = meal.total_macros
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{meal.name}</h3>
          <p className="text-xs text-muted-foreground uppercase">{meal.meal_slot}</p>
        </div>
        <div className="text-right text-sm">
          <p>{meal.servings_to_prep} servings</p>
          <p className="text-muted-foreground">{meal.storage_days} days</p>
        </div>
      </div>
      <div className="flex gap-3 text-sm">
        <span><strong>{m.calories}</strong> cal</span>
        <span><strong>{m.protein_g}</strong>g P</span>
        <span><strong>{m.carbs_g}</strong>g C</span>
        <span><strong>{m.fat_g}</strong>g F</span>
      </div>
      <details>
        <summary className="cursor-pointer text-sm text-muted-foreground">
          Ingredients
        </summary>
        <ul className="mt-2 text-sm space-y-1">
          {meal.ingredients.map((i, idx) => (
            <li key={idx}>
              {i.quantity_g}g {i.name}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
```

**Step 2: Write shopping-list-panel.tsx**

```typescript
// components/batch-prep/shopping-list-panel.tsx
'use client'

import { useState } from 'react'
import type { ShoppingItem } from '@/lib/types/batch-prep'

export function ShoppingListPanel({ items }: { items: ShoppingItem[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const grouped = items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    const key = item.category ?? 'other'
    ;(acc[key] ||= []).push(item)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="font-semibold uppercase text-sm text-muted-foreground mb-2">
            {category}
          </h3>
          <ul className="space-y-1">
            {categoryItems.map((item, idx) => {
              const globalIdx = items.indexOf(item)
              return (
                <li key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!checked[globalIdx]}
                    onChange={(e) =>
                      setChecked({ ...checked, [globalIdx]: e.target.checked })
                    }
                  />
                  <span className={checked[globalIdx] ? 'line-through text-muted-foreground' : ''}>
                    {item.quantity_g}g {item.ingredient}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
```

**Step 3: Write plan-view.tsx**

```typescript
// components/batch-prep/plan-view.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MealCard } from './meal-card'
import { ShoppingListPanel } from './shopping-list-panel'
import type { DayPlan, ShoppingItem, ContainerAssignment } from '@/lib/types/batch-prep'

interface Props {
  planId: string
  trainingDay: DayPlan
  restDay: DayPlan
  shoppingList: ShoppingItem[]
  containerAssignments: ContainerAssignment[]
  totalContainers: number
  estimatedPrepTimeMins: number
}

export function PlanView({
  planId,
  trainingDay,
  restDay,
  shoppingList,
  totalContainers,
  estimatedPrepTimeMins,
}: Props) {
  const [dayType, setDayType] = useState<'training' | 'rest'>('training')
  const [tab, setTab] = useState<'meals' | 'shopping'>('meals')
  const currentDay = dayType === 'training' ? trainingDay : restDay

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your prep plan</h1>
          <p className="text-muted-foreground">
            {totalContainers} containers · ~{estimatedPrepTimeMins} min prep
          </p>
        </div>
        <Link href={`/meal-plans/${planId}/prep-day`}>
          <Button>Start prep day →</Button>
        </Link>
      </header>

      <div className="flex gap-2">
        <Button
          variant={dayType === 'training' ? 'default' : 'outline'}
          onClick={() => setDayType('training')}
        >
          Training day
        </Button>
        <Button
          variant={dayType === 'rest' ? 'default' : 'outline'}
          onClick={() => setDayType('rest')}
        >
          Rest day
        </Button>
      </div>

      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 ${tab === 'meals' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setTab('meals')}
        >
          Meals
        </button>
        <button
          className={`px-4 py-2 ${tab === 'shopping' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setTab('shopping')}
        >
          Shopping list
        </button>
      </div>

      {tab === 'meals' && (
        <>
          <div className="flex gap-4 text-sm">
            <span><strong>{currentDay.daily_totals.calories}</strong> cal</span>
            <span><strong>{currentDay.daily_totals.protein_g}</strong>g P</span>
            <span><strong>{currentDay.daily_totals.carbs_g}</strong>g C</span>
            <span><strong>{currentDay.daily_totals.fat_g}</strong>g F</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDay.meals.map((m, i) => <MealCard key={i} meal={m} />)}
          </div>
        </>
      )}

      {tab === 'shopping' && <ShoppingListPanel items={shoppingList} />}
    </main>
  )
}
```

**Step 4: Type check**

```bash
npx tsc --noEmit
```
Expected: PASS.

**Step 5: Commit**

```bash
git add components/batch-prep/
git commit -m "feat: add batch prep plan view components"
```

---

### Task 6.2: Rewrite meal-plans/[id] page

**Files:**
- Modify: `app/meal-plans/[id]/page.tsx`

**Step 1: Read current file**

```bash
cat app/meal-plans/\[id\]/page.tsx
```

**Step 2: Rewrite to render batch prep plan first, fall back to legacy**

```typescript
// app/meal-plans/[id]/page.tsx
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBatchPrepPlan } from '@/lib/services/batch-prep-persistence'
import { PlanView } from '@/components/batch-prep/plan-view'
import {
  DayPlanSchema,
  type DayPlan,
  type ShoppingItem,
  type ContainerAssignment,
  type PrepStep,
} from '@/lib/types/batch-prep'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your prep plan | MacroPlan',
  description: 'View your batch meal prep plan',
}

export default async function MealPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const plan = await getBatchPrepPlan(user.id, id)

  if (!plan) {
    // Could be a legacy meal_plans row — render fallback
    const { data: legacy } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (legacy) {
      return (
        <main className="max-w-2xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Legacy plan</h1>
          <p className="text-muted-foreground mb-6">
            This plan was created before the batch prep update. Generate a new batch prep plan to
            see the new experience.
          </p>
          <a
            href="/meal-plans/generate"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded"
          >
            Generate new plan
          </a>
        </main>
      )
    }

    notFound()
  }

  return (
    <PlanView
      planId={plan.id}
      trainingDay={plan.training_day_plan as DayPlan}
      restDay={plan.rest_day_plan as DayPlan}
      shoppingList={plan.shopping_list as ShoppingItem[]}
      containerAssignments={plan.container_assignments as ContainerAssignment[]}
      totalContainers={plan.total_containers}
      estimatedPrepTimeMins={plan.estimated_prep_time_mins}
    />
  )
}
```

**Step 3: Type check**

```bash
npx tsc --noEmit
```
Expected: PASS. If there are type errors about legacy `MealPlanView` imports, those are expected — we delete that file in Phase 8.

**Step 4: Commit**

```bash
git add app/meal-plans/\[id\]/page.tsx
git commit -m "feat: rewrite /meal-plans/[id] to render batch prep plan with legacy fallback"
```

---

## Phase 7: Prep day timeline view

### Task 7.1: Create prep-timeline component

**Files:**
- Create: `components/batch-prep/prep-timeline.tsx`
- Test: `__tests__/batch-prep/prep-timeline.test.tsx`

**Step 1: Write failing test**

```typescript
// __tests__/batch-prep/prep-timeline.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PrepTimeline } from '@/components/batch-prep/prep-timeline'
import type { PrepStep } from '@/lib/types/batch-prep'

const steps: PrepStep[] = [
  { step: 1, time: '0:00', action: 'Preheat oven', duration_mins: 5, equipment: 'oven' },
  { step: 2, time: '0:05', action: 'Put rice on', duration_mins: 0, equipment: 'rice_cooker' },
  { step: 3, time: '0:10', action: 'Brown beef', duration_mins: 20, equipment: 'stovetop' },
]

describe('PrepTimeline', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders all steps', () => {
    render(<PrepTimeline planId="test-plan" steps={steps} />)
    expect(screen.getByText('Preheat oven')).toBeInTheDocument()
    expect(screen.getByText('Put rice on')).toBeInTheDocument()
    expect(screen.getByText('Brown beef')).toBeInTheDocument()
  })

  it('persists checkbox state to localStorage', () => {
    render(<PrepTimeline planId="test-plan" steps={steps} />)
    const firstCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(firstCheckbox)
    expect(localStorage.getItem('prep-timeline:test-plan')).toContain('1')
  })

  it('restores checkbox state from localStorage on mount', () => {
    localStorage.setItem('prep-timeline:test-plan', JSON.stringify({ 1: true }))
    render(<PrepTimeline planId="test-plan" steps={steps} />)
    const firstCheckbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement
    expect(firstCheckbox.checked).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/batch-prep/prep-timeline.test.tsx
```
Expected: FAIL — component not found.

**Step 3: Write the component**

```typescript
// components/batch-prep/prep-timeline.tsx
'use client'

import { useEffect, useState } from 'react'
import type { PrepStep } from '@/lib/types/batch-prep'

interface Props {
  planId: string
  steps: PrepStep[]
}

export function PrepTimeline({ planId, steps }: Props) {
  const storageKey = `prep-timeline:${planId}`
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        setChecked(JSON.parse(stored))
      } catch {
        // ignore corrupt state
      }
    }
  }, [storageKey])

  const toggle = (stepNum: number) => {
    setChecked((prev) => {
      const next = { ...prev, [stepNum]: !prev[stepNum] }
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(next))
      }
      return next
    })
  }

  const equipmentLabel: Record<string, string> = {
    oven: 'Oven',
    rice_cooker: 'Rice cooker',
    stovetop: 'Stovetop',
    none: 'Prep',
  }

  return (
    <ol className="space-y-4">
      {steps.map((step) => {
        const isChecked = !!checked[step.step]
        return (
          <li
            key={step.step}
            className={`flex gap-4 p-4 border rounded ${isChecked ? 'opacity-50' : ''}`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggle(step.step)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{step.time}</span>
                <span className="px-2 py-0.5 bg-muted rounded uppercase text-[10px]">
                  {equipmentLabel[step.equipment]}
                </span>
                {step.duration_mins > 0 && <span>{step.duration_mins} min</span>}
              </div>
              <p className={`mt-1 ${isChecked ? 'line-through' : ''}`}>{step.action}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/batch-prep/prep-timeline.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add components/batch-prep/prep-timeline.tsx __tests__/batch-prep/prep-timeline.test.tsx
git commit -m "feat: add prep timeline component with localStorage state"
```

---

### Task 7.2: Create prep-day route

**Files:**
- Create: `app/meal-plans/[id]/prep-day/page.tsx`

**Step 1: Write the page**

```typescript
// app/meal-plans/[id]/prep-day/page.tsx
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBatchPrepPlan } from '@/lib/services/batch-prep-persistence'
import { PrepTimeline } from '@/components/batch-prep/prep-timeline'
import type { PrepStep } from '@/lib/types/batch-prep'

export default async function PrepDayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const plan = await getBatchPrepPlan(user.id, id)
  if (!plan) notFound()

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <header>
        <Link
          href={`/meal-plans/${id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to plan
        </Link>
        <h1 className="text-3xl font-bold mt-2">Prep day</h1>
        <p className="text-muted-foreground">
          ~{plan.estimated_prep_time_mins} minutes · {plan.total_containers} containers
        </p>
      </header>

      <PrepTimeline
        planId={plan.id}
        steps={plan.prep_timeline as PrepStep[]}
      />
    </main>
  )
}
```

**Step 2: Type check**

```bash
npx tsc --noEmit
```
Expected: PASS.

**Step 3: Commit**

```bash
git add app/meal-plans/\[id\]/prep-day/page.tsx
git commit -m "feat: add /meal-plans/[id]/prep-day cooking timeline route"
```

---

## Phase 8: Delete legacy generator code

### Task 8.1: Delete old meal-plan-generator service and dependent files

**Files:**
- Delete: `lib/services/meal-plan-generator.ts`
- Delete: `components/meal-plans/meal-plan-view.tsx`
- Delete: `components/meal-plans/swap-meal-modal.tsx`
- Delete: `components/meal-plans/meal-placeholder.tsx`

**Step 1: Check for remaining references before deletion**

```bash
grep -rn "meal-plan-generator\|mealPlanGeneratorService" app/ lib/ components/ 2>&1
grep -rn "components/meal-plans/meal-plan-view\|components/meal-plans/swap-meal-modal\|components/meal-plans/meal-placeholder" app/ lib/ components/ 2>&1
```

If any imports remain outside `app/actions/meal-plans.ts`, find and update them.

**Step 2: Update `app/actions/meal-plans.ts`**

The existing `app/actions/meal-plans.ts` references `mealPlanGeneratorService`. Since batch prep replaces daily plan generation, either:
- (A) Delete the old `generateMealPlan` / `swapMeal` / `createMealPlanMealEntry` functions entirely, OR
- (B) Keep them as no-ops returning a "Use batch prep instead" error

Choose (A) — delete the functions. Grep for callers first:

```bash
grep -rn "generateMealPlan\|swapMeal" app/ components/ 2>&1
```

Update/delete each caller. The new plan flow goes through `generateBatchPrepPlanAction`.

**Step 3: Delete the files**

```bash
rm lib/services/meal-plan-generator.ts
rm components/meal-plans/meal-plan-view.tsx
rm components/meal-plans/swap-meal-modal.tsx
rm components/meal-plans/meal-placeholder.tsx
```

**Step 4: Type check and fix any breakage**

```bash
npx tsc --noEmit
```

Fix each error by either deleting the calling code (if it was part of the old flow) or updating it to use the new batch prep action. Stay within the P0 scope — don't rewrite unrelated code.

**Step 5: Run full test suite**

```bash
npx vitest run
```
Expected: all tests in `__tests__/batch-prep/` and `__tests__/recipe-api/` PASS. Other pre-existing tests remain as they were.

**Step 6: Commit**

```bash
git add -A lib/services components/meal-plans app/actions/meal-plans.ts
git commit -m "refactor: delete legacy daily meal plan generator and components"
```

---

## Phase 9: Landing page and pricing copy

### Task 9.1: Update landing page hero

**Files:**
- Modify: `app/page.tsx` (and any landing components it composes)

**Step 1: Read current landing page**

```bash
cat app/page.tsx
```

Then grep for hero components:

```bash
grep -rn "Stop tracking\|plan what to eat" app/ components/landing/ 2>&1
```

**Step 2: Replace hero copy**

Update the hero headline, subheadline, and CTA text to:
- Headline: **"Your meal prep, planned."**
- Subheadline: **"AI-generated batch cooking plans that hit your exact macros. Tell us your prep day, your macros, and how many containers to fill — done in 3 seconds."**
- CTA: **"Start your first prep — free"**

The exact file edits depend on the current component structure — make surgical changes using Edit tool.

**Step 3: Update "How it works" 3 steps**

Find the component rendering the 3 steps and replace with:
1. **Set your macros + training days** — Training 5x/week? We calculate your training day and rest day targets automatically.
2. **Generate your prep plan** — AI builds a batch-cook plan optimised for cooking once, eating all week. 3–4 recipes, one shopping list, one prep session.
3. **Cook, container, crush it** — Follow the step-by-step cooking timeline. Fill your containers. Hit your macros every day without thinking.

**Step 4: Add differentiator section**

Add a new section between "How it works" and features (or wherever feels natural given current layout):

Title: **"Built for people who actually meal prep"**

Body:
> Other apps give you 28 different recipes for 28 meals. You're not cooking 28 meals. You're cooking on Sunday and eating from containers all week. MacroPlan is the only planner that understands this.

Four bullet cards:
- **Batch-optimised recipes** — Every meal designed for bulk cooking and 5-day refrigeration
- **Cooking timeline** — Oven first, rice cooker second, stovetop third. We tell you what to do and when.
- **Training day / rest day macros** — Different targets for different days, automatically
- **Fridge-aware replanning** — *Coming soon*

**Step 5: Verify build**

```bash
npm run build
```
Expected: build succeeds.

**Step 6: Commit**

```bash
git add app/page.tsx components/landing/
git commit -m "feat: update landing page copy for batch prep positioning"
```

---

### Task 9.2: Update pricing page feature table

**Files:**
- Modify: `app/pricing/page.tsx`

**Step 1: Read current pricing page**

```bash
cat app/pricing/page.tsx
```

**Step 2: Update the feature comparison table**

Replace the features list with:

| | Free | Premium ($9.99/mo) |
|---|---|---|
| Batch prep plans | 3 lifetime | Unlimited |
| Training / rest day split | ✗ | ✓ |
| Cooking timeline | ✗ | ✓ |
| Shopping list | ✓ | ✓ |
| PDF export | ✓ | ✓ |

Delete references to the old "daily meal plans" feature name.

**Step 3: Build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add app/pricing/page.tsx
git commit -m "feat: update pricing page for batch prep feature gating"
```

---

## Phase 10: Verification

### Task 10.1: Full verification sweep

**Step 1: Clean .next cache (avoids stale type references to deleted routes)**

```bash
rm -rf .next
```

**Step 2: Type check**

```bash
npx tsc --noEmit
```
Expected: zero errors.

**Step 3: Run full test suite**

```bash
npx vitest run
```
Expected: all batch-prep tests pass. Recipe-api tests pass. Pre-existing worktree test failures (cranky-mcclintock) are not our concern.

**Step 4: Production build**

```bash
npm run build
```
Expected: build succeeds. Any warnings about unused imports from deleted files should be addressed.

**Step 5: Lint (optional but recommended)**

```bash
npm run lint
```
Expected: no new errors introduced.

**Step 6: Manual testing checklist — document for user**

Create `docs/plans/2026-04-09-batch-prep-p0-testing.md` with the checklist:

```markdown
# Batch Prep P0 — Manual Testing Checklist

Prerequisites:
- Run migration 20260409_batch_prep_mode.sql in Supabase SQL Editor
- Set ANTHROPIC_API_KEY in Vercel environment variables
- Ensure RECIPE_API_KEY and UNSPLASH_ACCESS_KEY still set (for /recipes browse)

Happy path:
- [ ] Navigate to /meal-plans/generate as logged-in user
- [ ] Form pre-fills with smart defaults from user_profiles
- [ ] Click Generate → plan renders at /meal-plans/{id}
- [ ] Training day / rest day toggle switches meal list
- [ ] Shopping list tab shows consolidated quantities
- [ ] Click "Start prep day" → timeline view renders
- [ ] Check off steps → state persists on reload

Edge cases:
- [ ] Generate with exclusions "peanuts, shellfish" → Claude respects them
- [ ] Free tier user with 0 plans → generation succeeds
- [ ] Free tier user with 3 plans → generation blocked with upgrade CTA
- [ ] Premium user → unlimited generation
- [ ] Open legacy /meal-plans/{old-id} → fallback view shows

Landing & pricing:
- [ ] / shows new hero "Your meal prep, planned."
- [ ] "How it works" shows new 3-step copy
- [ ] Differentiator section renders
- [ ] /pricing shows updated feature table
```

**Step 7: Final commit**

```bash
git add docs/plans/2026-04-09-batch-prep-p0-testing.md
git commit -m "docs: add batch prep manual testing checklist"
```

---

## Deployment notes

Before deploying to Vercel:

1. **Run migration SQL in Supabase production SQL Editor** — `supabase/migrations/20260409_batch_prep_mode.sql`
2. **Add `ANTHROPIC_API_KEY` to Vercel env vars** — production and preview scopes
3. **Verify existing env vars still set** — `RECIPE_API_KEY`, `UNSPLASH_ACCESS_KEY`, Supabase keys
4. **Monitor `anthropic_usage_log` table** after first day of prod traffic to see cost and error rate
5. **Smoke test in preview deployment** before promoting to production

## Out of scope — deferred to P1+

Per the validated design, these are NOT part of this plan:
- Fridge scanner (Claude Vision)
- Phase cycling
- Supplement integration
- Recipe ratings
- Cost tracking
- Public share links
- Onboarding flow changes
- SEO article content

Do not implement these during P0 execution. If a task description ambiguously implies one of these, stop and ask.
