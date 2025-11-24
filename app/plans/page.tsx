'use client'

import { PlanList } from '@/components/plans/plan-list'
import { PlanTabs } from '@/components/plans/plan-tabs'
import { Plus, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PlanService } from '@/lib/services/plan-service'
import { Plan } from '@/lib/types/plan'
import { createClient } from '@/lib/supabase/client'

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const planService = new PlanService()
  const supabase = createClient()

  useEffect(() => {
    async function fetchPlans() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const userPlans = await planService.getPlans(user.id)
        setPlans(userPlans)
      }
      setLoading(false)
    }
    fetchPlans()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">My Plans</h1>
          <Link href="/plans/generate">
            <button className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
              <Plus className="size-6" />
            </button>
          </Link>
        </div>
        
        {/* Current Plan Card (Placeholder logic for now) */}
        {plans.length > 0 && (
          <div className="bg-primary rounded-2xl p-4 text-white shadow-lg shadow-primary/20 mb-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <Calendar className="size-4" />
                <span className="text-xs font-bold">Current Plan</span>
              </div>
              <span className="text-sm font-medium opacity-90">{plans[0].dateRange}</span>
            </div>
            <h2 className="text-xl font-bold mb-1">{plans[0].title}</h2>
            <div className="flex items-center gap-2 text-sm opacity-90 mb-4">
              <span>{plans[0].calories} cal</span>
              <span>•</span>
              <span>{plans[0].macros.protein}g Protein</span>
            </div>
            <Link 
              href={`/plans/${plans[0].id}`}
              className="flex items-center justify-between bg-white text-primary px-4 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              View Today's Meals
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </header>

      <main className="p-4 space-y-6">
        {/* Saved Plans Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Saved Plans</h2>
            <Link href="/plans?tab=all" className="text-sm text-gray-500 hover:text-gray-900 font-medium">
              View All
            </Link>
          </div>
          <PlanTabs />
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading plans...</div>
          ) : plans.length > 0 ? (
            <PlanList plans={plans} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No saved plans yet.</p>
              <Link href="/plans/generate" className="text-primary font-bold mt-2 inline-block">
                Generate your first plan
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
