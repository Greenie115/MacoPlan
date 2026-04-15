import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTrainingProfile } from '@/lib/services/batch-prep-persistence'
import { GeneratorForm } from '@/components/batch-prep/generator-form'
import type { TrainingProfile } from '@/lib/types/batch-prep'

export const metadata: Metadata = {
  title: 'Generate Batch Prep Plan',
  description: 'Generate AI-powered batch meal prep plans that hit your exact macros',
}

function computeDefaultProfile(userProfile: {
  target_calories?: number | null
  protein_grams?: number | null
  carb_grams?: number | null
  fat_grams?: number | null
}): TrainingProfile {
  const cal = userProfile.target_calories ?? 2500
  const protein = userProfile.protein_grams ?? 180
  const carbs = userProfile.carb_grams ?? 250
  const fat = userProfile.fat_grams ?? 70

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
    .select('target_calories, protein_grams, carb_grams, fat_grams, dietary_style, allergies')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileRow) {
    userDietType = profileRow.dietary_style ?? undefined
    userExclusions = profileRow.allergies ?? []
    if (!defaults) {
      if (!profileRow.target_calories) {
        return (
          <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
            <div className="max-w-md text-center">
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Complete Your Profile First
              </h1>
              <p className="text-muted-foreground mb-8">
                Please complete your onboarding to set your macro targets before generating batch prep plans.
              </p>
              <Link
                href="/onboarding/1"
                className="inline-flex h-14 items-center justify-center px-8 rounded-full bg-primary text-primary-foreground font-semibold text-base shadow-lg hover:bg-primary/90 transition-colors"
              >
                Complete Onboarding
              </Link>
            </div>
          </div>
        )
      }
      defaults = computeDefaultProfile(profileRow)
    }
  }

  if (!defaults) {
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
        Tell us your training schedule and we&apos;ll generate a batch cooking plan that hits
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
