import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/supabase/server'
import { getMealPlans, getMealPlanQuotaInfo } from '@/app/actions/meal-plans'
import { listBatchPrepPlans } from '@/lib/services/batch-prep-persistence'
import { MealPlansClient } from './_components/meal-plans-client'

export const metadata: Metadata = {
  title: 'My Meal Plans',
  description: 'View and manage your meal plans',
}

export default async function MealPlansPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch batch preps, legacy plans, and quota info in parallel
  const [batchPlans, plansResult, quotaResult] = await Promise.all([
    listBatchPrepPlans(user.id).catch(() => []),
    getMealPlans(),
    getMealPlanQuotaInfo(),
  ])

  const plans = plansResult.success ? plansResult.data || [] : []
  const quotaInfo = quotaResult.success && quotaResult.data ? quotaResult.data : null

  return (
    <MealPlansClient
      initialPlans={plans}
      batchPlans={batchPlans}
      quotaInfo={quotaInfo}
    />
  )
}
