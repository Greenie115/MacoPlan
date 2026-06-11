import { describe, it, expect } from 'vitest'
import { BATCH_PREP_SYSTEM_PROMPT, buildUserPrompt, pickCuisines } from '@/lib/services/batch-prep-prompts'
import type { TrainingProfile } from '@/lib/types/batch-prep'

describe('batch-prep prompts', () => {
  describe('BATCH_PREP_SYSTEM_PROMPT', () => {
    it('mentions batch cooking explicitly', () => {
      expect(BATCH_PREP_SYSTEM_PROMPT).toContain('BATCH COOKING')
    })

    it('requires tag output without markdown or JSON', () => {
      expect(BATCH_PREP_SYSTEM_PROMPT).toContain('<plan')
      expect(BATCH_PREP_SYSTEM_PROMPT).toContain('no markdown fences')
      expect(BATCH_PREP_SYSTEM_PROMPT).toContain('no JSON')
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
      expect(prompt).toContain('DROP TABLE')
      expect(prompt).toContain('\\"')
    })

    it('includes cuisine direction when cuisines are provided', () => {
      const prompt = buildUserPrompt(profile, { exclusions: [] }, { cuisines: ['Thai', 'Mexican'] })
      expect(prompt).toContain('FLAVOR DIRECTION')
      expect(prompt).toContain('Thai')
      expect(prompt).toContain('Mexican')
    })

    it('omits cuisine direction by default', () => {
      const prompt = buildUserPrompt(profile, { exclusions: [] })
      expect(prompt).not.toContain('FLAVOR DIRECTION')
    })

    it('lists recent recipes to avoid when provided', () => {
      const prompt = buildUserPrompt(profile, { exclusions: [] }, {
        avoidRecipes: ['Gochujang Chicken Bowls', 'Turkey Chili'],
      })
      expect(prompt).toContain('DO NOT REPEAT')
      expect(prompt).toContain('Gochujang Chicken Bowls')
      expect(prompt).toContain('Turkey Chili')
    })

    it('omits the avoid block when there is no history', () => {
      const prompt = buildUserPrompt(profile, { exclusions: [] }, { avoidRecipes: [] })
      expect(prompt).not.toContain('DO NOT REPEAT')
    })

    it('includes per-slot cuisine choices when provided', () => {
      const prompt = buildUserPrompt(profile, {
        exclusions: [],
        meal_cuisines: { breakfast: 'American', lunch: 'Mediterranean', dinner: 'Indian' },
      })
      expect(prompt).toContain('CUISINE BY MEAL SLOT')
      expect(prompt).toContain('breakfast: "American"')
      expect(prompt).toContain('lunch: "Mediterranean"')
      expect(prompt).toContain('dinner: "Indian"')
      expect(prompt).not.toContain('snack:')
    })

    it('scopes rotation cuisines to unchosen slots when per-slot cuisines exist', () => {
      const prompt = buildUserPrompt(
        profile,
        { exclusions: [], meal_cuisines: { dinner: 'Indian' } },
        { cuisines: ['Thai'] }
      )
      expect(prompt).toContain('WITHOUT a user-chosen cuisine')
      expect(prompt).toContain('Thai')
    })

    it('omits the per-slot block when no cuisines are chosen', () => {
      const prompt = buildUserPrompt(profile, { exclusions: [], meal_cuisines: {} })
      expect(prompt).not.toContain('CUISINE BY MEAL SLOT')
    })
  })

  describe('variety guardrails in the system prompt', () => {
    it('frames the macro table as calibration, not a whitelist', () => {
      expect(BATCH_PREP_SYSTEM_PROMPT).toContain('NOT A WHITELIST')
    })

    it('requires a sauce/seasoning identity per recipe', () => {
      expect(BATCH_PREP_SYSTEM_PROMPT).toContain('sauce, marinade, or spice mix')
    })

    it('caps ingredient overlap between recipes', () => {
      expect(BATCH_PREP_SYSTEM_PROMPT).toContain('at most one primary protein')
    })
  })

  describe('pickCuisines', () => {
    it('returns the requested number of distinct cuisines', () => {
      const cuisines = pickCuisines(3)
      expect(cuisines).toHaveLength(3)
      expect(new Set(cuisines).size).toBe(3)
    })

    it('varies across calls', () => {
      // 20 draws of 3-of-18 virtually never produce a single unique set
      const draws = new Set(
        Array.from({ length: 20 }, () => pickCuisines(3).sort().join('|'))
      )
      expect(draws.size).toBeGreaterThan(1)
    })
  })
})
