import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Goal = 'cut' | 'bulk' | 'maintain' | 'recomp'
export type ActivityLevel = 'sedentary' | 'lightly' | 'moderately' | 'very' | 'extremely'
export type Sex = 'male' | 'female'
export type WeightUnit = 'lbs' | 'kg'

export interface PersonalStats {
  age: number
  weight: number
  weightUnit: WeightUnit
  heightFeet: number
  heightInches: number
  sex: Sex
}

interface OnboardingState {
  // Step 1: Goal Selection
  goal: Goal | null

  // Step 2: Personal Stats
  age: number | null
  weight: number | null
  weightUnit: WeightUnit
  heightFeet: number | null
  heightInches: number | null
  sex: Sex | null

  // Step 3: Activity Level
  activityLevel: ActivityLevel | null

  // Step 4-5: Additional preferences (to be defined)

  // Step 6: Calculated Results
  bmr: number | null
  tdee: number | null
  targetCalories: number | null
  proteinGrams: number | null
  carbGrams: number | null
  fatGrams: number | null

  // Meta
  currentStep: number
  completedSteps: number[]

  // Actions
  setGoal: (goal: Goal) => void
  setPersonalStats: (stats: PersonalStats) => void
  setActivityLevel: (level: ActivityLevel) => void
  calculateMacros: () => void
  resetOnboarding: () => void
  markStepComplete: (step: number) => void
  setCurrentStep: (step: number) => void
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly: 1.375,
  moderately: 1.55,
  very: 1.725,
  extremely: 1.9,
} as const

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 */
function calculateBMR(
  weight: number,
  heightInches: number,
  age: number,
  sex: Sex,
  weightUnit: WeightUnit
): number {
  // Convert to metric
  const weightKg = weightUnit === 'lbs' ? weight * 0.453592 : weight
  const heightCm = heightInches * 2.54

  // Mifflin-St Jeor Equation
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age

  // Sex adjustment
  return sex === 'male' ? baseBMR + 5 : baseBMR - 161
}

/**
 * Calculate Total Daily Energy Expenditure
 */
function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}

/**
 * Calculate target calories based on goal
 */
function calculateTargetCalories(tdee: number, goal: Goal): number {
  switch (goal) {
    case 'cut':
      return Math.round(tdee * 0.8) // 20% deficit
    case 'bulk':
      return Math.round(tdee * 1.1) // 10% surplus
    case 'maintain':
      return tdee
    case 'recomp':
      return tdee // Maintenance with specific macro ratios
  }
}

/**
 * Calculate macronutrient distribution
 */
function calculateMacroDistribution(
  targetCalories: number,
  goal: Goal,
  weight: number,
  weightUnit: WeightUnit
): { protein: number; carbs: number; fat: number } {
  const weightLbs = weightUnit === 'kg' ? weight * 2.20462 : weight

  // Protein: 0.8-1g per lb bodyweight (higher for cutting)
  const proteinMultiplier = goal === 'cut' ? 1.0 : 0.8
  const proteinGrams = Math.round(weightLbs * proteinMultiplier)
  const proteinCalories = proteinGrams * 4

  // Fat: 25-30% of total calories
  const fatPercentage = goal === 'bulk' ? 0.25 : 0.3
  const fatCalories = Math.round(targetCalories * fatPercentage)
  const fatGrams = Math.round(fatCalories / 9)

  // Carbs: Remaining calories
  const carbCalories = targetCalories - proteinCalories - fatCalories
  const carbGrams = Math.round(carbCalories / 4)

  return {
    protein: proteinGrams,
    carbs: Math.max(0, carbGrams), // Ensure non-negative
    fat: fatGrams,
  }
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial state
      goal: null,
      age: null,
      weight: null,
      weightUnit: 'lbs',
      heightFeet: null,
      heightInches: null,
      sex: null,
      activityLevel: null,
      bmr: null,
      tdee: null,
      targetCalories: null,
      proteinGrams: null,
      carbGrams: null,
      fatGrams: null,
      currentStep: 1,
      completedSteps: [],

      // Actions
      setGoal: (goal) => set({ goal }),

      setPersonalStats: (stats) =>
        set({
          age: stats.age,
          weight: stats.weight,
          weightUnit: stats.weightUnit,
          heightFeet: stats.heightFeet,
          heightInches: stats.heightInches,
          sex: stats.sex,
        }),

      setActivityLevel: (level) => set({ activityLevel: level }),

      calculateMacros: () => {
        const state = get()

        // Validate required fields
        if (
          !state.goal ||
          !state.age ||
          !state.weight ||
          !state.heightFeet ||
          state.heightInches === null ||
          !state.sex ||
          !state.activityLevel
        ) {
          console.error('Missing required fields for macro calculation')
          return
        }

        // Calculate total height in inches
        const totalHeightInches = state.heightFeet * 12 + state.heightInches

        // Calculate BMR
        const bmr = calculateBMR(
          state.weight,
          totalHeightInches,
          state.age,
          state.sex,
          state.weightUnit
        )

        // Calculate TDEE
        const tdee = calculateTDEE(bmr, state.activityLevel)

        // Calculate target calories
        const targetCalories = calculateTargetCalories(tdee, state.goal)

        // Calculate macro distribution
        const macros = calculateMacroDistribution(
          targetCalories,
          state.goal,
          state.weight,
          state.weightUnit
        )

        set({
          bmr: Math.round(bmr),
          tdee,
          targetCalories,
          proteinGrams: macros.protein,
          carbGrams: macros.carbs,
          fatGrams: macros.fat,
        })
      },

      resetOnboarding: () =>
        set({
          goal: null,
          age: null,
          weight: null,
          weightUnit: 'lbs',
          heightFeet: null,
          heightInches: null,
          sex: null,
          activityLevel: null,
          bmr: null,
          tdee: null,
          targetCalories: null,
          proteinGrams: null,
          carbGrams: null,
          fatGrams: null,
          currentStep: 1,
          completedSteps: [],
        }),

      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: Array.from(new Set([...state.completedSteps, step])).sort(),
        })),

      setCurrentStep: (step) => set({ currentStep: step }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
)
