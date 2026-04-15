import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMealPlans, getMealPlanQuotaInfo } from '@/app/actions/meal-plans'
import { MealPlansClient } from './_components/meal-plans-client'

export const metadata: Metadata = {
  title: 'My Meal Plans | Macro Plan',
  description: 'View and manage your meal plans',
}

export default async function MealPlansPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch plans and quota info in parallel
  const [plansResult, quotaResult] = await Promise.all([
    getMealPlans(),
    getMealPlanQuotaInfo(),
  ])

  const plans = plansResult.success ? plansResult.data || [] : []
  const quotaInfo = quotaResult.success && quotaResult.data ? quotaResult.data : null

  return (
    <MealPlansClient
      initialPlans={plans}
      quotaInfo={quotaInfo}
    />
  )
}
