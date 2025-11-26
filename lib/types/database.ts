/**
 * TypeScript types for Supabase database tables
 */

export interface UserProfile {
  id: string
  user_id: string

  // Profile Info
  full_name: string | null
  avatar_url: string | null

  // Step 1: Goal
  goal: 'cut' | 'bulk' | 'maintain' | 'recomp' | null

  // Step 2: Personal Stats
  age: number | null
  weight_kg: number | null
  height_cm: number | null
  sex: 'male' | 'female' | null

  // Step 3: Activity Level
  activity_level: 'sedentary' | 'lightly' | 'moderately' | 'very' | 'extremely' | null

  // Step 4: Dietary Preferences
  dietary_style: 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'paleo' | 'keto' | 'mediterranean' | null
  allergies: string[] | null
  foods_to_avoid: string | null

  // Step 5: Experience Level
  fitness_experience: 'beginner' | 'intermediate' | 'advanced' | null
  tracking_experience: 'never' | 'some' | 'experienced' | null
  meal_prep_skills: 'beginner' | 'intermediate' | 'advanced' | null

  // Step 6: Calculated Values
  bmr: number | null
  tdee: number | null
  target_calories: number | null
  protein_grams: number | null
  carb_grams: number | null
  fat_grams: number | null

  // Status
  onboarding_completed: boolean

  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Insert type (omits generated fields)
 */
export type UserProfileInsert = Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>

/**
 * Update type (all fields optional except user_id)
 */
export type UserProfileUpdate = Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
