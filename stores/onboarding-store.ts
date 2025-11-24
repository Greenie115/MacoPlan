import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateBMR } from '@/lib/calculations/bmr'
import { calculateTDEE } from '@/lib/calculations/tdee'
import { calculateTargetCalories, calculateMacros as calculateMacrosLib } from '@/lib/calculations/macros'

export type Goal = 'cut' | 'bulk' | 'maintain' | 'recomp'
export type ActivityLevel = 'sedentary' | 'lightly' | 'moderately' | 'very' | 'extremely'
export type Sex = 'male' | 'female'
export type WeightUnit = 'lbs' | 'kg'

// Step 4: Dietary Preferences
export type DietaryStyle = 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'paleo' | 'keto' | 'mediterranean'
export type Allergy = 'none' | 'peanuts' | 'tree_nuts' | 'dairy' | 'eggs' | 'soy' | 'gluten' | 'shellfish' | 'fish'

// Step 5: Experience Level
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type TrackingExperience = 'never' | 'some' | 'experienced'
export type MealPrepLevel = 'beginner' | 'intermediate' | 'advanced'

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

  // Step 4: Dietary Preferences
  dietaryStyle: DietaryStyle | null
  allergies: Allergy[]
  foodsToAvoid: string | null

  // Step 5: Experience Level
  fitnessExperience: ExperienceLevel | null
  trackingExperience: TrackingExperience | null
  mealPrepSkills: MealPrepLevel | null

  // Step 6: Calculated Results
  bmr: number | null
  tdee: number | null
  targetCalories: number | null
  proteinGrams: number | null
  carbGrams: number | null
  fatGrams: number | null

  // Custom Macros
  isCustomMacros: boolean
  customProteinGrams: number | null
  customCarbGrams: number | null
  customFatGrams: number | null

  // Error handling
  calculationError: string | null

  // Meta
  currentStep: number
  completedSteps: number[]

  // Actions
  setGoal: (goal: Goal) => void
  setPersonalStats: (stats: PersonalStats) => void
  setActivityLevel: (level: ActivityLevel) => void
  setDietaryPreferences: (prefs: {
    dietaryStyle?: DietaryStyle
    allergies?: Allergy[]
    foodsToAvoid?: string
  }) => void
  setExperienceLevel: (experience: {
    fitnessExperience: ExperienceLevel
    trackingExperience: TrackingExperience
    mealPrepSkills: MealPrepLevel
  }) => void
  calculateMacros: () => void
  setCustomMacros: (macros: { protein: number; carbs: number; fat: number }) => void
  resetToCalculated: () => void
  clearError: () => void
  resetOnboarding: () => void
  markStepComplete: (step: number) => void
  setCurrentStep: (step: number) => void
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
      dietaryStyle: null,
      allergies: [],
      foodsToAvoid: null,
      fitnessExperience: null,
      trackingExperience: null,
      mealPrepSkills: null,
      bmr: null,
      tdee: null,
      targetCalories: null,
      proteinGrams: null,
      carbGrams: null,
      fatGrams: null,
      isCustomMacros: false,
      customProteinGrams: null,
      customCarbGrams: null,
      customFatGrams: null,
      calculationError: null,
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

      setDietaryPreferences: (prefs) =>
        set({
          dietaryStyle: prefs.dietaryStyle ?? null,
          allergies: prefs.allergies ?? [],
          foodsToAvoid: prefs.foodsToAvoid ?? null,
        }),

      setExperienceLevel: (experience) =>
        set({
          fitnessExperience: experience.fitnessExperience,
          trackingExperience: experience.trackingExperience,
          mealPrepSkills: experience.mealPrepSkills,
        }),

      calculateMacros: () => {
        const state = get()

        // Clear any previous errors
        set({ calculationError: null })

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
          set({ calculationError: 'Missing required information. Please complete all previous steps.' })
          return
        }

        try {
          // Calculate total height in inches
          const totalHeightInches = state.heightFeet * 12 + state.heightInches

          // Convert weightUnit from 'lbs'/'kg' to 'imperial'/'metric'
          const unit = state.weightUnit === 'lbs' ? 'imperial' : 'metric'

          // Use imported calculation functions from lib
          const bmr = calculateBMR(
            state.weight,
            totalHeightInches,
            state.age,
            state.sex,
            unit
          )

          const tdee = calculateTDEE(bmr, state.activityLevel)
          const targetCalories = calculateTargetCalories(tdee, state.goal)
          const macros = calculateMacrosLib(
            targetCalories,
            state.goal,
            state.weight,
            state.weightUnit,
            state.activityLevel
          )

          set({
            bmr: Math.round(bmr),
            tdee,
            targetCalories,
            proteinGrams: macros.protein,
            carbGrams: macros.carbs,
            fatGrams: macros.fat,
            calculationError: null,
          })
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to calculate macros. Please check your inputs.'

          set({
            calculationError: errorMessage,
            bmr: null,
            tdee: null,
            targetCalories: null,
            proteinGrams: null,
            carbGrams: null,
            fatGrams: null,
          })
        }
      },

      clearError: () => set({ calculationError: null }),

      setCustomMacros: (macros) =>
        set({
          isCustomMacros: true,
          customProteinGrams: macros.protein,
          customCarbGrams: macros.carbs,
          customFatGrams: macros.fat,
        }),

      resetToCalculated: () =>
        set({
          isCustomMacros: false,
          customProteinGrams: null,
          customCarbGrams: null,
          customFatGrams: null,
        }),

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
          dietaryStyle: null,
          allergies: [],
          foodsToAvoid: null,
          fitnessExperience: null,
          trackingExperience: null,
          mealPrepSkills: null,
          bmr: null,
          tdee: null,
          targetCalories: null,
          proteinGrams: null,
          carbGrams: null,
          fatGrams: null,
          isCustomMacros: false,
          customProteinGrams: null,
          customCarbGrams: null,
          customFatGrams: null,
          calculationError: null,
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
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null
          try {
            const str = localStorage.getItem(name)
            return str ? JSON.parse(str) : null
          } catch (error) {
            console.warn('Failed to read from localStorage:', error)
            return null
          }
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return
          try {
            localStorage.setItem(name, JSON.stringify(value))
          } catch (error) {
            console.warn('Failed to write to localStorage:', error)
            // Fallback: try sessionStorage
            try {
              sessionStorage.setItem(name, JSON.stringify(value))
              console.info('Fell back to sessionStorage')
            } catch (sessionError) {
              console.error('Failed to write to sessionStorage:', sessionError)
              // At this point, data will be in memory only
            }
          }
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return
          try {
            localStorage.removeItem(name)
          } catch (error) {
            console.warn('Failed to remove from localStorage:', error)
          }
        },
      },
    }
  )
)
