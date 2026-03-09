import { Users, Star, Utensils } from 'lucide-react'

export function TrustBar() {
  return (
    <div className="bg-muted/30 border-y border-border-strong py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">10,000+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-muted-foreground">App Store Rating</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Utensils className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">2M+</div>
              <div className="text-sm text-muted-foreground">Meals Generated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
