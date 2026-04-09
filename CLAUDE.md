# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev              # Start Next.js development server on localhost:3000
npm run build            # Build production bundle
npm start                # Run production server (requires build first)
npm run lint             # Run ESLint
npx tsc --noEmit         # Type check without emitting files
```

### Testing
```bash
npm run test             # Run Vitest unit tests
npm run test:ui          # Run tests with Vitest UI
npm run test:coverage    # Run tests with coverage report
```

### Supabase
Migrations are located in `supabase/migrations/*.sql` and must be run manually in Supabase SQL Editor. There is no local Supabase CLI setup.

## Architecture Overview

MacroPlan is a fitness macro calculator and meal planning SaaS built with Next.js 16 App Router, React 19, TypeScript, and Supabase.

### Core Flow

1. **Onboarding (Guest)**: 6-step flow stored in Zustand with localStorage persistence
2. **Authentication**: Google OAuth or email/password via Supabase Auth
3. **Data Migration**: On signup, localStorage data syncs to `user_profiles` table
4. **Dashboard**: Authenticated users access meal plans, recipes, and tracking features

### State Management Architecture

**Zustand Store (`stores/onboarding-store.ts`)**:
- Persists onboarding data to localStorage for guest users
- Used during steps 1-6 before authentication
- Contains goal, personal stats, activity level, dietary preferences, experience level, and calculated macros
- **SSR Safety**: Custom storage wrapper handles `typeof window === 'undefined'` checks

**Critical Pattern**: Do NOT access `useOnboardingStore` during SSR (server components). Only use in Client Components marked with `'use client'`.

### Authentication & Data Flow

**Two-Stage Data Storage**:
1. **Pre-Auth**: `localStorage` via Zustand (guest users)
2. **Post-Auth**: `user_profiles` table in Supabase (authenticated users)

**Migration Path** (`lib/migration/`):
- After Google OAuth callback or email signup
- `/onboarding/complete` page syncs localStorage → Supabase
- Migration helper: `migrateOnboardingData()`

### Supabase Client Patterns

**Server Components & Server Actions**:
```typescript
import { createClient } from '@/lib/supabase/server'

export async function myServerAction() {
  const supabase = await createClient() // Must await!
  const { data: { user } } = await supabase.auth.getUser()
  // ...
}
```

**Client Components**:
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const supabase = createClient() // No await
  // ...
}
```

**Middleware** (`middleware.ts` + `lib/supabase/middleware.ts`):
- Uses `SUPABASE_SERVICE_ROLE_KEY` (not anon key) for auth token refresh
- Protects routes: redirects unauthenticated users from `/dashboard`, `/plans`, etc.
- Redirects authenticated users away from `/login`, `/signup`, `/` to `/dashboard`

### Recipe & Meal Plan APIs

**Recipe-API.com** (`lib/services/recipe-api.ts`):
- Simple `X-API-Key` header auth (Vercel-compatible, no IP restrictions)
- Singleton: `recipeApiService` (lazy-initialized)
- Normalizes responses to `NormalizedRecipe` interface (`lib/types/recipe.ts`)
- Supabase-backed caching: 7 days search, 30 days details
- Request deduplication via `inflightRequests` Map

**Unsplash** (`lib/services/unsplash.ts`):
- `Client-ID` header auth, 50 req/hr free tier
- Singleton: `unsplashService` (lazy-initialized)
- Permanent image caching in `recipe_images` table
- Attribution required: "Photo by {name} on Unsplash"

**Meal Plan Generator** (`lib/services/meal-plan-generator.ts`):
- Generates daily/weekly meal plans using Recipe-API.com search
- Dietary search prefixes, scoring, conflict detection

### Database Schema

**Key Tables**:
- `user_profiles`: All onboarding data, macros, experience levels
- `recipes`: Recipe catalog (title, ingredients, instructions, nutritional info)
- `meal_plans`: User-generated meal plans
- `meal_plan_meals`: Links meals to recipes (has `recipe_api_id` column)
- `user_recipe_favorites`: User's saved external recipes (column: `recipe_id`)
- `recipe_api_cache`: Cached Recipe-API.com recipe details (30 day TTL)
- `recipe_api_search_cache`: Cached search results (7 day TTL)
- `recipe_images`: Permanently cached Unsplash image URLs

**Row Level Security**: All tables use RLS with `auth.uid() = user_id` policies. Users can ONLY access their own data.

### Calculation Engine

Located in `lib/calculations/`:
- `bmr.ts`: Mifflin-St Jeor BMR formula
- `tdee.ts`: TDEE = BMR × activity multiplier (1.2 to 1.9)
- `macros.ts`: Goal-based macro distribution (cut: deficit + 1g protein/lb, bulk: surplus + 0.8g/lb, etc.)

**Important**: Calculations run client-side during onboarding (step 6) via Zustand store actions. Server recalculates during profile creation to ensure data integrity.

### Server Actions Pattern

All server actions in `app/actions/*.ts` follow this structure:
1. `'use server'` directive at top
2. Create Supabase server client
3. Get authenticated user via `supabase.auth.getUser()`
4. Perform database operation with RLS (automatically scoped to user)
5. `revalidatePath()` to update cache
6. Return `{ success: true }` or `{ error: string }`

**Never expose raw database errors to client**. Always return generic error messages.

### Route Structure

```
app/
├── (auth)/
│   └── onboarding/[1-6]     # Guest onboarding flow
├── onboarding/complete/      # Post-auth data migration
├── auth/callback/            # OAuth redirect handler
├── login/                    # Email/password login
├── signup/                   # Email signup
├── dashboard/                # Main authenticated dashboard
├── plans/                    # Meal plan CRUD
├── recipes/                  # Recipe browsing
└── actions/                  # Server actions (not routes)
```

### Component Patterns

**shadcn/ui**: All UI components in `components/ui/` installed via `npx shadcn@latest add <component>`.

**Feature Components**:
- `components/auth/`: AuthModal (Google + email auth)
- `components/onboarding/`: StepContainer, ProgressIndicator
- `components/dashboard/`: Dashboard-specific features
- `components/plans/`: Meal plan UI components
- `components/recipes/`: Recipe cards, filters

**Composition Pattern**: Most pages compose multiple smaller components. Components receive props via standard React patterns (no Context overuse).

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For middleware only
```

Required for recipes/meal plans:
```
RECIPE_API_KEY=your-recipe-api-key          # From recipe-api.com (still used for /recipes browse)
UNSPLASH_ACCESS_KEY=your-unsplash-key       # From unsplash.com/developers
ANTHROPIC_API_KEY=sk-ant-...                # From console.anthropic.com (batch prep generation)
```

Optional:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Security**: Never commit `.env.local`. Service role key should ONLY be used in middleware for auth refresh.

### TypeScript Standards

- **Strict mode enabled**: No `any` types allowed
- **Type imports**: Use `import type { ... }` for type-only imports
- **Database types**: Generated from Supabase schema in `lib/types/database.ts`
- **Zod schemas**: All forms validated with Zod + React Hook Form

### Common Pitfalls

1. **localStorage in SSR**: Always check `typeof window !== 'undefined'` before accessing localStorage
2. **Supabase client confusion**: Server components need `await createClient()`, client components don't
3. **Middleware key**: Middleware uses service role key, NOT anon key (required for auth token refresh)
4. **RLS policies**: All queries automatically scoped by user. Don't add manual `user_id` filters (redundant)
5. **Migration timing**: Data migration happens in `/onboarding/complete`, NOT in auth callback
6. **Zustand SSR**: Never call `useOnboardingStore()` in server components

### Key Files to Reference

- `stores/onboarding-store.ts`: Complete onboarding state definition
- `lib/supabase/server.ts` + `client.ts`: Supabase client creation patterns
- `middleware.ts`: Route protection logic
- `app/actions/profile.ts`: Example server action with full error handling
- `supabase/migrations/001_create_user_profiles.sql`: Database schema and RLS policies
- `lib/services/recipe-api.ts`: Recipe-API.com service with caching
- `lib/services/unsplash.ts`: Unsplash image service
- `lib/services/meal-plan-generator.ts`: Meal plan generation engine
- `app/actions/recipe-search.ts`: Recipe search server actions
- `lib/types/recipe.ts`: Provider-agnostic recipe types (`NormalizedRecipe`)
- `lib/types/recipe-api.ts`: Recipe-API.com response types

### Styling

- **Tailwind CSS v4**: Uses `@tailwindcss/postcss` plugin
- **CSS variables**: Brand colors defined in `app/globals.css` (HSL format)
- **Component variants**: Use `class-variance-authority` (CVA) for variant-based styling
- **Responsive**: Mobile-first approach (default styles are mobile, use `md:`, `lg:` for larger screens)

### Adding New Features

1. **Database Changes**: Create new migration SQL file in `supabase/migrations/`, run in Supabase SQL Editor
2. **Types**: Update `lib/types/database.ts` with new table/column types
3. **Server Actions**: Add to `app/actions/` with proper error handling
4. **UI Components**: Install via shadcn if available, or create in `components/`
5. **Routes**: Create in `app/` following App Router conventions

### Testing Strategy

- **Unit tests**: Vitest for utility functions (calculations, helpers)
- **Component tests**: React Testing Library (setup in progress)
- **E2E tests**: Playwright configuration exists but not fully implemented
- **Manual testing**: Always test auth flow, data migration, and RLS policies in Supabase dashboard

### Build & Deployment

Target platform: Vercel (optimized for Next.js 16)

**Pre-deployment checklist**:
1. `npm run build` succeeds with no TypeScript errors
2. All migrations applied in Supabase production
3. Environment variables configured in Vercel dashboard
4. OAuth redirect URLs updated in Supabase + Google Console
5. RLS policies verified in Supabase production instance
