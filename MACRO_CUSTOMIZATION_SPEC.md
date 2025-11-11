# Macro Customization Feature - Technical Specification

## Overview

Add the ability for users to manually customize their calculated macros on Step 6 (onboarding results page) using either manual grams entry or percentage-based adjustment.

---

## 1. State Management Changes

### Zustand Store Extensions (stores/onboarding-store.ts)

Add new state properties:
```typescript
interface OnboardingState {
  // ... existing properties ...

  // New properties for customization
  isCustomMacros: boolean  // Track if user is using custom values
  customProteinGrams: number | null
  customCarbGrams: number | null
  customFatGrams: number | null

  // New actions
  setCustomMacros: (macros: { protein: number; carbs: number; fat: number }) => void
  resetToCalculated: () => void
}
```

**State Logic**:
- When `isCustomMacros === false`: Display calculated values from `proteinGrams`, `carbGrams`, `fatGrams`
- When `isCustomMacros === true`: Display custom values from `customProteinGrams`, `customCarbGrams`, `customFatGrams`
- `resetToCalculated()`: Sets `isCustomMacros = false` and clears custom values

---

## 2. Component Architecture

### Components to Create

**A. MacroCustomizer Component** (`components/onboarding/macro-customizer.tsx`)
- Main component for customization interface
- Manages local state for input mode (grams vs percentage)
- Handles all validation logic
- Props:
  ```typescript
  interface MacroCustomizerProps {
    targetCalories: number
    calculatedProtein: number
    calculatedCarbs: number
    calculatedFat: number
    currentProtein: number  // Could be calculated or custom
    currentCarbs: number
    currentFat: number
    isCustom: boolean
    weightKg: number  // For minimum fat validation
    onSave: (macros: { protein: number; carbs: number; fat: number }) => void
    onReset: () => void
  }
  ```

**B. MacroInput Component** (`components/onboarding/macro-input.tsx`)
- Reusable input field for each macro
- Props:
  ```typescript
  interface MacroInputProps {
    label: string  // "Protein", "Carbs", "Fat"
    value: number
    onChange: (value: number) => void
    mode: 'grams' | 'percentage'
    targetCalories?: number  // For percentage calculations
    error?: string
    min?: number
    max?: number
  }
  ```

**C. MacroSummary Component** (`components/onboarding/macro-summary.tsx`)
- Displays current macro breakdown
- Shows calculated vs custom indicator
- Props:
  ```typescript
  interface MacroSummaryProps {
    protein: number
    carbs: number
    fat: number
    targetCalories: number
    isCustom: boolean
    showCustomizeButton?: boolean
    onCustomizeClick?: () => void
  }
  ```

### Components to Modify

**app/(auth)/onboarding/6/page.tsx**
- Add conditional rendering for customization interface
- Pass calculated and custom values to components
- Handle save/reset actions

---

## 3. UI/UX Design

### Initial State (Not Customizing)

```
┌─────────────────────────────────────────┐
│ Your Personalized Macro Plan            │
│                                          │
│ Daily Calorie Target: 2,225 cal         │
│                                          │
│ ┌──────────────────────────────────┐   │
│ │ Protein    158g    632 cal       │   │
│ │ ████████░░░░░░░░░░ 28%          │   │
│ │                                  │   │
│ │ Carbs      288g    1,152 cal     │   │
│ │ ████████████████████░░ 52%      │   │
│ │                                  │   │
│ │ Fat        49g     441 cal       │   │
│ │ ████████░░░░░░░░░░ 20%          │   │
│ └──────────────────────────────────┘   │
│                                          │
│ Based on ISSN evidence-based research   │
│                                          │
│ [Customize Macros]                       │
│                                          │
│ [Continue to Dashboard →]                │
└─────────────────────────────────────────┘
```

### Customization State (Grams Mode)

```
┌─────────────────────────────────────────┐
│ Customize Your Macros                    │
│                                          │
│ Target: 2,225 cal                        │
│                                          │
│ Mode: [Grams] [Percentage]              │
│                                          │
│ Protein (g)                              │
│ [158    ] 632 cal                       │
│ Min: 141g recommended                    │
│                                          │
│ Carbs (g)                                │
│ [288    ] 1,152 cal                     │
│                                          │
│ Fat (g)                                  │
│ [49     ] 441 cal                       │
│ Min: 44g (hormone health)                │
│                                          │
│ Total: 2,225 cal ✓                      │
│                                          │
│ [Reset to Calculated] [Save]            │
└─────────────────────────────────────────┘
```

### Customization State (Percentage Mode)

```
┌─────────────────────────────────────────┐
│ Customize Your Macros                    │
│                                          │
│ Target: 2,225 cal                        │
│                                          │
│ Mode: [Grams] [Percentage]              │
│                                          │
│ Protein (%)                              │
│ [28     ] → 158g (632 cal)              │
│ Min: 25% recommended                     │
│                                          │
│ Carbs (%)                                │
│ [52     ] → 288g (1,152 cal)            │
│                                          │
│ Fat (%)                                  │
│ [20     ] → 49g (441 cal)               │
│ Min: 18% (hormone health)                │
│                                          │
│ Total: 100% ✓                           │
│                                          │
│ [Reset to Calculated] [Save]            │
└─────────────────────────────────────────┘
```

---

## 4. Validation Logic

### Validation Rules

**A. Total Calories Validation (Grams Mode)**
```typescript
const totalCalories = (protein * 4) + (carbs * 4) + (fat * 9)
const difference = Math.abs(totalCalories - targetCalories)
const isValid = difference <= 50  // Allow ±50 cal tolerance

if (difference > 50) {
  error = `Total is ${totalCalories} cal (${difference > 0 ? '+' : ''}${totalCalories - targetCalories} from target)`
}
```

**B. Total Percentage Validation (Percentage Mode)**
```typescript
const totalPercentage = proteinPct + carbsPct + fatPct
const isValid = Math.abs(totalPercentage - 100) <= 1  // Allow ±1% tolerance

if (Math.abs(totalPercentage - 100) > 1) {
  error = `Total is ${totalPercentage}% (must equal 100%)`
}
```

**C. Minimum Protein Validation**
```typescript
// ISSN minimum: 1.6 g/kg for active individuals
const minProteinGrams = Math.round(weightKg * 1.6)
const minProteinPct = Math.round((minProteinGrams * 4 / targetCalories) * 100)

if (proteinGrams < minProteinGrams) {
  warning = `Below recommended minimum (${minProteinGrams}g)`
}
```

**D. Minimum Fat Validation**
```typescript
// Hormone health minimum: 0.5 g/kg
const minFatGrams = Math.round(weightKg * 0.5)
const minFatPct = Math.round((minFatGrams * 9 / targetCalories) * 100)

if (fatGrams < minFatGrams) {
  error = `Below minimum for hormone health (${minFatGrams}g)`
}
```

**E. Range Validation**
```typescript
// Grams mode
if (value < 0) error = "Must be positive"
if (value > 1000) error = "Value too high"

// Percentage mode
if (value < 0) error = "Must be positive"
if (value > 100) error = "Cannot exceed 100%"
```

### Validation States

1. **Valid**: Green checkmark, allow save
2. **Warning**: Yellow warning icon, allow save but show warning message
3. **Error**: Red X icon, disable save button, show error message

---

## 5. Data Flow

### Customization Flow

```
User clicks "Customize Macros"
  ↓
Load calculated values into local state
  ↓
User switches mode (grams ↔ percentage)
  ↓
User adjusts values
  ↓
Real-time validation on each change
  ↓
Update display (calories, percentages, warnings)
  ↓
User clicks "Save"
  ↓
Final validation check
  ↓
Call store.setCustomMacros({ protein, carbs, fat })
  ↓
Set isCustomMacros = true
  ↓
Exit customization mode
  ↓
Display saved custom macros
```

### Reset Flow

```
User clicks "Reset to Calculated"
  ↓
Call store.resetToCalculated()
  ↓
Set isCustomMacros = false
  ↓
Clear custom values
  ↓
Exit customization mode
  ↓
Display calculated macros
```

### Conversion Logic

**Grams → Percentage**:
```typescript
const proteinPct = Math.round((proteinGrams * 4 / targetCalories) * 100)
const carbsPct = Math.round((carbsGrams * 4 / targetCalories) * 100)
const fatPct = Math.round((fatGrams * 9 / targetCalories) * 100)
```

**Percentage → Grams**:
```typescript
const proteinGrams = Math.round((proteinPct / 100) * targetCalories / 4)
const carbsGrams = Math.round((carbsPct / 100) * targetCalories / 4)
const fatGrams = Math.round((fatPct / 100) * targetCalories / 9)
```

---

## 6. Edge Cases & Error Handling

### Edge Case 1: Mode Switching
**Issue**: When switching from grams to percentage, rounding errors may cause totals to not equal 100%

**Solution**: When converting to percentage mode, adjust the largest macro by 1-2% to ensure total = 100%

```typescript
function ensureTotal100(protein: number, carbs: number, fat: number): [number, number, number] {
  let total = protein + carbs + fat
  if (total === 100) return [protein, carbs, fat]

  // Adjust largest value
  const largest = Math.max(protein, carbs, fat)
  const diff = 100 - total

  if (carbs === largest) carbs += diff
  else if (protein === largest) protein += diff
  else fat += diff

  return [protein, carbs, fat]
}
```

### Edge Case 2: Very Low Calorie Targets
**Issue**: Users with very low target calories may not be able to meet minimum protein and fat requirements

**Solution**: Show error message and disable customization if target calories < (minProtein * 4 + minFat * 9)

```typescript
const minTotalCalories = (minProteinGrams * 4) + (minFatGrams * 9)
if (targetCalories < minTotalCalories) {
  return <ErrorMessage>Target calories too low to customize macros safely</ErrorMessage>
}
```

### Edge Case 3: Invalid Input
**Issue**: User enters non-numeric values, negative numbers, or extremely large values

**Solution**:
- Input type="number" with min/max attributes
- Additional JavaScript validation on change
- Sanitize input before saving

```typescript
function sanitizeInput(value: string, min: number, max: number): number {
  const num = parseFloat(value)
  if (isNaN(num)) return min
  return Math.max(min, Math.min(max, num))
}
```

### Edge Case 4: Incomplete Customization
**Issue**: User customizes but doesn't click save

**Solution**: Show "Unsaved changes" warning when trying to navigate away

```typescript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

// In component
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault()
      e.returnValue = ''
    }
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [hasUnsavedChanges])
```

---

## 7. Implementation Steps

### Step 1: Extend Zustand Store
- Add `isCustomMacros`, `customProteinGrams`, `customCarbGrams`, `customFatGrams` to state
- Add `setCustomMacros()` action
- Add `resetToCalculated()` action
- Test store actions in isolation

### Step 2: Create MacroInput Component
- Build reusable input component for single macro
- Implement grams and percentage modes
- Add validation display (error/warning states)
- Add unit tests for validation logic

### Step 3: Create MacroSummary Component
- Display macro breakdown with visual bars
- Show calculated vs custom indicator
- Add "Customize Macros" button
- Make it responsive

### Step 4: Create MacroCustomizer Component
- Build main customization interface
- Implement mode switching (grams ↔ percentage)
- Wire up real-time validation
- Handle conversion logic
- Add save/reset functionality

### Step 5: Update Step 6 Page
- Import new components
- Add conditional rendering (show summary or customizer)
- Wire up store actions
- Handle state transitions
- Add loading/error states

### Step 6: Add Visual Feedback
- Success messages when saving
- Warning messages for low protein/fat
- Error messages for invalid totals
- Loading states during calculations

### Step 7: Testing
- Test with various calorie targets (low, medium, high)
- Test mode switching with rounding edge cases
- Test minimum validations
- Test reset functionality
- Test persistence (refresh page)
- Mobile responsive testing

### Step 8: Documentation
- Add JSDoc comments to all functions
- Document validation rules
- Add examples in comments

---

## 8. TypeScript Types

```typescript
// types/macros.ts

export type MacroMode = 'grams' | 'percentage'

export interface MacroValues {
  protein: number
  carbs: number
  fat: number
}

export interface MacroValidation {
  isValid: boolean
  errors: {
    protein?: string
    carbs?: string
    fat?: string
    total?: string
  }
  warnings: {
    protein?: string
    fat?: string
  }
}

export interface MacroCustomizerState extends MacroValues {
  mode: MacroMode
  hasChanges: boolean
}
```

---

## 9. Acceptance Criteria

✅ User can customize macros on Step 6
✅ Two modes available: grams and percentage
✅ Real-time validation with clear error messages
✅ Cannot save if totals don't match target (±50 cal or ±1%)
✅ Warning shown when protein below recommended minimum
✅ Error shown when fat below hormone health minimum
✅ Reset button restores calculated values
✅ Custom values persist in localStorage
✅ Visual indicator shows custom vs calculated
✅ Mobile responsive design
✅ No layout shifts when switching modes
✅ Graceful handling of edge cases

---

## 10. Future Enhancements (Out of Scope)

- Macro presets (high protein, balanced, low carb, etc.)
- Macro ranges instead of fixed values
- Weekly macro cycling
- AI suggestions based on user feedback
- Integration with food tracking
