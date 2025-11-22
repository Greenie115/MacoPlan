import { Plan } from '@/lib/types/plan'
import { PlanCard } from './plan-card'

interface PlanListProps {
  plans: Plan[]
}

export function PlanList({ plans }: PlanListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  )
}
