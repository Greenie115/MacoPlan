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
}
