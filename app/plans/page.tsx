import { PlanList } from '@/components/plans/plan-list'
import { MOCK_PLANS } from '@/lib/data/mock-plans'
import { Plus, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import { PlanCard } from '@/components/plans/plan-card'

export default function PlansPage() {
  // Mock current plan as the first one for now
  const currentPlan = MOCK_PLANS[0]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex h-[60px] items-center px-4 justify-between max-w-7xl mx-auto w-full">
          <h1 className="text-xl font-bold text-gray-900">My Meal Plans</h1>
          <Link
            href="/plans/generate"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            <span>New Plan</span>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 space-y-8">
        {/* Current Plan Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              Current Plan
            </h2>
            <Link href={`/plans/${currentPlan.id}`} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              View Details <ArrowRight className="size-4" />
            </Link>
          </div>
          {/* Featured display for current plan - reusing PlanCard but could be more prominent */}
          <div className="max-w-md">
            <PlanCard plan={currentPlan} />
          </div>
        </section>

        {/* Saved Plans Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Saved Plans</h2>
            <button className="text-sm text-gray-500 hover:text-gray-900 font-medium">
              View All
            </button>
          </div>
          <PlanList plans={MOCK_PLANS} />
        </section>
      </main>
    </div>
  )
}
