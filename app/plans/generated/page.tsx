'use client'

import { PlanDetailView } from '@/components/plans/plan-detail-view'
import { Plan } from '@/lib/types/plan'

// Temporary mock data that matches the previous hardcoded content
const GENERATED_PLAN: Plan = {
  id: 'generated-1',
  title: 'Your 7-Day Meal Plan',
  dateRange: 'Nov 5 - Nov 11, 2025',
  calories: 2465,
  macros: {
    protein: 182,
    carbs: 278,
    fat: 69,
  },
  images: [],
  days: [
    {
      date: 'Nov 5',
      dayOfWeek: 'Mon',
      calories: 2450,
      macros: { protein: 180, carbs: 280, fat: 65 },
      meals: [
        {
          id: 'm1',
          name: 'Greek Yogurt Power Bowl',
          type: 'breakfast',
          calories: 550,
          macros: { protein: 35, carbs: 60, fat: 12 },
          image: 'https://images.unsplash.com/photo-1488477181946-6428a029177b?auto=format&fit=crop&w=800&q=80',
        },
        {
          id: 'm2',
          name: 'Grilled Chicken Salad',
          type: 'lunch',
          calories: 750,
          macros: { protein: 55, carbs: 40, fat: 25 },
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        },
        {
          id: 'm3',
          name: 'Salmon with Asparagus',
          type: 'dinner',
          calories: 800,
          macros: { protein: 60, carbs: 120, fat: 20 },
          image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=800&q=80',
        },
        {
          id: 'm4',
          name: 'Protein Shake',
          type: 'snack',
          calories: 350,
          macros: { protein: 30, carbs: 60, fat: 8 },
          image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    // Add placeholders for other days to make the day selector work
    ...['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({
      date: `Nov ${6 + index}`,
      dayOfWeek: day,
      calories: 2400,
      macros: { protein: 180, carbs: 280, fat: 65 },
      meals: [],
    })),
  ],
}

export default function GeneratedPlanPage() {
  return <PlanDetailView plan={GENERATED_PLAN} isGenerated={true} />
}
