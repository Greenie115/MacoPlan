'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'

type Goal = 'lose-weight' | 'build-muscle' | 'eat-healthier' | ''

interface SampleMeal {
  name: string
  protein: number
  carbs: number
  fat: number
  calories: number
}

const sampleMeals: Record<Exclude<Goal, ''>, SampleMeal[]> = {
  'lose-weight': [
    { name: 'Grilled Chicken Salad', protein: 42, carbs: 18, fat: 12, calories: 340 },
    { name: 'Turkey & Veggie Wrap', protein: 35, carbs: 32, fat: 10, calories: 360 },
    { name: 'Baked Salmon with Broccoli', protein: 38, carbs: 15, fat: 18, calories: 370 },
  ],
  'build-muscle': [
    { name: 'Steak & Sweet Potato', protein: 52, carbs: 48, fat: 22, calories: 590 },
    { name: 'Chicken Burrito Bowl', protein: 48, carbs: 62, fat: 18, calories: 610 },
    { name: 'Salmon & Quinoa Power Bowl', protein: 46, carbs: 55, fat: 24, calories: 620 },
  ],
  'eat-healthier': [
    { name: 'Mediterranean Quinoa Bowl', protein: 18, carbs: 45, fat: 16, calories: 390 },
    { name: 'Veggie Stir-Fry with Tofu', protein: 22, carbs: 38, fat: 14, calories: 360 },
    { name: 'Grilled Chicken & Roasted Veggies', protein: 36, carbs: 28, fat: 15, calories: 400 },
  ],
}

export function HeroDemo() {
  const [selectedGoal, setSelectedGoal] = useState<Goal>('')
  const [showResults, setShowResults] = useState(false)

  const handleShowSample = () => {
    if (selectedGoal) {
      setShowResults(true)
    }
  }

  const meals: SampleMeal[] = selectedGoal !== '' ? sampleMeals[selectedGoal as Exclude<Goal, ''>] : []
  const totalMacros = meals.reduce(
    (acc, meal) => ({
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
      calories: acc.calories + meal.calories,
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  )

  return (
    <div className="bg-card rounded-2xl border-2 border-border-strong shadow-xl p-6 md:p-8">
      <h3 className="text-xl font-bold mb-6 text-center">Try it yourself</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="goal-select">
            What&apos;s your goal?
          </label>
          <select
            id="goal-select"
            value={selectedGoal}
            onChange={(e) => {
              setSelectedGoal(e.target.value as Goal)
              setShowResults(false)
            }}
            className="w-full px-4 py-3 rounded-xl border border-border-strong bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            <option value="">Select your goal...</option>
            <option value="lose-weight">Lose weight</option>
            <option value="build-muscle">Build muscle</option>
            <option value="eat-healthier">Eat healthier</option>
          </select>
        </div>

        <button
          onClick={handleShowSample}
          disabled={!selectedGoal}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Show me a sample day
        </button>
      </div>

      {showResults && meals.length > 0 && (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="border-t border-border-strong pt-4">
            <h4 className="font-bold mb-3">Your Sample Day:</h4>

            <div className="space-y-3">
              {meals.map((meal, index) => (
                <div key={index} className="bg-accent/50 rounded-lg p-3">
                  <div className="font-semibold mb-2">{meal.name}</div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Protein</div>
                      <div className="font-bold text-protein">{meal.protein}g</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Carbs</div>
                      <div className="font-bold text-carb">{meal.carbs}g</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Fat</div>
                      <div className="font-bold text-fat">{meal.fat}g</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Calories</div>
                      <div className="font-bold">{meal.calories}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-primary/10 rounded-lg p-4">
              <div className="font-bold mb-3">Daily Totals</div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Protein</span>
                    <span className="font-semibold">{totalMacros.protein}g</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-protein rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Carbs</span>
                    <span className="font-semibold">{totalMacros.carbs}g</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-carb rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fat</span>
                    <span className="font-semibold">{totalMacros.fat}g</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-fat rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>
                <div className="pt-2 border-t border-border-strong">
                  <div className="flex justify-between font-bold">
                    <span>Total Calories</span>
                    <span>{totalMacros.calories}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Want the full week? <a href="/signup" className="text-primary font-semibold hover:underline">Sign up free.</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
