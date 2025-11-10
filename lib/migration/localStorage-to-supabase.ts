import { useOnboardingStore } from '@/stores/onboarding-store'
import { createUserProfile } from '@/app/actions/profile'

/**
 * Migrates onboarding data from localStorage to Supabase
 * Called after user successfully authenticates
 */
export async function migrateOnboardingData(): Promise<void> {
  // Get current state from Zustand store (which reads from localStorage)
  const store = useOnboardingStore.getState()

  // Validate that we have the minimum required data
  if (!store.goal || !store.age || !store.weight || !store.sex || !store.activityLevel) {
    throw new Error('Incomplete onboarding data - missing required fields')
  }

  // Convert imperial measurements to metric for database storage
  const weightKg = store.weightUnit === 'lbs' ? store.weight * 0.453592 : store.weight
  const heightCm =
    ((store.heightFeet ?? 0) * 12 + (store.heightInches ?? 0)) * 2.54

  // Prepare profile data for database
  const profileData = {
    // Step 1: Goal
    goal: store.goal,

    // Step 2: Personal Stats
    age: store.age,
    weight_kg: weightKg,
    height_cm: heightCm,
    sex: store.sex,

    // Step 3: Activity Level
    activity_level: store.activityLevel,

    // Step 4: Dietary Preferences
    dietary_style: store.dietaryStyle ?? undefined,
    allergies: store.allergies && store.allergies.length > 0 ? store.allergies : undefined,
    foods_to_avoid: store.foodsToAvoid ?? undefined,

    // Step 5: Experience Level
    fitness_experience: store.fitnessExperience ?? undefined,
    tracking_experience: store.trackingExperience ?? undefined,
    meal_prep_skills: store.mealPrepSkills ?? undefined,

    // Step 6: Calculated Values
    bmr: store.bmr,
    tdee: store.tdee,
    target_calories: store.targetCalories,
    protein_grams: store.proteinGrams,
    carb_grams: store.carbGrams,
    fat_grams: store.fatGrams,

    // Mark onboarding as complete
    onboarding_completed: true,
  }

  // Save to Supabase via server action
  const result = await createUserProfile(profileData)

  if (result.error) {
    throw new Error(`Failed to save profile: ${result.error}`)
  }

  // Clear localStorage after successful migration
  localStorage.removeItem('onboarding-storage')

  // Reset Zustand store
  store.resetOnboarding()
}
