'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateBatchPrepPlan } from '@/lib/services/batch-prep-generator'
import { generatePlanFromLibrary } from '@/lib/services/batch-prep-library'
import {
  persistBatchPrepPlan,
  upsertTrainingProfile,
  getTrainingProfile,
  getRecentRecipeNames,
} from '@/lib/services/batch-prep-persistence'
import { canGenerateBatchPrepPlan } from './subscription'
import {
  BatchPrepValidationError,
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
      error: 'Free tier limit reached. Upgrade to Premium for 100 plans a month.',
      code: 'free_tier_limit',
    }
  }

  let profile: TrainingProfile
  let preferences: DietaryPreferences
  try {
    profile = TrainingProfileSchema.parse(rawProfile)
    preferences = DietaryPreferencesSchema.parse(rawPreferences)
  } catch {
    return { success: false, error: 'Invalid form data' }
  }

  try {
    // Steer the generator away from recipes the user already received
    const recentRecipeNames = await getRecentRecipeNames(user.id).catch(() => [])

    // Free path first: assemble the plan from the recipe library. The paid
    // model is only a fallback for when the library can't fill the plan
    // (too few recipes for this diet/exclusions) and a key is configured.
    const plan = await generatePlanFromLibrary(profile, preferences, recentRecipeNames).catch((err) => {
      if (!(err instanceof BatchPrepValidationError) || !process.env.OPENROUTER_API_KEY) throw err
      return generateBatchPrepPlan(user.id, profile, preferences, recentRecipeNames)
    })
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
