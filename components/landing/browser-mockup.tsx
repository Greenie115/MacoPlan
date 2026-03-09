'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export function BrowserMockup() {
  const [activeDay, setActiveDay] = useState(0)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Auto-rotate days
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDay((prev) => (prev + 1) % 7)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const meals = [
    {
      type: 'Breakfast',
      name: 'Greek Yogurt Parfait',
      calories: 320,
      protein: 28,
      carbs: 32,
      fat: 8,
      time: 5,
      gradient: 'from-amber-400 via-orange-300 to-yellow-200',
      emoji: '🌅',
    },
    {
      type: 'Lunch',
      name: 'Grilled Chicken Salad',
      calories: 420,
      protein: 42,
      carbs: 18,
      fat: 22,
      time: 15,
      gradient: 'from-emerald-400 via-green-300 to-lime-200',
      emoji: '☀️',
    },
    {
      type: 'Dinner',
      name: 'Salmon & Quinoa Bowl',
      calories: 520,
      protein: 38,
      carbs: 45,
      fat: 24,
      time: 25,
      gradient: 'from-rose-400 via-pink-300 to-orange-200',
      emoji: '🌙',
    },
  ]

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0)
  const targetCalories = 1800
  const progress = Math.round((totalCalories / targetCalories) * 100)

  return (
    <div className="relative">
      {/* Browser window frame */}
      <div className="bg-card rounded-2xl shadow-2xl border border-border-strong overflow-hidden">
        {/* Browser header */}
        <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b border-border-strong">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-background rounded-lg px-4 py-1.5 text-sm text-muted-foreground flex items-center gap-2 max-w-md mx-auto">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>app.macroplan.com/meal-plan</span>
            </div>
          </div>
        </div>

        {/* Meal Plan View Content */}
        <div className="p-4 md:p-6 bg-background min-h-[420px]">
          {/* Plan Header */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-foreground">Weekly Meal Plan</h3>
            <p className="text-sm text-muted-foreground">Jan 6 - Jan 12, 2025</p>
          </div>

          {/* Daily Summary Card */}
          <div className="bg-card border border-border-strong rounded-2xl p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-base font-semibold text-foreground">
                Daily Average: {totalCalories.toLocaleString()} cal
              </p>
              <span className="text-sm text-muted-foreground">
                Target: {targetCalories.toLocaleString()}
              </span>
            </div>
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-primary min-w-[40px] text-right">
                {progress}%
              </span>
            </div>
            {/* Macro breakdown */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-protein">🥩 108g</span>
              <span className="text-sm font-medium text-carb">🍚 95g</span>
              <span className="text-sm font-medium text-fat">🥑 54g</span>
            </div>
          </div>

          {/* Day selector */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
            {days.map((day, index) => (
              <button
                key={day}
                onClick={() => setActiveDay(index)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                  index === activeDay
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Meal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {meals.map((meal, index) => (
              <div
                key={index}
                className="flex flex-col overflow-hidden rounded-xl bg-card border border-border-strong shadow-sm"
              >
                {/* Hero Image Placeholder with gradient */}
                <div className={`relative h-24 md:h-28 w-full bg-gradient-to-br ${meal.gradient}`}>
                  {/* Meal Type Badge */}
                  <div className="absolute top-2 left-2 bg-card/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-medium text-foreground">
                    {meal.emoji} {meal.type}
                  </div>
                </div>

                {/* Meal Info */}
                <div className="p-3 flex flex-col flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
                    {meal.name}
                  </h4>

                  {/* Calories and Time */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="font-medium text-foreground">{meal.calories} cal</span>
                    <span className="text-border">•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {meal.time} min
                    </span>
                  </div>

                  {/* Macros */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-protein">🥩 {meal.protein}g</span>
                    <span className="text-carb">🍚 {meal.carbs}g</span>
                    <span className="text-fat">🥑 {meal.fat}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -z-10 top-8 -right-8 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute -z-10 -bottom-8 -left-8 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />
    </div>
  )
}
