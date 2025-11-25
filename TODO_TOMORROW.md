# MacroPlan - Tasks for Tomorrow

**Date Created:** 2025-11-25
**Current Phase:** Phase 2 - Advanced Meal Planning & Premium Features
**Today's Priority:** Day 1 - Grocery List Generator

---

## 🎯 Today's Goal

Implement the **Grocery List Generator** feature that allows users to automatically generate shopping lists from their meal plans.

**Estimated Time:** 1-2 days (aim to complete today)
**User Value:** 🔥🔥🔥 Very High (quick win)
**Complexity:** ⚙️ Low-Medium

---

## 📋 Implementation Checklist

### 1. Database Migration (30 min)
- [ ] Create new migration file: `supabase/migrations/YYYYMMDD_create_grocery_lists.sql`
- [ ] Copy schema from `PHASE_2_SPECIFICATION.md` Feature 1
- [ ] Tables to create:
  - `grocery_lists` (id, user_id, meal_plan_id, name, timestamps)
  - `grocery_list_items` (id, list_id, category, ingredient, amount, unit, checked, is_custom, order_index)
- [ ] Add RLS policies for both tables
- [ ] Add indexes for performance
- [ ] Run migration in Supabase SQL Editor

### 2. Server Actions (1-2 hours)
- [ ] Create `app/actions/grocery-lists.ts`
- [ ] Implement functions (see PHASE_2_SPECIFICATION.md for full code):
  - `generateGroceryList(planId)` - Main generation logic
  - `aggregateIngredients()` - Combine similar ingredients
  - `categorizeIngredient()` - Sort into categories (protein, produce, dairy, etc.)
  - `toggleGroceryItem(itemId)` - Check/uncheck items
  - `addCustomGroceryItem()` - User adds items manually
  - `deleteGroceryItem()` - Remove items
- [ ] Add proper authentication checks
- [ ] Add error handling with generic error messages
- [ ] Add `revalidatePath()` calls

### 3. UI Components (2-3 hours)
- [ ] Create `app/grocery-lists/[id]/page.tsx` - Server component page
- [ ] Create `components/grocery/grocery-list-view.tsx` - Client component
- [ ] Features to implement:
  - Header with list name and share button
  - Progress bar (% items checked)
  - Add custom item input
  - Items grouped by category (Protein, Produce, Dairy, Grains, Pantry, Other)
  - Checkbox to toggle checked status
  - Delete button for custom items (hidden, shows on hover)
  - Optimistic UI updates
- [ ] Use shadcn/ui components (Button, Input)
- [ ] Mobile-first responsive design

### 4. Integration with Plans Page (30 min)
- [ ] Update `app/plans/[id]/page.tsx` or create detail view
- [ ] Add "Generate Grocery List" button to plan view
- [ ] Wire up button to `generateGroceryList()` server action
- [ ] Redirect to grocery list page after generation
- [ ] Add success toast notification

### 5. Testing (30 min)
- [ ] Test full flow: Plan → Generate → View → Check items
- [ ] Test ingredient aggregation (same ingredient from multiple recipes)
- [ ] Test categorization accuracy
- [ ] Test custom item add/delete
- [ ] Test RLS policies (users can't access others' lists)
- [ ] Run build: `npm run build`
- [ ] Run type check: `npx tsc --noEmit`

### 6. Commit & Push
- [ ] Stage all changes
- [ ] Commit with descriptive message (see format in previous commits)
- [ ] Push to main branch

---

## 📖 Reference Documentation

**Detailed Specifications:** See `PHASE_2_SPECIFICATION.md` → Feature 1: Grocery List Generator

The specification contains:
- Complete database schema with SQL
- Full server action implementations
- Complete UI component code
- Testing strategy
- Edge cases to handle

**Existing Patterns to Follow:**
- Authentication: `app/actions/meal-logs.ts` (lines 14-23)
- Database queries: `app/actions/profile.ts`
- UI components: `components/recipes/log-recipe-modal.tsx`
- Server/client split: `app/recipes/[id]/page.tsx`

---

## 🚨 Important Notes

### Security
- ✅ All server actions must validate authentication
- ✅ Use RLS policies (users can only access their own lists)
- ✅ Return generic error messages (no database errors to client)
- ✅ Use `auth.uid() = user_id` in RLS policies

### Code Quality
- ✅ TypeScript strict mode (no `any` unless Supabase typing)
- ✅ Follow existing patterns (server actions, RLS, etc.)
- ✅ Mobile-first responsive design
- ✅ Optimistic UI updates with error rollback
- ✅ Toast notifications for user feedback

### Database
- ✅ Run migrations in Supabase SQL Editor (no local CLI)
- ✅ Test RLS policies before deploying
- ✅ Use `maybeSingle()` instead of `.single()` where multiple results possible

---

## 🎬 Quick Start Commands

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Start dev server
npm run dev

# Commit changes
git add .
git commit -m "feat: Implement grocery list generator

- Add database schema for grocery_lists and grocery_list_items
- Implement server actions for list generation and management
- Create UI components for viewing and managing lists
- Add integration with meal plans page
- Include RLS policies for data security

✅ All tests passing
✅ Build successful

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push
```

---

## 📊 Progress Tracking

After completing this feature, you will have:
- ✅ Day 1-2 of Phase 2 complete
- 🔄 Next up: Weekly Meal Planning UI (Days 3-5)
- 📈 Phase 2 progress: ~13-15% complete

---

## 💡 Tips for Success

1. **Start with the database** - Get the schema right first
2. **Copy code from spec** - The full implementation is in PHASE_2_SPECIFICATION.md
3. **Test as you go** - Don't wait until the end to test
4. **Follow existing patterns** - Look at similar features (meal logging, favorites)
5. **Mobile-first** - Start with mobile design, then scale up
6. **Commit frequently** - Commit after each major component works

---

## 🆘 If You Get Stuck

1. Check `PHASE_2_SPECIFICATION.md` for full code examples
2. Look at similar existing features for patterns
3. Check `CLAUDE.md` for architecture guidance
4. Review `SECURITY_REVIEW.md` for security best practices
5. Test with `npm run build` frequently to catch errors early

---

## 📅 Looking Ahead

After grocery lists are complete:
- **Day 3-5:** Weekly Meal Planning UI (calendar view)
- **Day 6-7:** Meal Plan Generator (algorithm-based)
- **Day 8-11:** Stripe Integration
- **Day 12:** Premium Feature Gating

---

**Good luck! This is a high-value feature that will delight users. 🚀**
