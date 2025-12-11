import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MealPlanGeneratorForm from '@/components/meal-plans/meal-plan-generator-form'

export const metadata: Metadata = {
  title: 'Generate Meal Plan | MacroPlan',
  description: 'Generate personalized meal plans based on your macro targets',
}

export default async function GenerateMealPlanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile for displaying targets
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('target_calories, protein_grams, carb_grams, fat_grams, dietary_style, allergies')
    .eq('user_id', user.id)
    .single()

  if (!profile || !profile.target_calories) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">🎯</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Complete Your Profile First
          </h1>
          <p className="text-gray-600 mb-8">
            Please complete your onboarding to set your macro targets before generating meal plans.
          </p>
          <Link
            href="/onboarding/1"
            className="inline-flex h-14 items-center justify-center px-8 rounded-full bg-[#F97316] text-white font-semibold text-base shadow-lg hover:bg-[#EA580C] transition-colors"
          >
            Complete Onboarding
          </Link>
        </div>
      </div>
    )
  }

  return (
    <MealPlanGeneratorForm
      userProfile={{
        targetCalories: profile.target_calories,
        proteinGrams: profile.protein_grams || 0,
        carbGrams: profile.carb_grams || 0,
        fatGrams: profile.fat_grams || 0,
        dietaryStyle: profile.dietary_style,
        allergies: profile.allergies || [],
      }}
    />
  )
}
