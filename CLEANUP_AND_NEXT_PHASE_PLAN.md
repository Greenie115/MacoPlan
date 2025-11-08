# MacroPlan - Cleanup & Next Phase Plan

**Created**: January 8, 2025
**Purpose**: Documentation cleanup + Next development phase planning
**Current Status**: Onboarding feature 75% complete (Phases A-C done)

---

## Executive Summary

This document provides:
1. **Documentation Cleanup Recommendations** - Which .md files to keep/delete/consolidate
2. **Boilerplate Removal Plan** - Next.js starter code/assets to remove
3. **Next Development Phase** - Prioritized roadmap for continuing development
4. **Implementation Specifications** - Detailed specs for Phase D and beyond

### Quick Recommendations

**Delete Immediately**:
- SUMMARY.md (superseded)
- IMPLEMENTATION_PLAN.md (executed)
- SECURITY_REVIEW.md (superseded by CRITICAL_REVIEW.md)
- README.md (replace with project README)

**Keep**:
- ONBOARDING_FLOW_SPECIFICATION.md (reference spec)
- IMPLEMENTATION_SUMMARY.md (what was built)
- CRITICAL_REVIEW.md (security audit results)

**Boilerplate to Remove**:
- app/page.tsx (replace with redirect)
- public/*.svg (5 files - not used)
- app/api/test/route.ts (test endpoint)

---

## Part 1: Documentation Cleanup Analysis

### Current Documentation Files

| File | Size | Purpose | Recommendation | Priority |
|------|------|---------|----------------|----------|
| **README.md** | Small | Next.js default README | 🗑️ **DELETE** - Replace with project README | HIGH |
| **ONBOARDING_FLOW_SPECIFICATION.md** | 30KB | Original technical spec | ✅ **KEEP** - Reference documentation | - |
| **SUMMARY.md** | Large | Previous session summary | 🗑️ **DELETE** - Superseded by IMPLEMENTATION_SUMMARY.md | HIGH |
| **IMPLEMENTATION_PLAN.md** | Medium | 4-phase implementation plan | 🗑️ **DELETE** - Plan has been executed | MEDIUM |
| **IMPLEMENTATION_SUMMARY.md** | Large | What was built (Phases A-C) | ✅ **KEEP** - Documents current state | - |
| **SECURITY_REVIEW.md** | Medium | Initial manual security review | 🗑️ **DELETE** - Superseded by CRITICAL_REVIEW.md | MEDIUM |
| **CRITICAL_REVIEW.md** | Large | Comprehensive security audit + Semgrep | ✅ **KEEP** - Security audit results | - |

### Detailed Rationale

#### Files to DELETE

**1. README.md** ⚠️ **HIGH PRIORITY**
- **Current State**: Default Next.js boilerplate
- **Content**: "Deploy Now", Vercel links, generic Next.js info
- **Justification**: Not project-specific, misleading for developers
- **Action**: Delete and create new project README (see below)

**2. SUMMARY.md** 📋 **HIGH PRIORITY**
- **Current State**: Previous session summary from initial implementation
- **Status**: Shows feature at 25% complete
- **Justification**: Outdated - feature is now 75% complete
- **Superseded By**: IMPLEMENTATION_SUMMARY.md (current, accurate state)
- **Action**: Delete - no longer relevant

**3. IMPLEMENTATION_PLAN.md** 📋 **MEDIUM PRIORITY**
- **Current State**: 4-phase plan (A, B, C, D)
- **Status**: Phases A-C completed
- **Justification**: Plan has been executed, only Phase D remains
- **Action**: Delete - information captured in IMPLEMENTATION_SUMMARY.md

**4. SECURITY_REVIEW.md** 🔒 **MEDIUM PRIORITY**
- **Current State**: Initial manual security review (8.5/10 rating)
- **Status**: Replaced by more comprehensive review
- **Superseded By**: CRITICAL_REVIEW.md (includes Semgrep scans, 9/10 rating)
- **Action**: Delete - newer review is more authoritative

#### Files to KEEP

**1. ONBOARDING_FLOW_SPECIFICATION.md** ✅
- **Purpose**: Original technical specification (30KB)
- **Value**: Reference documentation for onboarding requirements
- **Justification**: Comprehensive spec, useful for future development
- **Status**: Still relevant, not superseded

**2. IMPLEMENTATION_SUMMARY.md** ✅
- **Purpose**: Documents what was built in Phases A-C
- **Value**:
  - Code statistics (files created, lines added)
  - Implementation details for each phase
  - Build status and testing results
  - Known issues and next steps
- **Justification**: Current, accurate representation of project state
- **Status**: Primary reference for what's been completed

**3. CRITICAL_REVIEW.md** ✅
- **Purpose**: Comprehensive security and quality review
- **Value**:
  - Security rating: 9/10
  - 4 Semgrep scans performed (0 vulnerabilities)
  - RLS policy verification
  - Production approval status
- **Justification**: Authoritative security audit, required for deployment
- **Status**: Most recent and comprehensive review

### New Documentation to CREATE

**PROJECT_README.md** (to replace README.md)

Recommended structure:
```markdown
# MacroPlan

AI-powered macro tracking and meal planning app built with Next.js 16, React 19, and Supabase.

## Features

- ✅ 6-step onboarding flow with macro calculation
- ✅ Google OAuth & Email/Password authentication
- ✅ Personalized macro targets (protein, carbs, fats)
- ✅ Dietary preferences & allergy tracking
- 🚧 Meal planning (coming soon)
- 🚧 Food logging (coming soon)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **State**: Zustand with persist
- **Auth & DB**: Supabase (PostgreSQL + OAuth)
- **Validation**: Zod + React Hook Form
- **TypeScript**: Strict mode, zero `any` types

## Getting Started

### Prerequisites
- Node.js 18+
- npm/pnpm/yarn
- Supabase account

### Installation
\`\`\`bash
npm install
cp .env.example .env.local
# Add your Supabase credentials to .env.local
\`\`\`

### Environment Variables
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### Run Development Server
\`\`\`bash
npm run dev
# Open http://localhost:3000
\`\`\`

## Project Structure

\`\`\`
app/
├── (auth)/
│   └── onboarding/          # 6-step onboarding flow
│       ├── 1-6/             # Individual step pages
│       └── complete/        # Post-auth data migration
├── auth/callback/           # OAuth callback handler
├── dashboard/               # Main app (placeholder)
└── actions/                 # Server actions (DB operations)

components/
├── auth/                    # AuthModal
├── onboarding/              # Step container, progress indicator
└── ui/                      # shadcn/ui components

lib/
├── calculations/            # BMR, TDEE, macro utilities
├── migration/               # localStorage → Supabase sync
├── supabase/                # Supabase clients
└── types/                   # TypeScript types

stores/
└── onboarding-store.ts      # Zustand state management
\`\`\`

## Onboarding Flow

1. **Goal Selection**: Cut, Bulk, Maintain, or Recomp
2. **Personal Stats**: Age, weight, height, sex
3. **Activity Level**: Sedentary to Extremely Active
4. **Dietary Preferences**: Diet style, allergies, foods to avoid (optional)
5. **Experience Level**: Fitness, tracking, meal prep experience
6. **Results**: Calculated macro targets + TDEE

After completion, users can:
- Sign up with Google or Email/Password
- Continue as guest (localStorage only)

## Database Schema

See `supabase/migrations/001_create_user_profiles.sql` for complete schema.

**Key Tables**:
- `user_profiles` - User onboarding data, macro targets, preferences
- Row Level Security (RLS) enabled - users can only access their own data

## Development

### Build
\`\`\`bash
npm run build
\`\`\`

### Lint
\`\`\`bash
npm run lint
\`\`\`

### Type Check
\`\`\`bash
npx tsc --noEmit
\`\`\`

## Security

- ✅ Semgrep scans: 0 vulnerabilities
- ✅ Row Level Security (RLS) enforced
- ✅ Type-safe throughout (TypeScript strict mode)
- ✅ Input validation (Zod schemas)
- ✅ No hardcoded secrets

Security rating: **9/10** (see CRITICAL_REVIEW.md)

## Documentation

- `ONBOARDING_FLOW_SPECIFICATION.md` - Complete onboarding spec
- `IMPLEMENTATION_SUMMARY.md` - What was built (Phases A-C)
- `CRITICAL_REVIEW.md` - Security & quality review
- `CLEANUP_AND_NEXT_PHASE_PLAN.md` - This file

## Roadmap

### Current Status: 75% Complete

- [x] Phase A: Steps 4-5 implementation
- [x] Phase B: Authentication system
- [x] Phase C: Database integration
- [ ] Phase D: Testing & polish (next)
- [ ] Phase E: Dashboard implementation
- [ ] Phase F: Meal planning features
- [ ] Phase G: Food logging

## Contributing

1. Create feature branch from `main`
2. Follow existing code patterns
3. Run security scan: \`semgrep scan\`
4. Test locally
5. Create PR with description

## License

[Your License Here]

## Contact

[Your Contact Info]
\`\`\`

---

## Part 2: Boilerplate Removal Plan

### Files to DELETE

#### High Priority (Remove Before Development Continues)

**1. app/page.tsx** 🎯
- **Current State**: Default Next.js landing page
- **Content**:
  - "To get started, edit page.tsx"
  - Links to Vercel templates
  - "Deploy Now" button
- **Why Remove**: Misleading landing page, not part of MacroPlan UX
- **Impact**: Users landing on root `/` will see boilerplate
- **Replacement Strategy**:
  ```typescript
  // app/page.tsx - NEW VERSION
  import { redirect } from 'next/navigation'

  export default function HomePage() {
    redirect('/onboarding/1')
  }
  ```
  OR create proper marketing/landing page later

**2. public/next.svg** 🖼️
- **Current State**: Next.js logo SVG
- **Usage**: Referenced in boilerplate page.tsx
- **Why Remove**: Not used in actual app
- **Safe to Delete**: Yes (once page.tsx is replaced)

**3. public/vercel.svg** 🖼️
- **Current State**: Vercel logo SVG
- **Usage**: Referenced in boilerplate page.tsx
- **Why Remove**: Not used in actual app
- **Safe to Delete**: Yes (once page.tsx is replaced)

**4. public/file.svg** 📄
- **Current State**: File icon
- **Usage**: Not referenced anywhere in codebase
- **Why Remove**: Unused boilerplate asset
- **Safe to Delete**: Yes

**5. public/window.svg** 🪟
- **Current State**: Window icon
- **Usage**: Not referenced anywhere in codebase
- **Why Remove**: Unused boilerplate asset
- **Safe to Delete**: Yes

**6. public/globe.svg** 🌐
- **Current State**: Globe icon
- **Usage**: Not referenced anywhere in codebase
- **Why Remove**: Unused boilerplate asset
- **Safe to Delete**: Yes

#### Medium Priority (Remove During Cleanup)

**7. app/api/test/route.ts** 🧪
- **Current State**: Test API endpoint
- **Purpose**: Verify configuration during setup
- **Why Remove**: No longer needed (setup complete)
- **Safe to Delete**: Yes (if not being used for debugging)
- **Recommendation**: Keep until production deploy, then remove

### Boilerplate Audit Summary

| File | Type | Used? | Delete? | Priority |
|------|------|-------|---------|----------|
| app/page.tsx | Page | ❌ No | ✅ Yes (replace) | HIGH |
| public/next.svg | Image | ❌ No | ✅ Yes | HIGH |
| public/vercel.svg | Image | ❌ No | ✅ Yes | HIGH |
| public/file.svg | Image | ❌ No | ✅ Yes | HIGH |
| public/window.svg | Image | ❌ No | ✅ Yes | HIGH |
| public/globe.svg | Image | ❌ No | ✅ Yes | HIGH |
| app/api/test/route.ts | API | ⚠️ Maybe | 🤔 Later | MEDIUM |

### Files to KEEP (Not Boilerplate)

- `app/layout.tsx` - Root layout with font configuration ✅
- `app/globals.css` - MacroPlan brand colors ✅
- `app/(auth)/onboarding/layout.tsx` - Onboarding group layout ✅
- `app/(auth)/onboarding/page.tsx` - Redirect to step 1 ✅
- All onboarding step pages (1-6) ✅
- All custom components ✅
- All utilities and stores ✅

---

## Part 3: Next Development Phase Plan

### Current Project State

**✅ Completed (75%)**:
- Onboarding flow (Steps 1-6) fully functional
- Authentication (Google OAuth + Email/Password + Guest mode)
- Database integration (Supabase with RLS)
- State management (Zustand + localStorage)
- Data migration (localStorage → Supabase)
- Security audit (9/10 rating, 0 vulnerabilities)

**❌ Missing (25%)**:
- Testing (unit tests, E2E tests, integration tests)
- Dashboard implementation (placeholder only)
- Error boundaries and fallback UI
- Loading states improvements
- Accessibility enhancements (ARIA labels incomplete)
- Performance optimization
- Mobile testing and responsive improvements

### Recommended Phases

#### **Phase D: Testing & Polish** (IMMEDIATE NEXT STEP)
**Priority**: 🔥 **CRITICAL**
**Estimated Time**: 4-6 hours
**Justification**: Cannot ship to production without testing

**Tasks**:
1. **Unit Tests** - Test calculation accuracy
2. **Integration Tests** - Test form flows
3. **E2E Tests** - Test complete user journeys
4. **Accessibility Audit** - WCAG compliance
5. **Mobile Testing** - Responsive design verification
6. **Error Boundaries** - Graceful failure handling
7. **Loading States** - Skeleton screens, spinners
8. **Performance** - Bundle analysis, lazy loading

**Acceptance Criteria**:
- [ ] Unit tests pass with 95%+ accuracy
- [ ] E2E test covers full onboarding flow
- [ ] All forms have error handling
- [ ] Loading states visible during async operations
- [ ] Accessible to keyboard-only users
- [ ] Tested on mobile (375px viewport)
- [ ] Build passes with zero warnings

#### **Phase E: Dashboard MVP** (NEXT AFTER TESTING)
**Priority**: ⭐ **HIGH**
**Estimated Time**: 8-12 hours
**Justification**: Onboarding leads to dead end without dashboard

**Current State**: Dashboard is empty placeholder
**Required MVP Features**:
- Display user profile summary
- Show calculated macro targets (large cards)
- "Track Food" CTA (future feature)
- Settings link
- Logout functionality
- Welcome message with next steps

**Tasks**:
1. Create dashboard layout with navigation
2. Fetch and display user profile from Supabase
3. Display macro targets in visual format
4. Add account settings page (basic)
5. Implement logout flow
6. Add edit profile functionality

**Acceptance Criteria**:
- [ ] Dashboard displays user's macro targets
- [ ] Profile data fetched from database correctly
- [ ] Can logout and return to landing page
- [ ] Can navigate to settings
- [ ] Responsive on mobile
- [ ] Protected route (requires authentication)

#### **Phase F: Error Handling & Edge Cases** (MEDIUM PRIORITY)
**Priority**: 🟡 **MEDIUM**
**Estimated Time**: 4-6 hours

**Tasks**:
1. Add error boundaries to all routes
2. Handle network failures gracefully
3. Handle Supabase connection errors
4. Add retry logic for failed requests
5. Implement offline mode detection
6. Add toast notifications for success/error
7. Handle edge cases (invalid data, session expiry)

**Acceptance Criteria**:
- [ ] App doesn't crash on network failure
- [ ] Clear error messages for users
- [ ] Retry mechanism for transient failures
- [ ] Graceful degradation for offline users

#### **Phase G: Performance Optimization** (LOWER PRIORITY)
**Priority**: 🟢 **LOW**
**Estimated Time**: 3-4 hours

**Tasks**:
1. Bundle analysis (webpack-bundle-analyzer)
2. Code splitting for routes
3. Lazy load heavy components
4. Optimize images (if any added)
5. Implement React.memo where beneficial
6. Reduce re-renders in forms
7. Add loading skeletons

**Acceptance Criteria**:
- [ ] Initial bundle < 500KB
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] No unnecessary re-renders

#### **Phase H: Meal Planning (Future Feature)**
**Priority**: 🔵 **BACKLOG**
**Estimated Time**: 40+ hours
**Note**: Major feature, requires separate planning

**High-Level Scope**:
- Meal plan generator based on macro targets
- Recipe database integration
- Meal templates (breakfast, lunch, dinner, snacks)
- Shopping list generation
- Meal prep instructions

---

## Part 4: Phase D Implementation Specifications

### 4.1 Unit Tests for Calculations

**Tool**: Vitest (recommended) or Jest
**Location**: `__tests__/calculations/`

**Files to Create**:
1. `__tests__/calculations/bmr.test.ts`
2. `__tests__/calculations/tdee.test.ts`
3. `__tests__/calculations/macros.test.ts`

**Example Test Suite**:

```typescript
// __tests__/calculations/bmr.test.ts
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

      expect(result).toBeGreaterThan(1840)
      expect(result).toBeLessThan(1860)
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
    })
  })
})

// __tests__/calculations/tdee.test.ts
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
})

// __tests__/calculations/macros.test.ts
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
  })
})
```

**Setup Instructions**:
```bash
# Install Vitest
npm install -D vitest

# Add to package.json scripts
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}

# Run tests
npm run test
```

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Calculations accurate within ±1% margin
- [ ] Edge cases covered (min/max ages, weights)
- [ ] Both imperial and metric units tested

---

### 4.2 E2E Tests with Playwright

**Tool**: Playwright (browser MCP available)
**Location**: `tests/e2e/`

**Test Scenarios**:

```typescript
// tests/e2e/onboarding-guest-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow - Guest User', () => {
  test('completes full onboarding and continues as guest', async ({ page }) => {
    // Start onboarding
    await page.goto('/onboarding/1')

    // Step 1: Goal Selection
    await expect(page.locator('h1')).toContainText('What\'s your goal?')
    await page.click('text=Lose Fat (Cut)')
    await page.click('button:has-text("Continue")')

    // Step 2: Personal Stats
    await expect(page).toHaveURL('/onboarding/2')
    await page.fill('input[name="age"]', '30')
    await page.fill('input[name="weight"]', '180')
    await page.selectOption('select[name="weightUnit"]', 'lbs')
    await page.fill('input[name="heightFeet"]', '5')
    await page.fill('input[name="heightInches"]', '10')
    await page.click('button:has-text("Male")')
    await page.click('button:has-text("Continue")')

    // Step 3: Activity Level
    await expect(page).toHaveURL('/onboarding/3')
    await page.click('text=Moderately Active')
    await page.click('button:has-text("Continue")')

    // Step 4: Dietary Preferences
    await expect(page).toHaveURL('/onboarding/4')
    await page.click('text=None / Flexible')
    await page.click('button:has-text("Continue")')

    // Step 5: Experience Level
    await expect(page).toHaveURL('/onboarding/5')
    await page.click('[data-testid="fitness-intermediate"]')
    await page.click('[data-testid="tracking-some"]')
    await page.click('[data-testid="mealprep-intermediate"]')
    await page.click('button:has-text("Continue")')

    // Step 6: Results
    await expect(page).toHaveURL('/onboarding/6')
    await expect(page.locator('text=/\\d+ calories per day/')).toBeVisible()
    await expect(page.locator('text=/Protein.*\\d+g/')).toBeVisible()

    // Trigger auth modal
    await page.click('button:has-text("Continue")')
    await expect(page.locator('text=Create Your Account')).toBeVisible()

    // Continue as guest
    await page.click('text=Continue as Guest')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=MacroPlan')).toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    await page.goto('/onboarding/2')

    // Try to continue without filling fields
    await page.click('button:has-text("Continue")')

    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible()
  })

  test('preserves data on page reload', async ({ page }) => {
    await page.goto('/onboarding/1')

    // Select goal
    await page.click('text=Lose Fat (Cut)')

    // Reload page
    await page.reload()

    // Check localStorage
    const storage = await page.evaluate(() =>
      localStorage.getItem('onboarding-storage')
    )

    expect(storage).toContain('cut')
  })

  test('back button navigates to previous step', async ({ page }) => {
    await page.goto('/onboarding/3')

    // Click back button
    await page.click('button[aria-label="Go back"]')

    // Should be on step 2
    await expect(page).toHaveURL('/onboarding/2')
  })
})

// tests/e2e/onboarding-auth-flow.spec.ts
test.describe('Onboarding Flow - Authenticated User', () => {
  test('completes onboarding with email signup', async ({ page }) => {
    // Complete steps 1-6 (same as guest flow)
    // ... (omitted for brevity)

    // Step 6: Trigger auth modal
    await page.click('button:has-text("Continue")')

    // Fill signup form
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'SecurePass123!')
    await page.click('button:has-text("Sign Up")')

    // Should show success message or redirect
    // Note: Email confirmation required in production
    await expect(page.locator('text=/Check your email|Saving your profile/')).toBeVisible()
  })
})

// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('onboarding step 1 has no accessibility violations', async ({ page }) => {
    await page.goto('/onboarding/1')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('can complete onboarding with keyboard only', async ({ page }) => {
    await page.goto('/onboarding/1')

    // Tab to first goal option
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Select with Enter
    await page.keyboard.press('Enter')

    // Tab to Continue button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    // Should navigate to step 2
    await expect(page).toHaveURL('/onboarding/2')
  })

  test('has proper ARIA labels', async ({ page }) => {
    await page.goto('/onboarding/1')

    // Check progress indicator
    await expect(page.locator('[aria-label*="progress"]')).toBeVisible()

    // Check buttons
    await expect(page.locator('button[aria-label]')).toHaveCount(2) // Back + Continue
  })
})
```

**Setup**:
```bash
# Playwright should already be available via MCP

# Add test script
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

**Acceptance Criteria**:
- [ ] Full happy path test passes
- [ ] Validation tests pass
- [ ] Accessibility scan passes
- [ ] Keyboard navigation works
- [ ] Data persistence verified

---

### 4.3 Error Handling & Loading States

**Error Boundary Component**:

```typescript
// components/error-boundary.tsx
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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          Oops! Something went wrong
        </h2>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**Add to Routes**:
```typescript
// app/(auth)/onboarding/error.tsx
export { ErrorBoundary as default } from '@/components/error-boundary'

// app/dashboard/error.tsx
export { ErrorBoundary as default } from '@/components/error-boundary'
```

**Loading States**:

```typescript
// app/(auth)/onboarding/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-6">
      <Skeleton className="h-12 w-1/3" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
```

**Acceptance Criteria**:
- [ ] Error boundaries on all major routes
- [ ] Loading skeletons for async routes
- [ ] Network errors handled gracefully
- [ ] User sees helpful error messages

---

### 4.4 Accessibility Improvements

**Tasks**:

1. **Add ARIA Labels**
```typescript
// Example: Progress Indicator
<div
  role="progressbar"
  aria-valuenow={currentStep}
  aria-valuemin={1}
  aria-valuemax={6}
  aria-label={`Onboarding progress: Step ${currentStep} of 6`}
>
  {/* Progress dots */}
</div>

// Example: Continue Button
<Button
  onClick={onContinue}
  disabled={continueDisabled}
  aria-label={`Continue to step ${currentStep + 1}`}
  aria-disabled={continueDisabled}
>
  Continue
</Button>

// Example: Back Button
<Button
  onClick={onBack}
  variant="ghost"
  aria-label="Go back to previous step"
>
  <ArrowLeft className="size-4" />
</Button>
```

2. **Keyboard Navigation**
```typescript
// Ensure all interactive elements are focusable
<Card
  tabIndex={0}
  role="button"
  aria-pressed={isSelected}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect()
    }
  }}
  onClick={handleSelect}
>
  {/* Card content */}
</Card>
```

3. **Focus Management**
```typescript
// Auto-focus first input on step load
useEffect(() => {
  const firstInput = document.querySelector('input')
  firstInput?.focus()
}, [])

// Trap focus in modals
<Dialog>
  <DialogContent>
    {/* Focus trap handled by shadcn/ui Dialog */}
  </DialogContent>
</Dialog>
```

4. **Screen Reader Announcements**
```typescript
// components/screen-reader-only.tsx
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Usage
<ScreenReaderOnly>
  Step 1 of 6: Select your goal
</ScreenReaderOnly>
```

**Acceptance Criteria**:
- [ ] All interactive elements have ARIA labels
- [ ] Keyboard navigation works throughout
- [ ] Screen reader can navigate entire flow
- [ ] Focus visible on all elements
- [ ] Color contrast meets WCAG AA standards

---

## Part 5: Environment Setup Requirements

### Required Before Development

**1. Supabase Configuration**

Already configured:
- ✅ `user_profiles` table created
- ✅ RLS policies enabled
- ✅ Auth providers (need to verify)

**To verify**:
```bash
# Check .env.local exists
cat .env.local

# Should contain:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

**2. Testing Tools**

```bash
# Install test dependencies
npm install -D vitest @vitest/ui
npm install -D @axe-core/playwright

# Verify Playwright available
npx playwright --version
```

**3. Git Status**

Current branch: `feature/onboarding-flow`

Before starting Phase D:
```bash
# Ensure clean working tree
git status

# Commit any uncommitted changes
git add .
git commit -m "docs: Add cleanup and planning documentation"
```

---

## Part 6: Success Criteria

### Phase D Completion

Feature is ready for PR when:

**Testing**:
- [ ] Unit tests pass (BMR, TDEE, macros)
- [ ] E2E test covers full onboarding flow
- [ ] Accessibility scan passes (0 violations)
- [ ] Keyboard navigation verified

**Error Handling**:
- [ ] Error boundaries on all routes
- [ ] Loading states implemented
- [ ] Network errors handled gracefully
- [ ] User-friendly error messages

**Code Quality**:
- [ ] TypeScript: 0 errors
- [ ] Build passes: `npm run build`
- [ ] No console.logs in production code
- [ ] All imports organized

**Documentation**:
- [ ] README.md replaced with project README
- [ ] Unnecessary .md files deleted
- [ ] IMPLEMENTATION_SUMMARY.md updated
- [ ] Known issues documented

**Performance**:
- [ ] Build time < 10 seconds
- [ ] Initial bundle < 500KB
- [ ] No unnecessary re-renders (verified with React DevTools)

### Production Readiness

Before deploying to production:

**Security**:
- [ ] Semgrep scan passes (0 critical/high vulnerabilities)
- [ ] No hardcoded secrets
- [ ] Environment variables documented
- [ ] RLS policies tested with real users

**User Experience**:
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Mobile responsive (tested on 375px viewport)
- [ ] Accessible to keyboard-only users
- [ ] Clear error messages for all failure cases

**Monitoring**:
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Analytics configured (e.g., PostHog, Plausible)
- [ ] Performance monitoring (e.g., Vercel Analytics)

---

## Part 7: Cleanup Execution Plan

### Step-by-Step Cleanup Instructions

**For the Coding Agent**:

```bash
# Step 1: Delete unnecessary documentation
rm SUMMARY.md
rm IMPLEMENTATION_PLAN.md
rm SECURITY_REVIEW.md
rm README.md

# Step 2: Delete Next.js boilerplate assets
rm public/next.svg
rm public/vercel.svg
rm public/file.svg
rm public/window.svg
rm public/globe.svg

# Step 3: Replace landing page (app/page.tsx)
# (See new content in Part 2)

# Step 4: Create new project README
# (See template in Part 1)

# Step 5: Commit cleanup
git add .
git commit -m "chore: Remove boilerplate files and outdated documentation

- Delete superseded documentation (SUMMARY.md, IMPLEMENTATION_PLAN.md, SECURITY_REVIEW.md)
- Remove Next.js boilerplate assets (5 SVG files)
- Replace boilerplate README with project-specific README
- Replace default landing page with redirect to onboarding

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Files After Cleanup

**Documentation** (3 files):
- ✅ README.md (new project README)
- ✅ ONBOARDING_FLOW_SPECIFICATION.md (reference spec)
- ✅ IMPLEMENTATION_SUMMARY.md (current state)
- ✅ CRITICAL_REVIEW.md (security audit)
- ✅ CLEANUP_AND_NEXT_PHASE_PLAN.md (this file)

**Public Assets** (0 boilerplate files):
- (Empty or only custom assets)

**Landing Page**:
- ✅ app/page.tsx (redirects to onboarding)

---

## Part 8: Next Steps Summary

### Immediate Actions (In Order)

1. **Execute Cleanup** ⚡
   - Delete files listed above
   - Replace README.md
   - Update app/page.tsx
   - Commit changes

2. **Start Phase D** 🧪
   - Install test dependencies
   - Write unit tests
   - Write E2E tests
   - Add error boundaries
   - Improve accessibility

3. **Review & Test** ✅
   - Run all tests
   - Manual testing
   - Build verification
   - Security scan

4. **Create PR** 🚀
   - Update IMPLEMENTATION_SUMMARY.md
   - Write comprehensive PR description
   - Request review
   - Address feedback

5. **Plan Phase E** 📋
   - Dashboard MVP design
   - User profile display
   - Settings page
   - Logout flow

---

## Appendix: Quick Reference

### Documentation Status

| Document | Status | Purpose |
|----------|--------|---------|
| ONBOARDING_FLOW_SPECIFICATION.md | ✅ Keep | Reference spec |
| IMPLEMENTATION_SUMMARY.md | ✅ Keep | What was built |
| CRITICAL_REVIEW.md | ✅ Keep | Security audit |
| CLEANUP_AND_NEXT_PHASE_PLAN.md | ✅ Keep | This document |
| README.md | ✅ Keep | NEW project README |
| ~~SUMMARY.md~~ | ❌ Delete | Superseded |
| ~~IMPLEMENTATION_PLAN.md~~ | ❌ Delete | Executed |
| ~~SECURITY_REVIEW.md~~ | ❌ Delete | Superseded |

### Boilerplate Status

| File | Status |
|------|--------|
| app/page.tsx | 🔄 Replace |
| public/next.svg | ❌ Delete |
| public/vercel.svg | ❌ Delete |
| public/file.svg | ❌ Delete |
| public/window.svg | ❌ Delete |
| public/globe.svg | ❌ Delete |
| app/api/test/route.ts | ⚠️ Keep for now |

### Phase Checklist

- [x] Phase A: Steps 4-5 ✅
- [x] Phase B: Authentication ✅
- [x] Phase C: Database ✅
- [ ] **Phase D: Testing & Polish** ⬅️ **NEXT**
- [ ] Phase E: Dashboard MVP
- [ ] Phase F: Error Handling
- [ ] Phase G: Performance

---

**Document Status**: ✅ Complete
**Ready for Execution**: Yes
**Next Action**: Execute cleanup, then start Phase D testing

**Created by**: Claude Code (Manual Planning)
**Date**: January 8, 2025
