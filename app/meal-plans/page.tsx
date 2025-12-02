import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMealPlans } from '@/app/actions/meal-plans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'My Meal Plans | MacroPlan',
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

  const result = await getMealPlans()
  const plans = result.success ? result.data || [] : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Meal Plans</h1>
            <p className="text-muted-foreground">
              {plans.length === 0
                ? 'Generate your first meal plan to get started'
                : `${plans.length} meal plan${plans.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/meal-plans/generate">
            <Button size="lg">+ Generate New Plan</Button>
          </Link>
        </div>

        {plans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center mb-6">
                You haven't generated any meal plans yet.
                <br />
                Create your first personalized meal plan now!
              </p>
              <Link href="/meal-plans/generate">
                <Button>Generate Meal Plan</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <Link key={plan.id} href={`/meal-plans/${plan.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>
                          {plan.description}
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{plan.total_days} day{plan.total_days !== 1 ? 's' : ''}</p>
                        <p>{plan.target_calories} kcal/day</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex gap-4">
                        <span>
                          <strong>{plan.protein_grams}g</strong> protein
                        </span>
                        <span>
                          <strong>{plan.carb_grams}g</strong> carbs
                        </span>
                        <span>
                          <strong>{plan.fat_grams}g</strong> fat
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(plan.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
