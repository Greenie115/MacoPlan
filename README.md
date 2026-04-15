# Macro Plan

AI-powered macro tracking and meal planning app built with Next.js 16, React 19, and Supabase.

## Features

- ✅ 6-step onboarding flow with personalized macro calculation
- ✅ Google OAuth & Email/Password authentication
- ✅ Smart dietary preferences & allergy tracking
- ✅ Experience-based UI personalization
- ✅ Secure data persistence with Row Level Security
- 🚧 Dashboard (in progress)
- 🚧 Meal planning (coming soon)
- 🚧 Food logging (coming soon)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **State**: Zustand with localStorage persistence
- **Auth & Database**: Supabase (PostgreSQL + OAuth)
- **Validation**: Zod + React Hook Form
- **TypeScript**: Strict mode, zero `any` types
- **Calculations**: Mifflin-St Jeor BMR equation

## Getting Started

### Prerequisites

- Node.js 18+
- npm/pnpm/yarn
- Supabase account

### Installation

```bash
# Clone repository
git clone <repo-url>
cd maco-plan

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials to .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: Supabase Dashboard → Project Settings → API

### Database Setup

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration: `supabase/migrations/001_create_user_profiles.sql`
3. Verify RLS policies are enabled

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to onboarding.

## Project Structure

```
app/
├── (auth)/
│   └── onboarding/          # 6-step onboarding flow
│       ├── 1/               # Goal selection
│       ├── 2/               # Personal stats
│       ├── 3/               # Activity level
│       ├── 4/               # Dietary preferences
│       ├── 5/               # Experience level
│       ├── 6/               # Results & macro targets
│       └── complete/        # Post-auth data migration
├── auth/callback/           # OAuth callback handler
├── dashboard/               # Main app (in progress)
└── actions/                 # Server actions (DB operations)

components/
├── auth/                    # AuthModal component
├── onboarding/              # StepContainer, ProgressIndicator
└── ui/                      # shadcn/ui components

lib/
├── calculations/            # BMR, TDEE, macro distribution
├── migration/               # localStorage → Supabase sync
├── supabase/                # Supabase client utilities
└── types/                   # TypeScript types

stores/
└── onboarding-store.ts      # Zustand state management

supabase/
└── migrations/              # SQL migrations
```

## Onboarding Flow

Macro Plan guides users through a 6-step onboarding process:

1. **Goal Selection** - Choose fitness goal (Cut, Bulk, Maintain, or Recomp)
2. **Personal Stats** - Enter age, weight, height, and sex
3. **Activity Level** - Select from 5 activity levels (Sedentary to Extremely Active)
4. **Dietary Preferences** _(optional)_ - Diet style, allergies, foods to avoid
5. **Experience Level** - Fitness, tracking, and meal prep experience
6. **Results** - View calculated macro targets and TDEE

After viewing results, users can:
- Sign up with Google OAuth
- Sign up with Email/Password
- Continue as guest (data saved to localStorage only)

## Macro Calculation

Macro Plan uses scientifically-validated formulas:

**BMR (Basal Metabolic Rate)**:
- Formula: Mifflin-St Jeor equation
- `BMR = 10W + 6.25H - 5A + S`
- W = weight (kg), H = height (cm), A = age, S = +5 (male) or -161 (female)

**TDEE (Total Daily Energy Expenditure)**:
- `TDEE = BMR × Activity Multiplier`
- Sedentary: 1.2x | Lightly Active: 1.375x | Moderately Active: 1.55x
- Very Active: 1.725x | Extremely Active: 1.9x

**Macro Distribution**:
- **Cut**: 20% calorie deficit, 1g protein/lb, 30% fat, remaining carbs
- **Bulk**: 10% surplus, 0.8g protein/lb, 25% fat, remaining carbs
- **Maintain/Recomp**: Maintenance calories, balanced distribution

## Database Schema

See `supabase/migrations/001_create_user_profiles.sql` for complete schema.

**Key Tables**:
- `user_profiles` - User data, onboarding responses, calculated macros

**Security**:
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Enforced at database level via `auth.uid()`

## Development

### Build for Production

```bash
npm run build
```

### Run Production Build Locally

```bash
npm run build
npm start
```

### Lint Code

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Test coverage
npm run test:coverage
```

## Security

Macro Plan follows security best practices:

- ✅ **Semgrep Scans**: 0 vulnerabilities detected
- ✅ **Row Level Security**: All database access restricted by user
- ✅ **Type Safety**: TypeScript strict mode, no `any` types
- ✅ **Input Validation**: Zod schemas on all forms
- ✅ **No Secrets in Code**: All sensitive data in environment variables
- ✅ **OAuth Security**: Supabase-managed authentication
- ✅ **SQL Injection Protection**: Parameterized queries via Supabase client

**Security Rating**: 9/10 (see CRITICAL_REVIEW.md for full audit)

## Documentation

- **ONBOARDING_FLOW_SPECIFICATION.md** - Complete technical specification
- **IMPLEMENTATION_SUMMARY.md** - What was built (Phases A-C)
- **CRITICAL_REVIEW.md** - Security & quality audit results
- **CLEANUP_AND_NEXT_PHASE_PLAN.md** - Cleanup plan & next development phases

## Roadmap

### Current Status: 75% Complete

**Completed**:
- [x] Phase A: Steps 4-5 implementation
- [x] Phase B: Authentication system
- [x] Phase C: Database integration

**In Progress**:
- [ ] Phase D: Testing & polish

**Planned**:
- [ ] Phase E: Dashboard MVP
- [ ] Phase F: Error handling & edge cases
- [ ] Phase G: Performance optimization
- [ ] Phase H: Meal planning features
- [ ] Phase I: Food logging
- [ ] Phase J: Progress tracking & analytics

## Contributing

1. Create feature branch from `main`
2. Follow existing code patterns and conventions
3. Ensure TypeScript has zero errors
4. Run security scan: `npm run security:scan`
5. Test thoroughly on local environment
6. Create PR with detailed description

### Code Style

- Use TypeScript strict mode
- No `any` types allowed
- Functional components with hooks
- Follow shadcn/ui patterns for components
- Use server actions for database operations
- Add JSDoc comments for complex logic

## Environment Setup

### Supabase Configuration

1. Create project at [supabase.com](https://supabase.com)
2. Enable Google OAuth provider (optional)
3. Configure redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`
4. Run SQL migration from `supabase/migrations/`
5. Verify RLS policies are active

### Local Development

```bash
# Start dev server
npm run dev

# In another terminal, run type checking
npx tsc --noEmit --watch

# Optional: Run tests in watch mode
npm run test:watch
```

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to `main`

### Environment Variables (Production)

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Post-Deployment

1. Update Supabase redirect URLs with production domain
2. Test authentication flow
3. Verify RLS policies work correctly
4. Monitor errors with error tracking service

## Troubleshooting

### Build Errors

**TypeScript errors**:
```bash
npx tsc --noEmit
# Fix all errors before building
```

**Missing environment variables**:
```bash
# Ensure .env.local exists with Supabase credentials
cat .env.local
```

### Authentication Issues

**Google OAuth not working**:
1. Check redirect URL matches in Google Console
2. Verify Supabase provider is enabled
3. Check browser console for errors

**Email signup not working**:
1. Check Supabase email templates are configured
2. Verify email confirmation is enabled
3. Check spam folder for confirmation email

### Database Issues

**RLS policy errors**:
1. Verify user is authenticated: `supabase.auth.getUser()`
2. Check policy using SQL Editor
3. Ensure `auth.uid()` matches `user_id`

**Data not saving**:
1. Check server action returns `{ success: true }`
2. Verify network tab shows successful request
3. Check Supabase logs for errors

## Performance

**Current Metrics**:
- Build time: ~4 seconds
- Routes generated: 15
- TypeScript compilation: ~1.4 seconds

**Optimization TODO**:
- [ ] Code splitting for routes
- [ ] Lazy load heavy components
- [ ] Optimize bundle size (<500KB target)
- [ ] Add loading skeletons
- [ ] Implement React.memo where beneficial

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Create GitHub issue
- Check documentation in `/docs`
- Review CRITICAL_REVIEW.md for security questions

---

**Built with ❤️ using Next.js 16, React 19, and Supabase**

Last Updated: January 8, 2025
