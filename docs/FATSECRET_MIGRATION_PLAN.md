# FatSecret API Migration Plan

## Executive Summary

This document outlines the migration strategy from Spoonacular API to FatSecret API for the MacroPlan application. The migration will provide access to FatSecret's comprehensive food database of 1.9M+ items and 17,000+ recipes while maintaining existing functionality.

---

## Table of Contents

1. [API Comparison](#api-comparison)
2. [Authentication](#authentication)
3. [Feature Mapping](#feature-mapping)
4. [Implementation Plan](#implementation-plan)
5. [Database Changes](#database-changes)
6. [Migration Checklist](#migration-checklist)

---

## API Comparison

### Current: Spoonacular

| Feature | Spoonacular | Limitation |
|---------|-------------|------------|
| Food Database | ~380K items | Limited free tier |
| Recipes | ~5K curated | 150 points/day (free) |
| Meal Planning | Built-in endpoint | Only 3 meals/day |
| Pricing | Points-based | Expensive at scale |
| Authentication | API Key | Simple but less secure |

### New: FatSecret

| Feature | FatSecret | Advantage |
|---------|-----------|-----------|
| Food Database | 1.9M+ items | Larger, more comprehensive |
| Recipes | 17K+ curated | More variety |
| Meal Planning | Profile Saved Meals | User-specific meal storage |
| Pricing | 5,000 calls/day free | More generous free tier |
| Authentication | OAuth 2.0 | More secure, token-based |

---

## Authentication

### FatSecret OAuth 2.0 Flow

```
┌──────────┐      ┌─────────────────┐      ┌────────────────┐
│  Client  │──────│  Your Server    │──────│  FatSecret     │
└──────────┘      └─────────────────┘      └────────────────┘
                          │
                          ▼
                  1. Request Token
                  POST https://oauth.fatsecret.com/connect/token
                  Authorization: Basic [base64(client_id:client_secret)]
                  Body: grant_type=client_credentials&scope=basic
                          │
                          ▼
                  2. Receive Access Token (24hr validity)
                  { access_token, token_type, expires_in, scope }
                          │
                          ▼
                  3. API Calls with Bearer Token
                  Authorization: Bearer [access_token]
```

### Important: IP Whitelisting Required

FatSecret requires IP addresses to be whitelisted for OAuth 2.0 API calls:

1. Go to https://platform.fatsecret.com/api-key-management
2. Add your development IP: `109.108.218.46` (current)
3. Add your production server IP when deploying

### Environment Variables

```env
# Already configured in .env.local
FATSECRET_ID=08e6e7bba653477e8cd7bdab5a4c31fc
FATSECRET_API_KEY=98e23689afaa433caa124281735fe2fc
```

---

## Feature Mapping

### 1. Food Search

| Spoonacular | FatSecret | Notes |
|-------------|-----------|-------|
| `/recipes/complexSearch` | `foods.search` | Search food database |
| `/food/ingredients/search` | `foods.search` | Same endpoint |
| `/recipes/autocomplete` | `foods.autocomplete` | Type-ahead search |

**FatSecret foods.search Request:**
```typescript
POST https://platform.fatsecret.com/rest/server.api
Authorization: Bearer {token}
Content-Type: application/x-www-form-urlencoded

method=foods.search
&search_expression=chicken breast
&format=json
&max_results=20
&page_number=0
```

**Response Structure:**
```typescript
interface FatSecretFoodSearchResult {
  foods: {
    food: Array<{
      food_id: string
      food_name: string
      food_type: 'Brand' | 'Generic'
      brand_name?: string
      food_description: string // Contains macros summary
      food_url: string
    }>
    max_results: string
    page_number: string
    total_results: string
  }
}
```

### 2. Food Details (Nutrition)

| Spoonacular | FatSecret | Notes |
|-------------|-----------|-------|
| `/recipes/{id}/information` | `food.get.v4` | Full nutrition data |
| `/recipes/{id}/nutritionWidget` | `food.get.v4` | Same endpoint |

**FatSecret food.get Response Structure:**
```typescript
interface FatSecretFoodDetail {
  food: {
    food_id: string
    food_name: string
    food_type: string
    brand_name?: string
    food_url: string
    servings: {
      serving: Array<{
        serving_id: string
        serving_description: string
        metric_serving_amount: string
        metric_serving_unit: string
        calories: string
        carbohydrate: string
        protein: string
        fat: string
        saturated_fat?: string
        polyunsaturated_fat?: string
        monounsaturated_fat?: string
        cholesterol?: string
        sodium?: string
        potassium?: string
        fiber?: string
        sugar?: string
        vitamin_a?: string
        vitamin_c?: string
        calcium?: string
        iron?: string
        is_default?: string
      }>
    }
  }
}
```

### 3. Recipe Search

| Spoonacular | FatSecret | Notes |
|-------------|-----------|-------|
| `/recipes/complexSearch` | `recipes.search` | Search recipes |
| - | `recipe_type` param | Filter by meal type |

**FatSecret recipes.search Request:**
```typescript
POST https://platform.fatsecret.com/rest/server.api

method=recipes.search
&search_expression=grilled chicken
&recipe_type=Main Dish  // Optional: Appetizer, Breakfast, Dessert, etc.
&format=json
&max_results=20
```

**Response Structure:**
```typescript
interface FatSecretRecipeSearchResult {
  recipes: {
    recipe: Array<{
      recipe_id: string
      recipe_name: string
      recipe_description: string
      recipe_image?: string
      recipe_nutrition: {
        calories: string
        carbohydrate: string
        fat: string
        protein: string
      }
    }>
    max_results: string
    page_number: string
    total_results: string
  }
}
```

### 4. Recipe Details

| Spoonacular | FatSecret | Notes |
|-------------|-----------|-------|
| `/recipes/{id}/information` | `recipe.get` | Full recipe details |

**FatSecret recipe.get Response:**
```typescript
interface FatSecretRecipeDetail {
  recipe: {
    recipe_id: string
    recipe_name: string
    recipe_description: string
    recipe_url: string
    recipe_images: {
      recipe_image: string[]
    }
    recipe_categories: {
      recipe_category: Array<{
        recipe_category_name: string
        recipe_category_url: string
      }>
    }
    recipe_types: {
      recipe_type: string[]
    }
    serving_sizes: {
      serving: {
        serving_size: string
        calories: string
        carbohydrate: string
        protein: string
        fat: string
        // ... other nutrients
      }
    }
    ingredients: {
      ingredient: Array<{
        food_id: string
        food_name: string
        serving_id: string
        number_of_units: string
        measurement_description: string
        ingredient_description: string
        ingredient_url: string
      }>
    }
    directions: {
      direction: Array<{
        direction_number: string
        direction_description: string
      }>
    }
    preparation_time_min?: string
    cooking_time_min?: string
    number_of_servings: string
    rating?: string
  }
}
```

### 5. Meal Planning

FatSecret doesn't have a direct "generate meal plan" endpoint like Spoonacular. Instead, we'll need to:

1. **Search recipes** by meal type and nutrition targets
2. **Build meal plans** client-side by selecting recipes
3. **Store user meal plans** in Supabase (existing pattern)

**FatSecret Saved Meals API (Profile feature):**
- `saved_meals.add` - Create a saved meal
- `saved_meal_items.add` - Add food items to a meal
- `saved_meals.get` - Retrieve all saved meals
- Requires 3-legged OAuth (user authorization)

For our use case, we'll continue storing meal plans in Supabase rather than using FatSecret's profile features.

---

## Implementation Plan

### Phase 1: Core Service Layer (Week 1)

#### 1.1 Create FatSecret Service (`lib/services/fatsecret.ts`)

```typescript
// Service responsibilities:
// - OAuth 2.0 token management (auto-refresh)
// - Rate limiting (5000 calls/day)
// - Response caching (reuse existing Supabase cache pattern)
// - Error handling with retry logic
// - Request deduplication

class FatSecretService {
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  // Token management
  private async ensureValidToken(): Promise<string>

  // Food operations
  async searchFoods(params: FoodSearchParams): Promise<FoodSearchResult>
  async getFoodDetails(foodId: string): Promise<FoodDetail>

  // Recipe operations
  async searchRecipes(params: RecipeSearchParams): Promise<RecipeSearchResult>
  async getRecipeDetails(recipeId: string): Promise<RecipeDetail>
}
```

#### 1.2 Create Type Definitions (`lib/types/fatsecret.ts`)

Define TypeScript interfaces for all FatSecret API responses.

### Phase 2: Database Schema Updates (Week 1)

#### 2.1 New Cache Tables

```sql
-- FatSecret food cache (similar to spoonacular_recipes)
CREATE TABLE fatsecret_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fatsecret_id TEXT UNIQUE NOT NULL,
  food_name TEXT NOT NULL,
  food_type TEXT NOT NULL,
  brand_name TEXT,
  servings JSONB,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  cache_expires_at TIMESTAMPTZ NOT NULL,
  fetch_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- FatSecret recipe cache
CREATE TABLE fatsecret_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fatsecret_id TEXT UNIQUE NOT NULL,
  recipe_name TEXT NOT NULL,
  recipe_description TEXT,
  image_url TEXT,
  calories DECIMAL,
  protein_grams DECIMAL,
  carb_grams DECIMAL,
  fat_grams DECIMAL,
  ingredients JSONB,
  directions JSONB,
  servings INTEGER,
  prep_time_min INTEGER,
  cook_time_min INTEGER,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  cache_expires_at TIMESTAMPTZ NOT NULL,
  fetch_count INTEGER DEFAULT 1
);

-- Search cache (reuse existing pattern)
CREATE TABLE fatsecret_search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT UNIQUE NOT NULL,
  query_params JSONB NOT NULL,
  result_ids TEXT[],
  total_results INTEGER,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INTEGER DEFAULT 0
);
```

### Phase 3: UI Component Updates (Week 2)

#### 3.1 Update Recipe Components

- `components/recipes/recipe-card.tsx` - Update to handle FatSecret data structure
- `components/recipes/recipe-search.tsx` - Update search to use FatSecret API
- `components/recipes/recipe-grid.tsx` - Handle FatSecret image URLs

#### 3.2 Update Meal Plan Components

- `components/meal-plans/meal-plan-generator-form.tsx` - Update generation logic
- `components/plans/plan-detail-view.tsx` - Display FatSecret recipe data

### Phase 4: Server Actions Migration (Week 2)

#### 4.1 New Server Actions

- `app/actions/fatsecret-foods.ts` - Food search and details
- `app/actions/fatsecret-recipes.ts` - Recipe search and details

#### 4.2 Update Existing Actions

- `app/actions/plans.ts` - Use FatSecret for recipe data
- `app/actions/grocery-lists.ts` - Parse FatSecret ingredients

### Phase 5: Testing & Rollout (Week 3)

1. **Unit tests** for FatSecret service
2. **Integration tests** for API calls
3. **A/B testing** with feature flag
4. **Gradual rollout** to users

---

## Database Changes

### Migration SQL

```sql
-- Migration: Add FatSecret support
-- Run in Supabase SQL Editor

-- 1. Create FatSecret food cache table
CREATE TABLE IF NOT EXISTS fatsecret_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fatsecret_id TEXT UNIQUE NOT NULL,
  food_name TEXT NOT NULL,
  food_type TEXT NOT NULL CHECK (food_type IN ('Brand', 'Generic')),
  brand_name TEXT,
  food_url TEXT,
  servings JSONB,
  default_serving JSONB,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  cache_expires_at TIMESTAMPTZ NOT NULL,
  fetch_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create FatSecret recipe cache table
CREATE TABLE IF NOT EXISTS fatsecret_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fatsecret_id TEXT UNIQUE NOT NULL,
  recipe_name TEXT NOT NULL,
  recipe_description TEXT,
  recipe_url TEXT,
  image_url TEXT,
  calories DECIMAL,
  protein_grams DECIMAL,
  carb_grams DECIMAL,
  fat_grams DECIMAL,
  fiber_grams DECIMAL,
  ingredients JSONB,
  directions JSONB,
  categories JSONB,
  recipe_types JSONB,
  number_of_servings INTEGER,
  prep_time_min INTEGER,
  cook_time_min INTEGER,
  rating DECIMAL,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  cache_expires_at TIMESTAMPTZ NOT NULL,
  fetch_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create FatSecret search cache table
CREATE TABLE IF NOT EXISTS fatsecret_search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT UNIQUE NOT NULL,
  search_type TEXT NOT NULL CHECK (search_type IN ('food', 'recipe')),
  query_params JSONB NOT NULL,
  result_ids TEXT[],
  total_results INTEGER,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes
CREATE INDEX idx_fatsecret_foods_name ON fatsecret_foods(food_name);
CREATE INDEX idx_fatsecret_foods_expires ON fatsecret_foods(cache_expires_at);
CREATE INDEX idx_fatsecret_recipes_name ON fatsecret_recipes(recipe_name);
CREATE INDEX idx_fatsecret_recipes_expires ON fatsecret_recipes(cache_expires_at);
CREATE INDEX idx_fatsecret_search_hash ON fatsecret_search_cache(query_hash);
CREATE INDEX idx_fatsecret_search_expires ON fatsecret_search_cache(expires_at);

-- 5. Add recipe_source to meal_plan_recipes (for gradual migration)
ALTER TABLE meal_plan_recipes
ADD COLUMN IF NOT EXISTS recipe_source TEXT DEFAULT 'spoonacular'
CHECK (recipe_source IN ('spoonacular', 'fatsecret', 'local'));

ALTER TABLE meal_plan_recipes
ADD COLUMN IF NOT EXISTS fatsecret_id TEXT;

-- 6. RLS Policies (cache tables are public read)
ALTER TABLE fatsecret_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatsecret_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatsecret_search_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (cached data)
CREATE POLICY "Anyone can read fatsecret_foods"
  ON fatsecret_foods FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read fatsecret_recipes"
  ON fatsecret_recipes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read fatsecret_search_cache"
  ON fatsecret_search_cache FOR SELECT
  USING (true);

-- Only authenticated users can insert/update (server actions)
CREATE POLICY "Authenticated users can insert fatsecret_foods"
  ON fatsecret_foods FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Authenticated users can update fatsecret_foods"
  ON fatsecret_foods FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Repeat for other tables...
```

---

## Migration Checklist

### Pre-Migration

- [ ] Whitelist development IP in FatSecret dashboard (`109.108.218.46`)
- [ ] Whitelist production server IP
- [ ] Run test script to verify connection: `npx tsx scripts/test-fatsecret-connection.ts`
- [ ] Review FatSecret Terms of Service for attribution requirements

### Phase 1: Foundation

- [ ] Create `lib/types/fatsecret.ts` with all type definitions
- [ ] Create `lib/services/fatsecret.ts` with OAuth and API methods
- [ ] Create `lib/services/fatsecret-token-manager.ts` for token refresh
- [ ] Write unit tests for FatSecret service
- [ ] Create database migration SQL

### Phase 2: Database

- [ ] Run migration SQL in Supabase dashboard
- [ ] Verify tables and indexes created
- [ ] Test RLS policies

### Phase 3: Server Actions

- [ ] Create `app/actions/fatsecret-foods.ts`
- [ ] Create `app/actions/fatsecret-recipes.ts`
- [ ] Update `app/actions/plans.ts` to support both APIs
- [ ] Add feature flag for API selection

### Phase 4: UI Components

- [ ] Update `recipe-card.tsx` for FatSecret data
- [ ] Update `recipe-search.tsx` to use FatSecret
- [ ] Update meal plan generator form
- [ ] Add FatSecret attribution (required by ToS)

### Phase 5: Testing

- [ ] Test food search functionality
- [ ] Test recipe search functionality
- [ ] Test nutrition data display
- [ ] Test meal plan generation
- [ ] Test caching behavior
- [ ] Performance testing

### Phase 6: Rollout

- [ ] Deploy to staging environment
- [ ] Enable feature flag for beta users
- [ ] Monitor error rates and API usage
- [ ] Gradual rollout to all users
- [ ] Deprecate Spoonacular integration

---

## Key Differences to Note

### 1. No Auto Meal Plan Generation

FatSecret doesn't offer automatic meal plan generation like Spoonacular. We'll need to:
- Search recipes by meal type (Breakfast, Lunch, Dinner, Snack)
- Filter by calorie/macro ranges
- Build meal plans programmatically or let users select

### 2. Image Handling

FatSecret recipe images are hosted on their domain. Unlike Spoonacular where we construct URLs, FatSecret provides full URLs in responses.

### 3. Serving Sizes

FatSecret provides multiple serving options per food item. We need to handle this in the UI (dropdown selector).

### 4. Attribution Required

FatSecret requires attribution when displaying their data. Add to recipe cards:
> "Powered by FatSecret"

### 5. Rate Limiting

FatSecret: 5,000 calls/day (free tier)
Spoonacular: 150 points/day (free tier, where searches = 1 point, recipe details = 1-2 points)

FatSecret is more generous but still requires caching strategy.

---

## Questions Before Implementation

1. **Meal Plan Strategy**: Should we:
   - A) Build meal plans server-side using recipe search + random selection?
   - B) Let users manually select recipes for each meal slot?
   - C) Hybrid approach with suggestions?

2. **Migration Timeline**:
   - Keep both APIs during transition period?
   - Hard cutover to FatSecret only?

3. **Existing Data**:
   - Keep Spoonacular cached data?
   - Clear cache and start fresh?

4. **Recipe Sources**:
   - Support mixed sources (some Spoonacular, some FatSecret)?
   - FatSecret only going forward?

---

## Resources

- [FatSecret Platform API Docs](https://platform.fatsecret.com/docs/guides)
- [OAuth 2.0 Authentication](https://platform.fatsecret.com/docs/guides/authentication/oauth2)
- [Foods Search v4 API](https://platform.fatsecret.com/docs/v4/foods.search)
- [Recipes Search API](https://platform.fatsecret.com/docs/v1/recipes.search)
- [API Key Management](https://platform.fatsecret.com/api-key-management)

---

*Document created: December 10, 2025*
*Last updated: December 10, 2025*
