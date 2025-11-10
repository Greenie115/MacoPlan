import { BottomNav } from '@/components/layout/bottom-nav'
import { TopAppBar } from '@/components/layout/top-app-bar'

export default function PlanDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopAppBar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <h1 className="text-2xl font-bold text-charcoal">Plan Details</h1>
          <p className="text-muted-foreground">Plan ID: {params.id}</p>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </div>
      <BottomNav activeTab="plans" />
    </div>
  )
}
