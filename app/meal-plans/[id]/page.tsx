import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMealPlanById } from '@/app/actions/meal-plans'
import MealPlanView from '@/components/meal-plans/meal-plan-view'

export const metadata: Metadata = {
  title: 'Meal Plan | MacroPlan',
  description: 'View your meal plan details',
}

export default async function MealPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Next.js 16: params is now a Promise
  const { id } = await params
  const result = await getMealPlanById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <MealPlanView plan={result.data.plan} meals={result.data.meals} />
  )
}
