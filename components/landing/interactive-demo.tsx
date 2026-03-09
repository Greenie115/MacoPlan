'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type DemoGoal = 'lose-weight' | 'build-muscle' | 'maintain' | ''

interface DemoMeal {
  mealType: string
  name: string
  protein: number
  carbs: number
  fat: number
  calories: number
}

const demoMealPlans: Record<Exclude<DemoGoal, ''>, DemoMeal[]> = {
  'lose-weight': [
    { mealType: 'Breakfast', name: 'Greek Yogurt Parfait', protein: 28, carbs: 35, fat: 8, calories: 320 },
    { mealType: 'Lunch', name: 'Grilled Chicken Salad', protein: 42, carbs: 18, fat: 12, calories: 340 },
    { mealType: 'Snack', name: 'Apple with Almond Butter', protein: 6, carbs: 22, fat: 10, calories: 200 },
    { mealType: 'Dinner', name: 'Baked Salmon with Broccoli', protein: 38, carbs: 15, fat: 18, calories: 370 },
  ],
  'build-muscle': [
    { mealType: 'Breakfast', name: 'Protein Pancakes & Berries', protein: 35, carbs: 52, fat: 14, calories: 460 },
    { mealType: 'Lunch', name: 'Steak & Sweet Potato', protein: 52, carbs: 48, fat: 22, calories: 590 },
    { mealType: 'Snack', name: 'Protein Shake & Banana', protein: 30, carbs: 35, fat: 6, calories: 310 },
    { mealType: 'Dinner', name: 'Chicken Burrito Bowl', protein: 48, carbs: 62, fat: 18, calories: 610 },
  ],
  'maintain': [
    { mealType: 'Breakfast', name: 'Avocado Toast & Eggs', protein: 22, carbs: 38, fat: 18, calories: 390 },
    { mealType: 'Lunch', name: 'Turkey & Veggie Wrap', protein: 35, carbs: 32, fat: 10, calories: 360 },
    { mealType: 'Snack', name: 'Trail Mix', protein: 8, carbs: 25, fat: 14, calories: 250 },
    { mealType: 'Dinner', name: 'Mediterranean Quinoa Bowl', protein: 28, carbs: 45, fat: 16, calories: 430 },
  ],
}

export function InteractiveDemo() {
  const [goal, setGoal] = useState<DemoGoal>('')
  const [activityLevel, setActivityLevel] = useState('')
  const [showPlan, setShowPlan] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    if (goal && activityLevel) {
      setIsGenerating(true)
      setTimeout(() => {
        setIsGenerating(false)
        setShowPlan(true)
      }, 1500)
    }
  }

  const meals: DemoMeal[] = goal !== '' ? demoMealPlans[goal as Exclude<DemoGoal, ''>] : []
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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">See it in action</h2>
          <p className="text-lg text-muted-foreground">
            Generate a sample day in 10 seconds. No signup required.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl border-2 border-border-strong shadow-2xl p-8">
            {!showPlan ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="demo-goal">
                    What&apos;s your fitness goal?
                  </label>
                  <select
                    id="demo-goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as DemoGoal)}
                    className="w-full px-4 py-3 rounded-xl border border-border-strong bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">Select your goal...</option>
                    <option value="lose-weight">Lose weight</option>
                    <option value="build-muscle">Build muscle</option>
                    <option value="maintain">Maintain weight</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="demo-activity">
                    How active are you?
                  </label>
                  <select
                    id="demo-activity"
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border-strong bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">Select activity level...</option>
                    <option value="sedentary">Sedentary (office job)</option>
                    <option value="light">Lightly active (1-3 days/week)</option>
                    <option value="moderate">Moderately active (3-5 days/week)</option>
                    <option value="very">Very active (6-7 days/week)</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!goal || !activityLevel || isGenerating}
                  className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generating your plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate My Sample Day
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between pb-4 border-b border-border-strong">
                  <h3 className="text-xl font-bold">Your Personalized Day</h3>
                  <button
                    onClick={() => {
                      setShowPlan(false)
                      setGoal('')
                      setActivityLevel('')
                    }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Start over
                  </button>
                </div>

                <div className="space-y-4">
                  {meals.map((meal, index) => (
                    <div key={index} className="bg-accent/30 rounded-xl p-4 border border-border-strong">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {meal.mealType}
                          </div>
                          <div className="text-lg font-bold mt-1">{meal.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Calories</div>
                          <div className="text-xl font-bold text-primary">{meal.calories}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center bg-card rounded-lg py-2">
                          <div className="text-xs text-muted-foreground">Protein</div>
                          <div className="text-sm font-bold text-protein">{meal.protein}g</div>
                        </div>
                        <div className="text-center bg-card rounded-lg py-2">
                          <div className="text-xs text-muted-foreground">Carbs</div>
                          <div className="text-sm font-bold text-carb">{meal.carbs}g</div>
                        </div>
                        <div className="text-center bg-card rounded-lg py-2">
                          <div className="text-xs text-muted-foreground">Fat</div>
                          <div className="text-sm font-bold text-fat">{meal.fat}g</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/10 rounded-xl p-6 border-2 border-primary/20">
                  <div className="text-center mb-4">
                    <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Daily Totals
                    </div>
                    <div className="text-3xl font-bold text-primary mt-1">
                      {totalMacros.calories} calories
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-protein">{totalMacros.protein}g</div>
                      <div className="text-xs text-muted-foreground">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-carb">{totalMacros.carbs}g</div>
                      <div className="text-xs text-muted-foreground">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-fat">{totalMacros.fat}g</div>
                      <div className="text-xs text-muted-foreground">Fat</div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/signup"
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 text-center"
                >
                  Get My Full Week <ArrowRight className="inline w-5 h-5 ml-2" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
