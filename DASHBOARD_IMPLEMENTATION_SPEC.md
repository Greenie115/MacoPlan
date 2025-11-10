# MacroPlan Dashboard Implementation Specification

## Overview
This document provides a comprehensive technical specification for implementing the MacroPlan dashboard (home screen) that greets users after completing onboarding.

## 1. Component Architecture

### 1.1 Main Page Component
**File**: `app/dashboard/page.tsx`
- Server Component that fetches user data
- Passes data to client components
- Handles initial data loading state

### 1.2 Dashboard Components

#### MacroTargetCard
**File**: `components/dashboard/macro-target-card.tsx`
**Type**: Client Component
**Props**:
```typescript
interface MacroTargetCardProps {
  targetCalories: number
  proteinGrams: number
  carbGrams: number
  fatGrams: number
  caloriesEaten?: number // Optional, defaults to 0 for MVP
  proteinEaten?: number
  carbsEaten?: number
  fatEaten?: number
}
```
**Responsibilities**:
- Display daily calorie target
- Show progress bar (caloriesEaten / targetCalories * 100)
- Display macro breakdown with icons
- "View Today's Plan" button with navigation

#### MealPlanCard
**File**: `components/dashboard/meal-plan-card.tsx`
**Type**: Client Component
**Props**:
```typescript
interface MealPlanCardProps {
  id: string
  name: string
  dateRange: string
  caloriesPerDay: number
  images: string[] // Array of 4 image URLs
  onClick?: () => void
}
```
**Responsibilities**:
- Render 2x2 grid of meal images
- Display plan details
- Handle click navigation to plan detail

#### RecentPlansCarousel
**File**: `components/dashboard/recent-plans-carousel.tsx`
**Type**: Client Component
**Props**:
```typescript
interface RecentPlansCarouselProps {
  plans: MealPlan[]
}
```
**Responsibilities**:
- Horizontal scrollable container
- Render multiple MealPlanCard components
- Handle smooth scroll behavior
- Snap to card boundaries on mobile

#### StatsGrid
**File**: `components/dashboard/stats-grid.tsx`
**Type**: Client Component
**Props**:
```typescript
interface StatsGridProps {
  plansCreated: number
  mealsLogged: number
}
```
**Responsibilities**:
- Display stats in 2-column grid
- Format numbers with proper styling

#### GeneratePlanCTA
**File**: `components/dashboard/generate-plan-cta.tsx`
**Type**: Client Component
**Props**:
```typescript
interface GeneratePlanCTAProps {
  onClick?: () => void
}
```
**Responsibilities**:
- Large primary-colored CTA card
- Navigate to /plans/generate on click

#### BottomNav
**File**: `components/layout/bottom-nav.tsx`
**Type**: Client Component
**Props**:
```typescript
interface BottomNavProps {
  activeTab: 'home' | 'recipes' | 'plans' | 'profile'
}
```
**Responsibilities**:
- Fixed bottom navigation
- Highlight active tab
- Handle navigation
- Responsive visibility (hidden on desktop > 1024px)

#### TopAppBar
**File**: `components/layout/top-app-bar.tsx`
**Type**: Client Component
**Props**:
```typescript
interface TopAppBarProps {
  userName?: string // Optional for MVP
  avatarUrl?: string // Optional for MVP
}
```
**Responsibilities**:
- Sticky header with backdrop blur
- Logo display
- User avatar placeholder

#### GreetingHeader
**File**: `components/dashboard/greeting-header.tsx`
**Type**: Client Component
**Props**:
```typescript
interface GreetingHeaderProps {
  userName?: string // Optional for MVP
}
```
**Responsibilities**:
- Time-based greeting logic
- Display user name when available

## 2. Data Layer Architecture

### 2.1 Dashboard Store
**File**: `stores/dashboard-store.ts`

```typescript
interface MealPlan {
  id: string
  name: string
  dateRange: string
  caloriesPerDay: number
  images: string[]
  createdAt: Date
}

interface DashboardState {
  // Progress tracking
  caloriesEaten: number
  proteinEaten: number
  carbsEaten: number
  fatEaten: number

  // Stats
  plansCreated: number
  mealsLogged: number

  // Recent plans
  recentPlans: MealPlan[]

  // Actions
  setProgress: (calories: number, protein: number, carbs: number, fat: number) => void
  setStats: (plans: number, meals: number) => void
  setRecentPlans: (plans: MealPlan[]) => void
}
```

### 2.2 Data Hook
**File**: `lib/hooks/use-dashboard-data.ts`

```typescript
export function useDashboardData() {
  const onboardingStore = useOnboardingStore()
  const dashboardStore = useDashboardStore()

  // For MVP: Return combined data (real macros + dummy progress)
  return {
    macros: {
      targetCalories: onboardingStore.targetCalories || 2450,
      proteinGrams: onboardingStore.proteinGrams || 180,
      carbGrams: onboardingStore.carbGrams || 280,
      fatGrams: onboardingStore.fatGrams || 68,
    },
    progress: {
      caloriesEaten: dashboardStore.caloriesEaten,
      proteinEaten: dashboardStore.proteinEaten,
      carbsEaten: dashboardStore.carbsEaten,
      fatEaten: dashboardStore.fatEaten,
    },
    stats: {
      plansCreated: dashboardStore.plansCreated,
      mealsLogged: dashboardStore.mealsLogged,
    },
    recentPlans: dashboardStore.recentPlans,
  }
}
```

### 2.3 Dummy Data Generator
**File**: `lib/data/dummy-dashboard-data.ts`

```typescript
export const DUMMY_MEAL_PLANS: MealPlan[] = [
  {
    id: '1',
    name: '7-Day Muscle Plan',
    dateRange: 'Nov 1-7, 2025',
    caloriesPerDay: 2450,
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', // grilled chicken
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445', // salmon
      'https://images.unsplash.com/photo-1467453678174-768ec283a940', // asparagus
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', // rice
    ],
    createdAt: new Date('2025-11-01'),
  },
  {
    id: '2',
    name: 'High-Protein Week',
    dateRange: 'Oct 25-31, 2025',
    caloriesPerDay: 2600,
    images: [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
    ],
    createdAt: new Date('2025-10-25'),
  },
  {
    id: '3',
    name: 'Lean Bulk Cycle',
    dateRange: 'Oct 18-24, 2025',
    caloriesPerDay: 2800,
    images: [
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    ],
    createdAt: new Date('2025-10-18'),
  },
]

// Initialize dashboard with dummy data
export function initializeDummyDashboardData() {
  const store = useDashboardStore.getState()

  // Set dummy progress (60% eaten)
  const targetCalories = useOnboardingStore.getState().targetCalories || 2450
  store.setProgress(
    Math.round(targetCalories * 0.6), // 60% of calories
    108, // 60% of 180g protein
    168, // 60% of 280g carbs
    41,  // 60% of 68g fat
  )

  // Set dummy stats
  store.setStats(12, 45)

  // Set dummy recent plans
  store.setRecentPlans(DUMMY_MEAL_PLANS)
}
```

## 3. File Structure

```
app/
  dashboard/
    page.tsx                    # Main dashboard page
    loading.tsx                 # Loading skeleton
    error.tsx                   # Error boundary
  plans/
    page.tsx                    # Plans list (placeholder)
    today/
      page.tsx                  # Today's plan (placeholder)
    generate/
      page.tsx                  # Generate plan (placeholder)
    [id]/
      page.tsx                  # Plan detail (placeholder)
  recipes/
    page.tsx                    # Recipes list (placeholder)
  profile/
    page.tsx                    # Profile page (placeholder)

components/
  dashboard/
    macro-target-card.tsx
    meal-plan-card.tsx
    recent-plans-carousel.tsx
    stats-grid.tsx
    generate-plan-cta.tsx
    greeting-header.tsx
  layout/
    top-app-bar.tsx
    bottom-nav.tsx

stores/
  dashboard-store.ts            # Dashboard state management

lib/
  hooks/
    use-dashboard-data.ts       # Data fetching hook
    use-greeting.ts             # Time-based greeting logic
  data/
    dummy-dashboard-data.ts     # Dummy data for MVP
  utils/
    time-utils.ts               # Time-based utilities
```

## 4. Routing Strategy

### 4.1 Route Definitions

| Route | Purpose | Status |
|-------|---------|--------|
| `/dashboard` | Main dashboard | **Implement** |
| `/plans` | Plans list | Placeholder |
| `/plans/today` | Today's plan detail | Placeholder |
| `/plans/generate` | Meal plan generator | Placeholder |
| `/plans/:id` | Specific plan detail | Placeholder |
| `/recipes` | Recipe library | Placeholder |
| `/profile` | User profile | Placeholder |

### 4.2 Navigation Updates

**Update**: `app/(auth)/onboarding/6/page.tsx`
- Change redirect from `/onboarding/complete` to `/dashboard`
- Update AuthModal onSuccess callback to navigate to `/dashboard`

### 4.3 Placeholder Page Template

```typescript
// app/plans/page.tsx (example)
export default function PlansPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-charcoal">Plans</h1>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  )
}
```

## 5. Responsive Design Plan

### 5.1 Breakpoints

```typescript
// Mobile First Approach
const breakpoints = {
  mobile: '0px',      // 0 - 767px
  tablet: '768px',    // 768px - 1023px
  desktop: '1024px',  // 1024px+
}
```

### 5.2 Layout Changes by Breakpoint

#### Mobile (< 768px)
- Full-width layout: `w-full px-4`
- Cards stack vertically
- Recent Plans: Horizontal scroll, cards at 75% width
- Bottom nav: Visible and fixed
- Single column for all content

#### Tablet (768px - 1023px)
- Container: `max-w-3xl mx-auto px-6`
- Recent Plans: Show 2 cards at a time
- Stats: 2-column grid remains
- Bottom nav: Still visible

#### Desktop (≥ 1024px)
- Container: `max-w-7xl mx-auto px-8`
- Recent Plans: Show 3 cards OR grid layout
- Stats: Could expand to more columns
- Bottom nav: Hidden, replace with sidebar OR keep bottom nav
- More generous spacing: `space-y-8`

### 5.3 Responsive Classes Pattern

```typescript
// Example component with responsive classes
<div className="
  w-full px-4
  md:max-w-3xl md:mx-auto md:px-6
  lg:max-w-7xl lg:px-8
">
  {/* Content */}
</div>
```

## 6. Implementation Steps

### Phase 1: Setup & Data Layer (30 min)
1. Create dashboard store (`stores/dashboard-store.ts`)
2. Create dummy data file (`lib/data/dummy-dashboard-data.ts`)
3. Create data hook (`lib/hooks/use-dashboard-data.ts`)
4. Create time utilities (`lib/utils/time-utils.ts`)
5. Create greeting hook (`lib/hooks/use-greeting.ts`)

### Phase 2: Layout Components (45 min)
6. Create TopAppBar component
7. Create BottomNav component
8. Create GreetingHeader component
9. Test layout components in isolation

### Phase 3: Dashboard Components (60 min)
10. Create MacroTargetCard component
11. Create MealPlanCard component
12. Create RecentPlansCarousel component
13. Create StatsGrid component
14. Create GeneratePlanCTA component

### Phase 4: Main Dashboard Page (30 min)
15. Create dashboard page layout
16. Integrate all components
17. Add loading.tsx skeleton
18. Add error.tsx boundary

### Phase 5: Placeholder Pages (15 min)
19. Create placeholder pages for all routes
20. Add navigation logic to bottom nav

### Phase 6: Onboarding Integration (15 min)
21. Update onboarding step 6 redirect
22. Test full onboarding → dashboard flow

### Phase 7: Responsive Polish (30 min)
23. Test and refine mobile layout
24. Test and refine tablet layout
25. Test and refine desktop layout
26. Verify horizontal scroll behavior

### Phase 8: Final Testing (30 min)
27. Test all navigation flows
28. Verify data displays correctly
29. Check accessibility
30. Run build and fix any errors

**Total Estimated Time**: ~4 hours

## 7. Code Patterns & Examples

### 7.1 Time-Based Greeting

```typescript
// lib/hooks/use-greeting.ts
export function useGreeting(userName?: string) {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    let timeGreeting = 'Good morning'

    if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon'
    } else if (hour >= 17) {
      timeGreeting = 'Good evening'
    }

    setGreeting(userName ? `${timeGreeting}, ${userName}!` : `${timeGreeting}!`)
  }, [userName])

  return greeting
}
```

### 7.2 Horizontal Scroll Container

```typescript
// components/dashboard/recent-plans-carousel.tsx
<div className="relative w-full overflow-hidden">
  <div className="
    flex gap-4 overflow-x-auto pb-4 px-4
    snap-x snap-mandatory
    scrollbar-hide
    md:px-6 lg:px-8
  ">
    {plans.map((plan) => (
      <div
        key={plan.id}
        className="
          flex-shrink-0 w-[75%]
          snap-center
          md:w-[45%] lg:w-[30%]
        "
      >
        <MealPlanCard {...plan} />
      </div>
    ))}
  </div>
</div>
```

### 7.3 Macro Target Card with Progress

```typescript
// components/dashboard/macro-target-card.tsx
const progressPercent = Math.round((caloriesEaten / targetCalories) * 100)

return (
  <Card className="p-6 shadow-md">
    <h2 className="text-lg font-bold text-charcoal">Today's Macro Target</h2>

    <div className="flex items-baseline gap-2 mt-2">
      <p className="text-3xl font-extrabold text-charcoal">
        {targetCalories.toLocaleString()}
      </p>
      <p className="text-base text-muted-foreground">cal</p>
    </div>

    <div className="mt-4 mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-muted-foreground">Progress</span>
        <span className="text-sm font-medium text-muted-foreground">
          {progressPercent}% eaten
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🥩</span>
        <div className="flex flex-col">
          <p className="text-xs text-muted-foreground">Protein</p>
          <p className="text-sm font-bold text-charcoal">{proteinGrams}g</p>
        </div>
      </div>
      {/* Repeat for Carbs and Fat */}
    </div>

    <Button
      variant="ghost"
      className="w-full mt-4 text-primary"
      onClick={() => router.push('/plans/today')}
    >
      View Today's Plan →
    </Button>
  </Card>
)
```

### 7.4 Bottom Nav Active State

```typescript
// components/layout/bottom-nav.tsx
const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'recipes', label: 'Recipes', icon: BookOpen, path: '/recipes' },
  { id: 'plans', label: 'Plans', icon: Calendar, path: '/plans' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
]

return (
  <nav className="
    fixed bottom-0 left-0 right-0 z-50
    h-16 bg-card/80 backdrop-blur-sm
    border-t border-border
    lg:hidden
  ">
    <div className="grid grid-cols-4 h-full max-w-lg mx-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.path)}
            className={cn(
              "flex flex-col items-center justify-center gap-1",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className={cn(
              "size-5",
              isActive && "fill-primary"
            )} />
            <span className={cn(
              "text-xs",
              isActive && "font-bold"
            )}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  </nav>
)
```

## 8. Testing Strategy

### 8.1 Component Testing
- Test MacroTargetCard with different calorie values
- Test progress bar percentage calculations
- Test MealPlanCard renders all props correctly
- Test time-based greeting logic returns correct greeting

### 8.2 Integration Testing
- Test full dashboard page renders without errors
- Test navigation from dashboard to all placeholder pages
- Test onboarding → dashboard redirect flow
- Test horizontal scroll behavior

### 8.3 Responsive Testing
- Mobile: iPhone SE (375px)
- Tablet: iPad (768px)
- Desktop: 1920px
- Test on actual devices if possible

### 8.4 Accessibility Testing
- Screen reader: All content readable
- Keyboard nav: All interactive elements focusable
- Color contrast: WCAG AA compliance
- Focus indicators: Visible on all elements

## 9. Edge Cases & Error Handling

### 9.1 No Onboarding Data
**Scenario**: User navigates to dashboard without completing onboarding

**Solution**:
```typescript
// app/dashboard/page.tsx
const onboardingStore = useOnboardingStore()

if (!onboardingStore.targetCalories) {
  redirect('/onboarding/1')
}
```

### 9.2 No Recent Plans
**Scenario**: User has no meal plans yet

**Solution**:
```typescript
// Show empty state
{recentPlans.length === 0 ? (
  <EmptyState
    title="No plans yet"
    description="Create your first plan in 3 seconds"
    action={<Button onClick={() => router.push('/plans/generate')}>
      Generate Now →
    </Button>}
  />
) : (
  <RecentPlansCarousel plans={recentPlans} />
)}
```

### 9.3 Loading States
**Scenario**: Data is loading from server

**Solution**:
- Use Suspense with loading.tsx
- Show skeleton components during load
- Avoid flash of empty content

### 9.4 Error States
**Scenario**: Data fetch fails

**Solution**:
- Use error.tsx error boundary
- Show user-friendly error message
- Provide retry button

## 10. Migration Path to Supabase

### 10.1 Current Architecture (MVP)
```typescript
// lib/hooks/use-dashboard-data.ts
export function useDashboardData() {
  // Returns dummy data + onboarding store data
  return {
    macros: { ...onboardingStore },
    progress: { ...dummyProgress },
    stats: { ...dummyStats },
    recentPlans: DUMMY_MEAL_PLANS,
  }
}
```

### 10.2 Future Architecture (Supabase)
```typescript
// lib/hooks/use-dashboard-data.ts
export function useDashboardData() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const supabase = createClient()

      // Fetch user profile (includes onboarding macros)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .single()

      // Fetch today's progress
      const { data: progress } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single()

      // Fetch stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .single()

      // Fetch recent plans
      const { data: plans } = await supabase
        .from('meal_plans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)

      return {
        macros: {
          targetCalories: profile.target_calories,
          proteinGrams: profile.protein_grams,
          carbGrams: profile.carb_grams,
          fatGrams: profile.fat_grams,
        },
        progress: progress || { caloriesEaten: 0, ... },
        stats: stats || { plansCreated: 0, mealsLogged: 0 },
        recentPlans: plans || [],
      }
    },
  })

  return { data, isLoading, error }
}
```

### 10.3 Database Schema (Future)

```sql
-- User profiles (stores onboarding data)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  target_calories INT NOT NULL,
  protein_grams INT NOT NULL,
  carb_grams INT NOT NULL,
  fat_grams INT NOT NULL,
  goal TEXT NOT NULL,
  activity_level TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Daily progress tracking
CREATE TABLE daily_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  calories_eaten INT DEFAULT 0,
  protein_eaten INT DEFAULT 0,
  carbs_eaten INT DEFAULT 0,
  fat_eaten INT DEFAULT 0,
  UNIQUE(user_id, date)
);

-- User stats
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  plans_created INT DEFAULT 0,
  meals_logged INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Meal plans
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  calories_per_day INT NOT NULL,
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 10.4 Migration Checklist

When ready to migrate to Supabase:

1. ✅ Create database tables using schema above
2. ✅ Update `use-dashboard-data.ts` hook to fetch from Supabase
3. ✅ Update onboarding completion to save to `user_profiles`
4. ✅ Add loading states to dashboard components
5. ✅ Add error handling for failed queries
6. ✅ Test data fetching with real user accounts
7. ✅ Remove dummy data files
8. ✅ Update tests to mock Supabase client

## 11. Design System Compliance

### 11.1 Colors (from globals.css)
- Primary actions: `bg-primary` (#FF6B35)
- Text: `text-charcoal` (#1F1F1F)
- Muted text: `text-muted-foreground` (#6C757D)
- Macro colors: `text-protein`, `text-carb`, `text-fat`
- Backgrounds: `bg-background`, `bg-card`

### 11.2 Typography
- Headings: `font-bold text-xl` to `text-3xl`
- Body: `text-base` or `text-sm`
- Tracking: `-tracking-tight` for large headings

### 11.3 Spacing
- Card padding: `p-4` or `p-6`
- Section gaps: `space-y-4` to `space-y-6`
- Grid gaps: `gap-3` or `gap-4`

### 11.4 Shadows
- Cards: `shadow-md` or `shadow-[0_4px_12px_rgba(0,0,0,0.05)]`
- Elevated elements: `shadow-lg`

### 11.5 Borders
- Default: `border-border`
- Radius: `rounded-lg` or `rounded-xl`
- Card style: `rounded-xl border border-border`

## 12. Accessibility Checklist

- [ ] All images have alt text
- [ ] All buttons have aria-labels
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Keyboard navigation works for all interactions
- [ ] Screen reader announces page sections correctly
- [ ] Progress bar has aria-valuenow/valuemin/valuemax
- [ ] Navigation tabs have aria-current on active tab
- [ ] Horizontal scroll has keyboard support

## 13. Performance Considerations

### 13.1 Image Optimization
- Use Next.js Image component for all images
- Add loading="lazy" for meal plan images
- Provide width/height to prevent layout shift
- Use blur placeholder for better UX

### 13.2 Code Splitting
- Each dashboard component in separate file
- Use dynamic imports for heavy components
- Lazy load placeholder pages

### 13.3 Bundle Size
- Minimize client-side JavaScript
- Use Server Components where possible
- Avoid unnecessary dependencies

## 14. Success Criteria

✅ Dashboard loads with real macro data from onboarding
✅ Progress bar displays correctly with dummy data
✅ Recent plans carousel scrolls smoothly
✅ All navigation links work (even to placeholders)
✅ Responsive on mobile, tablet, desktop
✅ Passes accessibility audit
✅ Build completes with 0 errors
✅ Time-based greeting works correctly
✅ Bottom nav highlights active tab
✅ Architecture ready for Supabase migration

## 15. Handoff to Coding Agent

**Next Steps for Implementation**:

1. Start with Phase 1 (Setup & Data Layer)
2. Implement components in order of dependencies
3. Test each component in isolation before integration
4. Follow responsive design patterns exactly
5. Use provided code examples as templates
6. Maintain style consistency with onboarding flow
7. Run build after each phase to catch errors early
8. Test on multiple screen sizes throughout

**Key Reminders**:
- Pull macro data from onboarding store
- Use dummy data for progress and stats
- All navigation should work (even to empty pages)
- Follow mobile-first responsive approach
- Maintain accessibility standards
- Keep components small and focused
- Architecture should support easy Supabase migration

---

**Document Version**: 1.0
**Last Updated**: 2025-11-10
**Status**: Ready for Implementation
