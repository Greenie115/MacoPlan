import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBatchPrepPlan } from '@/lib/services/batch-prep-persistence'
import { PlanView } from '@/components/batch-prep/plan-view'
import type {
  DayPlan,
  ShoppingItem,
  ContainerAssignment,
} from '@/lib/types/batch-prep'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your prep plan',
  description: 'View your batch meal prep plan',
}

export default async function MealPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const plan = await getBatchPrepPlan(user.id, id)

  if (!plan) {
    // Could be a legacy meal_plans row — render fallback
    const { data: legacy } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (legacy) {
      return (
        <main className="max-w-2xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Legacy plan</h1>
          <p className="text-muted-foreground mb-6">
            This plan was created before the batch prep update. Generate a new batch prep plan to
            see the new experience.
          </p>
          <a
            href="/meal-plans/generate"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded"
          >
            Generate new plan
          </a>
        </main>
      )
    }

    notFound()
  }

  return (
    <PlanView
      planId={plan.id}
      trainingDay={plan.training_day_plan as DayPlan}
      restDay={plan.rest_day_plan as DayPlan}
      shoppingList={plan.shopping_list as ShoppingItem[]}
      containerAssignments={plan.container_assignments as ContainerAssignment[]}
      totalContainers={plan.total_containers}
      estimatedPrepTimeMins={plan.estimated_prep_time_mins}
    />
  )
}
