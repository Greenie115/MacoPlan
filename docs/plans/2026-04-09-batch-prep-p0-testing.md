# Batch Prep P0 — Manual Testing Checklist

Prerequisites:
- Run migration `20260409_batch_prep_mode.sql` in Supabase SQL Editor
- Set `ANTHROPIC_API_KEY` in Vercel environment variables
- Ensure `RECIPE_API_KEY` and `UNSPLASH_ACCESS_KEY` still set (for /recipes browse)

Happy path:
- [ ] Navigate to /meal-plans/generate as logged-in user
- [ ] Form pre-fills with smart defaults from user_profiles
- [ ] Click Generate → plan renders at /meal-plans/{id}
- [ ] Training day / rest day toggle switches meal list
- [ ] Shopping list tab shows consolidated quantities
- [ ] Click "Start prep day" → timeline view renders
- [ ] Check off steps → state persists on reload

Edge cases:
- [ ] Generate with exclusions "peanuts, shellfish" → Claude respects them
- [ ] Free tier user with 0 plans → generation succeeds
- [ ] Free tier user with 3 plans → generation blocked with upgrade CTA
- [ ] Premium user → unlimited generation
- [ ] Open legacy /meal-plans/{old-id} → fallback view shows

Landing & pricing:
- [ ] / shows new hero "Your meal prep, planned."
- [ ] "How it works" shows new 3-step copy
- [ ] Differentiator section renders
- [ ] /pricing shows updated feature table
