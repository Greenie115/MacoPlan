import { Metadata } from 'next'
import { redirect } from 'next/navigation'
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Complete Your Profile First</h1>
          <p className="text-muted-foreground mb-6">
            Please complete your onboarding to set your macro targets before generating meal plans.
          </p>
          <a
            href="/onboarding/1"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Complete Onboarding
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Generate Meal Plan</h1>
          <p className="text-muted-foreground">
            Create a personalized meal plan based on your macro targets and dietary preferences
          </p>
        </div>

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
      </div>
    </div>
  )
}
