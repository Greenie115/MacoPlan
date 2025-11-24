export interface PlanMeal {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  calories: number
  macros: {
    protein: number
    carbs: number
    fat: number
  }
  image: string
  recipeId?: string
}

export interface PlanDay {
  date: string
  dayOfWeek: string
  calories: number
  macros: {
    protein: number
    carbs: number
    fat: number
  }
  meals: PlanMeal[]
}

export interface Plan {
  id: string
  title: string
  dateRange: string
  calories: number
  macros: {
    protein: number
    carbs: number
    fat: number
  }
  images: string[]
  days?: PlanDay[] // Optional for now to be backward compatible with list view
}
