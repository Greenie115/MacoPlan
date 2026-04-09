import { describe, it, expect } from 'vitest'
import { BATCH_PREP_SYSTEM_PROMPT, buildUserPrompt } from '@/lib/services/batch-prep-prompts'
import type { TrainingProfile } from '@/lib/types/batch-prep'

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
      expect(prompt).toContain('DROP TABLE')
      expect(prompt).toContain('\\"')
    })
  })
})
