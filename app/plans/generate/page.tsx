import { ArrowLeft, Zap, Flame, Utensils, Egg, Wheat } from 'lucide-react'
import Link from 'next/link'

export default function GeneratePlanPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Custom Header for this flow */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex h-[60px] items-center px-4 justify-between max-w-3xl mx-auto w-full">
          <Link href="/plans" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="size-6 text-gray-900" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Generate Meal Plan</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 space-y-8">
        {/* Plan Duration */}
        <section className="space-y-3">
          <h2 className="text-base font-medium text-gray-900 px-2">Plan Duration</h2>
          <div className="flex bg-gray-100 p-1.5 rounded-full">
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="duration" value="1" className="peer sr-only" />
              <span className="flex items-center justify-center py-2.5 text-sm font-semibold text-gray-500 rounded-full peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm transition-all">
                1 Day
              </span>
            </label>
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="duration" value="3" className="peer sr-only" />
              <span className="flex items-center justify-center py-2.5 text-sm font-semibold text-gray-500 rounded-full peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm transition-all">
                3 Days
              </span>
            </label>
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="duration" value="7" className="peer sr-only" defaultChecked />
              <span className="flex items-center justify-center py-2.5 text-sm font-semibold text-gray-500 rounded-full peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm transition-all">
                7 Days
              </span>
            </label>
          </div>
        </section>

        {/* Meals Per Day */}
        <section className="space-y-3">
          <h2 className="text-base font-medium text-gray-900 px-2">Meals Per Day</h2>
          <div className="flex bg-gray-100 p-1.5 rounded-full">
            {[3, 4, 5, 6].map((num) => (
              <label key={num} className="flex-1 cursor-pointer">
                <input type="radio" name="meals" value={num} className="peer sr-only" defaultChecked={num === 4} />
                <span className="flex items-center justify-center py-2.5 text-sm font-semibold text-gray-500 rounded-full peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm transition-all">
                  {num}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Dietary Preferences */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-base font-medium text-gray-900">Dietary Preferences</h2>
            <button className="text-sm font-semibold text-primary hover:underline">Edit</button>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 text-sm text-gray-600">
            <span className="text-green-600 font-bold">✓</span>
            Vegetarian, Gluten-Free
          </div>
        </section>

        {/* Target Macros */}
        <section className="space-y-3">
          <h2 className="text-base font-medium text-gray-900 px-2">Target Macros (per day)</h2>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-gray-50 p-3 rounded-xl text-center space-y-1">
              <Utensils className="size-6 text-primary mx-auto" />
              <p className="text-xs text-gray-500">Protein</p>
              <p className="text-sm font-bold text-gray-900">180g</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl text-center space-y-1">
              <Wheat className="size-6 text-primary mx-auto" />
              <p className="text-xs text-gray-500">Carbs</p>
              <p className="text-sm font-bold text-gray-900">280g</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl text-center space-y-1">
              <Egg className="size-6 text-primary mx-auto" />
              <p className="text-xs text-gray-500">Fat</p>
              <p className="text-sm font-bold text-gray-900">68g</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-xl text-center space-y-1">
              <Flame className="size-6 text-primary mx-auto" />
              <p className="text-xs text-primary font-medium">Total</p>
              <p className="text-sm font-bold text-primary">2,450</p>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <p className="text-center text-xs text-gray-500">Free Plan: 1 of 3 plans remaining</p>
          <Link 
            href="/plans/generated"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[0.98] active:scale-95 transition-all"
          >
            <Zap className="size-5 fill-current" />
            Generate in 3 Seconds
          </Link>
          <Link 
            href="/plans"
            className="flex h-14 w-full items-center justify-center rounded-full bg-transparent text-base font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </main>
    </div>
  )
}
