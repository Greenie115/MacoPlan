import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBatchPrepPlan } from '@/lib/services/batch-prep-persistence'
import { PrepTimeline } from '@/components/batch-prep/prep-timeline'
import type { PrepStep } from '@/lib/types/batch-prep'

export default async function PrepDayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const plan = await getBatchPrepPlan(user.id, id)
  if (!plan) notFound()

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <header>
        <Link
          href={`/meal-plans/${id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to plan
        </Link>
        <h1 className="text-3xl font-bold mt-2">Prep day</h1>
        <p className="text-muted-foreground">
          ~{plan.estimated_prep_time_mins} minutes &middot; {plan.total_containers} containers
        </p>
      </header>

      <PrepTimeline
        planId={plan.id}
        steps={plan.prep_timeline as PrepStep[]}
      />
    </main>
  )
}
