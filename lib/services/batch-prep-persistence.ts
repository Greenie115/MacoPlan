import { createClient } from '@/lib/supabase/server'
import type { BatchPrepPlan, DayPlan, TrainingProfile } from '@/lib/types/batch-prep'

function startOfWeekISO(): string {
  const now = new Date()
  const day = now.getUTCDay() // 0 = Sunday
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + mondayOffset)
  return monday.toISOString().split('T')[0]
}

export async function persistBatchPrepPlan(
  userId: string,
  plan: BatchPrepPlan,
  profileSnapshot: TrainingProfile
): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('batch_prep_plans')
    .insert({
      user_id: userId,
      week_starting: startOfWeekISO(),
      training_day_plan: plan.training_day,
      rest_day_plan: plan.rest_day,
      prep_timeline: plan.prep_timeline,
      shopping_list: plan.shopping_list,
      container_assignments: plan.container_assignments,
      total_containers: plan.total_containers,
      estimated_prep_time_mins: plan.estimated_prep_time_mins,
      generation_params: profileSnapshot,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to persist batch prep plan: ${error.message}`)
  return data.id
}

export async function upsertTrainingProfile(
  userId: string,
  profile: TrainingProfile
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('user_training_profile').upsert(
    {
      user_id: userId,
      training_days_per_week: profile.training_days_per_week,
      training_day_macros: profile.training_day_macros,
      rest_day_macros: profile.rest_day_macros,
      prep_day: profile.prep_day,
      containers_per_week: profile.containers_per_week,
      max_prep_time_mins: profile.max_prep_time_mins,
    },
    { onConflict: 'user_id' }
  )
  if (error) throw new Error(`Failed to upsert training profile: ${error.message}`)
}

export async function getTrainingProfile(userId: string): Promise<TrainingProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_training_profile')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null

  return {
    training_days_per_week: data.training_days_per_week,
    training_day_macros: data.training_day_macros,
    rest_day_macros: data.rest_day_macros,
    prep_day: data.prep_day,
    containers_per_week: data.containers_per_week,
    max_prep_time_mins: data.max_prep_time_mins,
  }
}

export async function getBatchPrepPlan(userId: string, id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('batch_prep_plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch batch prep plan: ${error.message}`)
  return data
}

export interface BatchPrepPlanSummary {
  id: string
  week_starting: string
  total_containers: number
  estimated_prep_time_mins: number
  created_at: string
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
}

export async function listBatchPrepPlans(userId: string): Promise<BatchPrepPlanSummary[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('batch_prep_plans')
    .select('id, week_starting, total_containers, estimated_prep_time_mins, created_at, generation_params')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to list batch prep plans: ${error.message}`)

  return (data ?? []).map((row) => {
    const macros = (row.generation_params as TrainingProfile | null)?.training_day_macros
    return {
      id: row.id,
      week_starting: row.week_starting,
      total_containers: row.total_containers,
      estimated_prep_time_mins: row.estimated_prep_time_mins,
      created_at: row.created_at,
      calories: macros?.calories ?? null,
      protein_g: macros?.protein_g ?? null,
      carbs_g: macros?.carbs_g ?? null,
      fat_g: macros?.fat_g ?? null,
    }
  })
}

/**
 * Recipe names from the user's most recent plans, used to steer the
 * generator away from repeating last week's meals.
 */
export async function getRecentRecipeNames(
  userId: string,
  planLimit: number = 3
): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('batch_prep_plans')
    .select('training_day_plan, rest_day_plan')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(planLimit)

  if (error || !data) return []

  const names = new Set<string>()
  for (const row of data) {
    for (const dayPlan of [row.training_day_plan, row.rest_day_plan]) {
      for (const meal of (dayPlan as DayPlan | null)?.meals ?? []) {
        if (meal?.name) names.add(meal.name)
      }
    }
  }
  return [...names]
}

export async function countBatchPrepPlans(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('batch_prep_plans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) return 0
  return count ?? 0
}
