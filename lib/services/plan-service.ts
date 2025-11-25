import { createClient } from '@/lib/supabase/client'
import { Plan, PlanDay, PlanMeal } from '@/lib/types/plan'

export class PlanService {
  private supabase = createClient()

  async getPlans(userId: string): Promise<Plan[]> {
    const { data: plans, error } = await this.supabase
      .from('plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching plans:', error)
      return []
    }

    // For the list view, we might not need all days/meals, but let's fetch them or map them
    // For now, we'll return the plans with empty days array or fetch them if needed
    // To keep it simple and efficient, we might just return the plan metadata for the list
    // and fetch details when viewing a specific plan.
    
    return plans.map(p => ({
      id: p.id,
      title: p.title,
      dateRange: p.date_range,
      calories: p.target_calories,
      macros: {
        protein: p.target_protein,
        carbs: p.target_carbs,
        fat: p.target_fat
      },
      images: [], // We'd need to fetch these from meals or store them
      days: []
    }))
  }

  async getPlanById(id: string): Promise<Plan | null> {
    // Skip fetching dummy/test plans (they don't exist in the database)
    if (id.startsWith('00000000-0000-4000-8000-')) {
      console.log('Skipping dummy plan fetch:', id)
      return null
    }

    // 1. Fetch Plan
    const { data: plan, error: planError } = await this.supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single()

    if (planError || !plan) {
      console.error('Error fetching plan:', JSON.stringify(planError, null, 2))
      return null
    }

    // 2. Fetch Days
    const { data: days, error: daysError } = await this.supabase
      .from('plan_days')
      .select('*')
      .eq('plan_id', id)
      .order('order_index', { ascending: true })

    if (daysError) {
      console.error('Error fetching days:', daysError)
      return null
    }

    // 3. Fetch Meals for all days
    // We can do this in one query using 'in' or iterating.
    // Let's fetch all meals for these days.
    const dayIds = days.map(d => d.id)
    const { data: meals, error: mealsError } = await this.supabase
      .from('plan_meals')
      .select('*')
      .in('plan_day_id', dayIds)
      .order('order_index', { ascending: true })

    if (mealsError) {
      console.error('Error fetching meals:', mealsError)
      return null
    }

    // 4. Assemble the object
    const planDays: PlanDay[] = days.map(day => {
      const dayMeals = meals.filter(m => m.plan_day_id === day.id).map(m => ({
        id: m.id,
        name: m.name,
        type: m.type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        calories: m.calories,
        macros: {
          protein: m.protein_grams,
          carbs: m.carb_grams,
          fat: m.fat_grams
        },
        image: m.image_url || '',
        recipeId: m.recipe_id
      }))

      return {
        date: day.date,
        dayOfWeek: day.day_of_week,
        calories: day.total_calories,
        macros: {
          protein: day.total_protein,
          carbs: day.total_carbs,
          fat: day.total_fat
        },
        meals: dayMeals
      }
    })

    // Collect images for the plan preview (first 4 distinct images)
    const allImages = planDays.flatMap(d => d.meals.map(m => m.image)).filter(Boolean)
    const uniqueImages = Array.from(new Set(allImages)).slice(0, 4)

    return {
      id: plan.id,
      title: plan.title,
      dateRange: plan.date_range,
      calories: plan.target_calories,
      macros: {
        protein: plan.target_protein,
        carbs: plan.target_carbs,
        fat: plan.target_fat
      },
      images: uniqueImages,
      days: planDays
    }
  }
}
