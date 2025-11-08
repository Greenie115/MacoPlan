# Phase D: Testing & Polish - Implementation Guide

**Priority**: 🔥 **CRITICAL** (Required before PR/production)
**Estimated Time**: 4-6 hours
**Current Status**: Ready to start

---

## Overview

Phase D focuses on testing, error handling, accessibility, and polish to make the onboarding feature production-ready. This phase is **required** before creating a PR.

**Current State**: Feature is 75% complete, functionally working but untested
**Target State**: 100% complete with comprehensive testing and polish

---

## Task Checklist

### Part 1: Testing Setup (30 min)
- [ ] Install Vitest and testing dependencies
- [ ] Configure test scripts in package.json
- [ ] Create `__tests__` directory structure
- [ ] Verify Playwright is available (via MCP)

### Part 2: Unit Tests (2 hours)
- [ ] Write BMR calculation tests (12 test cases)
- [ ] Write TDEE calculation tests (5 test cases)
- [ ] Write macro calculation tests (8 test cases)
- [ ] Run tests and verify 100% pass rate
- [ ] Verify calculation accuracy within ±1% margin

### Part 3: E2E Tests (2 hours)
- [ ] Write guest onboarding flow test
- [ ] Write form validation test
- [ ] Write localStorage persistence test
- [ ] Write back button navigation test
- [ ] Write accessibility keyboard navigation test
- [ ] Run tests and verify all pass

### Part 4: Error Handling (1 hour)
- [ ] Create ErrorBoundary component
- [ ] Add error.tsx to onboarding route
- [ ] Add error.tsx to dashboard route
- [ ] Add loading.tsx to onboarding route
- [ ] Add loading.tsx to dashboard route
- [ ] Test error scenarios manually

### Part 5: Accessibility (1 hour)
- [ ] Add ARIA labels to progress indicator
- [ ] Add ARIA labels to buttons
- [ ] Add ARIA labels to form inputs
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader (if available)
- [ ] Run axe accessibility scan

### Part 6: Final Verification (30 min)
- [ ] Build passes: `npm run build`
- [ ] All tests pass: `npm run test`
- [ ] TypeScript: 0 errors
- [ ] No console.logs in production code
- [ ] Mobile responsive check (375px viewport)

---

## Detailed Implementation Steps

## Part 1: Testing Setup

### Install Dependencies

```bash
# Install Vitest for unit testing
npm install -D vitest @vitest/ui @vitest/coverage-v8

# Install Axe for accessibility testing
npm install -D @axe-core/playwright
```

### Update package.json

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "echo 'Use Playwright MCP for E2E tests'"
  }
}
```

### Create Test Directory Structure

```bash
mkdir -p __tests__/calculations
mkdir -p tests/e2e
```

---

## Part 2: Unit Tests

### File 1: `__tests__/calculations/bmr.test.ts`

Create this exact file with these tests:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateBMR } from '@/lib/calculations/bmr'

describe('BMR Calculation (Mifflin-St Jeor)', () => {
  describe('Imperial units', () => {
    it('calculates correctly for 30yr male, 180lbs, 5\'10"', () => {
      const result = calculateBMR({
        weight: 180,
        heightFeet: 5,
        heightInches: 10,
        age: 30,
        sex: 'male',
        weightUnit: 'lbs'
      })

      // Expected: ~1850 calories/day
      expect(result).toBeGreaterThan(1840)
      expect(result).toBeLessThan(1860)
    })

    it('calculates correctly for 25yr female, 150lbs, 5\'5"', () => {
      const result = calculateBMR({
        weight: 150,
        heightFeet: 5,
        heightInches: 5,
        age: 25,
        sex: 'female',
        weightUnit: 'lbs'
      })

      // Expected: ~1450 calories/day
      expect(result).toBeGreaterThan(1440)
      expect(result).toBeLessThan(1460)
    })

    it('calculates correctly for 40yr male, 200lbs, 6\'0"', () => {
      const result = calculateBMR({
        weight: 200,
        heightFeet: 6,
        heightInches: 0,
        age: 40,
        sex: 'male',
        weightUnit: 'lbs'
      })

      // Expected: ~1950 calories/day
      expect(result).toBeGreaterThan(1940)
      expect(result).toBeLessThan(1960)
    })

    it('calculates correctly for 35yr female, 130lbs, 5\'3"', () => {
      const result = calculateBMR({
        weight: 130,
        heightFeet: 5,
        heightInches: 3,
        age: 35,
        sex: 'female',
        weightUnit: 'lbs'
      })

      // Expected: ~1300 calories/day
      expect(result).toBeGreaterThan(1290)
      expect(result).toBeLessThan(1310)
    })
  })

  describe('Metric units', () => {
    it('calculates correctly for 81.6kg male, 178cm, 30yr', () => {
      const result = calculateBMR({
        weight: 81.6,
        heightCm: 178,
        age: 30,
        sex: 'male',
        weightUnit: 'kg'
      })

      // Should match imperial test above
      expect(result).toBeGreaterThan(1840)
      expect(result).toBeLessThan(1860)
    })

    it('calculates correctly for 68kg female, 165cm, 25yr', () => {
      const result = calculateBMR({
        weight: 68,
        heightCm: 165,
        age: 25,
        sex: 'female',
        weightUnit: 'kg'
      })

      expect(result).toBeGreaterThan(1440)
      expect(result).toBeLessThan(1460)
    })
  })

  describe('Edge cases', () => {
    it('handles minimum age (13)', () => {
      const result = calculateBMR({
        weight: 100,
        heightFeet: 5,
        heightInches: 0,
        age: 13,
        sex: 'male',
        weightUnit: 'lbs'
      })

      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(3000) // Reasonable upper bound
    })

    it('handles maximum age (120)', () => {
      const result = calculateBMR({
        weight: 150,
        heightFeet: 5,
        heightInches: 6,
        age: 120,
        sex: 'female',
        weightUnit: 'lbs'
      })

      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(2000)
    })

    it('handles minimum weight (50lbs)', () => {
      const result = calculateBMR({
        weight: 50,
        heightFeet: 4,
        heightInches: 0,
        age: 13,
        sex: 'female',
        weightUnit: 'lbs'
      })

      expect(result).toBeGreaterThan(0)
    })

    it('handles maximum weight (500lbs)', () => {
      const result = calculateBMR({
        weight: 500,
        heightFeet: 6,
        heightInches: 6,
        age: 30,
        sex: 'male',
        weightUnit: 'lbs'
      })

      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(5000)
    })
  })

  describe('Sex differences', () => {
    it('male BMR is higher than female for same stats', () => {
      const maleBMR = calculateBMR({
        weight: 150,
        heightFeet: 5,
        heightInches: 8,
        age: 30,
        sex: 'male',
        weightUnit: 'lbs'
      })

      const femaleBMR = calculateBMR({
        weight: 150,
        heightFeet: 5,
        heightInches: 8,
        age: 30,
        sex: 'female',
        weightUnit: 'lbs'
      })

      // Male should be ~166 calories higher (+5 vs -161 in formula)
      expect(maleBMR - femaleBMR).toBeGreaterThan(160)
      expect(maleBMR - femaleBMR).toBeLessThan(170)
    })
  })
})
```

### File 2: `__tests__/calculations/tdee.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { calculateTDEE } from '@/lib/calculations/tdee'

describe('TDEE Calculation', () => {
  const bmr = 1850

  it('applies sedentary multiplier (1.2x) correctly', () => {
    const tdee = calculateTDEE(bmr, 'sedentary')
    expect(tdee).toBe(Math.round(1850 * 1.2)) // 2220
  })

  it('applies lightly active multiplier (1.375x) correctly', () => {
    const tdee = calculateTDEE(bmr, 'lightly')
    expect(tdee).toBe(Math.round(1850 * 1.375)) // 2544
  })

  it('applies moderately active multiplier (1.55x) correctly', () => {
    const tdee = calculateTDEE(bmr, 'moderately')
    expect(tdee).toBe(Math.round(1850 * 1.55)) // 2868
  })

  it('applies very active multiplier (1.725x) correctly', () => {
    const tdee = calculateTDEE(bmr, 'very')
    expect(tdee).toBe(Math.round(1850 * 1.725)) // 3191
  })

  it('applies extremely active multiplier (1.9x) correctly', () => {
    const tdee = calculateTDEE(bmr, 'extremely')
    expect(tdee).toBe(Math.round(1850 * 1.9)) // 3515
  })

  it('handles low BMR values', () => {
    const lowBMR = 1200
    const tdee = calculateTDEE(lowBMR, 'sedentary')
    expect(tdee).toBe(Math.round(1200 * 1.2)) // 1440
  })

  it('handles high BMR values', () => {
    const highBMR = 3000
    const tdee = calculateTDEE(highBMR, 'extremely')
    expect(tdee).toBe(Math.round(3000 * 1.9)) // 5700
  })
})
```

### File 3: `__tests__/calculations/macros.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { calculateMacros } from '@/lib/calculations/macros'

describe('Macro Calculation', () => {
  describe('Cut (20% deficit)', () => {
    it('calculates correct calorie deficit', () => {
      const tdee = 2868
      const result = calculateMacros({
        tdee,
        goal: 'cut',
        weight: 180,
        weightUnit: 'lbs'
      })

      const expected = Math.round(tdee * 0.8) // 2294
      expect(result.targetCalories).toBe(expected)
    })

    it('sets protein to 1g per lb body weight', () => {
      const result = calculateMacros({
        tdee: 2868,
        goal: 'cut',
        weight: 180,
        weightUnit: 'lbs'
      })

      expect(result.proteinGrams).toBe(180)
    })

    it('sets fat to ~30% of calories', () => {
      const result = calculateMacros({
        tdee: 2868,
        goal: 'cut',
        weight: 180,
        weightUnit: 'lbs'
      })

      const fatCalories = result.fatGrams * 9
      const fatPercentage = (fatCalories / result.targetCalories) * 100

      expect(fatPercentage).toBeGreaterThan(28)
      expect(fatPercentage).toBeLessThan(32)
    })
  })

  describe('Bulk (10% surplus)', () => {
    it('calculates correct calorie surplus', () => {
      const tdee = 2868
      const result = calculateMacros({
        tdee,
        goal: 'bulk',
        weight: 180,
        weightUnit: 'lbs'
      })

      const expected = Math.round(tdee * 1.1) // 3155
      expect(result.targetCalories).toBe(expected)
    })

    it('sets protein to 0.8g per lb body weight', () => {
      const result = calculateMacros({
        tdee: 2868,
        goal: 'bulk',
        weight: 180,
        weightUnit: 'lbs'
      })

      expect(result.proteinGrams).toBe(Math.round(180 * 0.8)) // 144
    })
  })

  describe('Maintain (no deficit/surplus)', () => {
    it('sets target calories to TDEE', () => {
      const tdee = 2500
      const result = calculateMacros({
        tdee,
        goal: 'maintain',
        weight: 170,
        weightUnit: 'lbs'
      })

      expect(result.targetCalories).toBe(tdee)
    })
  })

  describe('Recomp (maintenance calories)', () => {
    it('sets target calories to TDEE', () => {
      const tdee = 2300
      const result = calculateMacros({
        tdee,
        goal: 'recomp',
        weight: 160,
        weightUnit: 'lbs'
      })

      expect(result.targetCalories).toBe(tdee)
    })
  })

  describe('Calorie validation', () => {
    it('ensures macros sum to target calories (within tolerance)', () => {
      const result = calculateMacros({
        tdee: 2500,
        goal: 'maintain',
        weight: 170,
        weightUnit: 'lbs'
      })

      const totalCalories =
        (result.proteinGrams * 4) +
        (result.carbGrams * 4) +
        (result.fatGrams * 9)

      // Allow 100 calorie margin of error
      expect(Math.abs(totalCalories - result.targetCalories)).toBeLessThan(100)
    })

    it('all macro values are positive', () => {
      const result = calculateMacros({
        tdee: 2000,
        goal: 'cut',
        weight: 150,
        weightUnit: 'lbs'
      })

      expect(result.proteinGrams).toBeGreaterThan(0)
      expect(result.carbGrams).toBeGreaterThan(0)
      expect(result.fatGrams).toBeGreaterThan(0)
    })
  })
})
```

### Run Unit Tests

```bash
npm run test
```

**Expected**: All tests pass (25/25)

---

## Part 3: E2E Tests with Playwright

These tests use the Playwright MCP browser automation. Create test files but execute via browser MCP tools.

### Test Scenario 1: Guest Onboarding Flow

**Test Description**: Complete full onboarding as guest user

**Steps**:
1. Navigate to `/onboarding/1`
2. Select goal: "Lose Fat (Cut)"
3. Fill personal stats: 30yr, 180lbs, 5'10", Male
4. Select activity: "Moderately Active"
5. Select dietary: "None / Flexible"
6. Select experience: Intermediate for all
7. View results
8. Continue as guest
9. Verify redirect to `/dashboard`

### Test Scenario 2: Form Validation

**Test Description**: Verify required fields are enforced

**Steps**:
1. Navigate to `/onboarding/2`
2. Click "Continue" without filling fields
3. Verify validation errors appear
4. Fill fields
5. Verify errors disappear
6. Continue successfully

### Test Scenario 3: Data Persistence

**Test Description**: Verify localStorage persistence

**Steps**:
1. Navigate to `/onboarding/1`
2. Select goal
3. Reload page
4. Verify goal still selected
5. Check localStorage contains data

### Test Scenario 4: Back Navigation

**Test Description**: Verify back button works

**Steps**:
1. Navigate to `/onboarding/3`
2. Click back button
3. Verify on `/onboarding/2`
4. Verify data preserved

### Test Scenario 5: Keyboard Navigation

**Test Description**: Verify keyboard-only navigation

**Steps**:
1. Navigate to `/onboarding/1`
2. Tab to goal card
3. Press Enter to select
4. Tab to Continue button
5. Press Enter
6. Verify navigated to step 2

---

## Part 4: Error Handling

### Create Error Boundary Component

**File**: `components/error-boundary.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error caught by boundary:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-foreground">
          Oops! Something went wrong
        </h2>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button onClick={reset}>Try Again</Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/onboarding/1'}
          >
            Start Over
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Add Error Boundaries to Routes

**File**: `app/(auth)/onboarding/error.tsx`

```typescript
export { ErrorBoundary as default } from '@/components/error-boundary'
```

**File**: `app/dashboard/error.tsx`

```typescript
export { ErrorBoundary as default } from '@/components/error-boundary'
```

### Create Loading States

**File**: `app/(auth)/onboarding/loading.tsx`

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Progress indicator skeleton */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="size-3 rounded-full" />
          ))}
        </div>

        {/* Title skeleton */}
        <Skeleton className="h-8 w-3/4 mx-auto" />

        {/* Subtitle skeleton */}
        <Skeleton className="h-4 w-1/2 mx-auto" />

        {/* Content skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
```

**File**: `app/dashboard/loading.tsx`

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-6">
      {/* Header skeleton */}
      <Skeleton className="h-12 w-1/3" />

      {/* Macro cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>

      {/* Content skeleton */}
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
```

---

## Part 5: Accessibility Improvements

### Update Progress Indicator

**File**: `components/onboarding/progress-indicator.tsx`

Add ARIA attributes:

```typescript
// Find the wrapper div and add:
<div
  role="progressbar"
  aria-valuenow={currentStep}
  aria-valuemin={1}
  aria-valuemax={totalSteps}
  aria-label={`Step ${currentStep} of ${totalSteps}`}
  className="flex items-center justify-center gap-2"
>
  {/* Existing dots */}
</div>
```

### Update StepContainer Buttons

**File**: `components/onboarding/step-container.tsx`

Add ARIA labels to buttons:

```typescript
// Back button
<Button
  variant="ghost"
  onClick={onBack}
  className="..."
  aria-label="Go back to previous step"
>
  <ArrowLeft className="size-4" />
</Button>

// Continue button
<Button
  onClick={onContinue}
  disabled={continueDisabled}
  className="..."
  aria-label={`Continue to step ${step + 1}`}
  aria-disabled={continueDisabled}
>
  Continue
  <ArrowRight className="ml-2 size-4" />
</Button>
```

### Add Keyboard Support to Cards

**File**: Update all onboarding step pages with card selections

Example for Step 1:

```typescript
<Card
  key={goal.id}
  className="..."
  onClick={() => handleSelectGoal(goal.id)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelectGoal(goal.id)
    }
  }}
  tabIndex={0}
  role="button"
  aria-pressed={selectedGoal === goal.id}
>
  {/* Card content */}
</Card>
```

### Add Screen Reader Only Text

**File**: Create `components/screen-reader-only.tsx`

```typescript
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}
```

Usage in steps:

```typescript
import { ScreenReaderOnly } from '@/components/screen-reader-only'

// Add to each step
<ScreenReaderOnly>
  Step {step} of 6: {title}
</ScreenReaderOnly>
```

---

## Part 6: Final Verification

### Pre-PR Checklist

Run these commands and verify results:

```bash
# Build must pass
npm run build
# Expected: ✓ Compiled successfully

# Tests must pass
npm run test
# Expected: All tests passing (25/25)

# TypeScript must have 0 errors
npx tsc --noEmit
# Expected: No errors

# Lint must pass
npm run lint
# Expected: No errors
```

### Manual Testing Checklist

- [ ] Complete onboarding flow works (guest mode)
- [ ] Authentication flow works (test with real account if possible)
- [ ] Error boundary triggers on error
- [ ] Loading states appear during navigation
- [ ] Keyboard navigation works (Tab, Enter, Arrows)
- [ ] Back button works on all steps
- [ ] Data persists in localStorage
- [ ] Mobile responsive at 375px width
- [ ] No console errors in browser

---

## Success Criteria

Phase D is **COMPLETE** when:

### Testing
✅ Unit tests: 25/25 passing
✅ E2E tests: All scenarios verified
✅ Test coverage: >80% for calculation files
✅ Accessibility scan: 0 critical violations

### Error Handling
✅ Error boundaries on all major routes
✅ Loading states implemented
✅ Network errors handled gracefully

### Code Quality
✅ TypeScript: 0 errors
✅ Build: Passes without warnings
✅ No console.logs in production code
✅ All imports organized

### Accessibility
✅ ARIA labels on all interactive elements
✅ Keyboard navigation functional
✅ Screen reader compatible
✅ Focus visible on all elements

### Documentation
✅ All test files documented
✅ Implementation notes added
✅ Known issues documented

---

## After Phase D Completion

Once all success criteria are met:

1. **Update IMPLEMENTATION_SUMMARY.md** with Phase D completion
2. **Run final security scan** (Semgrep)
3. **Create PR** with comprehensive description
4. **Request review** from team
5. **Plan Phase E** (Dashboard MVP)

---

## Quick Start for Coding Agent

```bash
# 1. Install dependencies
npm install -D vitest @vitest/ui @vitest/coverage-v8 @axe-core/playwright

# 2. Create test files
# Copy tests from Part 2 above

# 3. Run tests
npm run test

# 4. Create error handling components
# Copy components from Part 4 above

# 5. Add accessibility improvements
# Follow Part 5 above

# 6. Verify everything
npm run build && npm run test && npx tsc --noEmit
```

---

**Document Status**: ✅ Ready for execution
**Next Action**: Install dependencies and start Part 1
**Estimated Completion**: 4-6 hours

Created by: Claude Code
Date: January 8, 2025
