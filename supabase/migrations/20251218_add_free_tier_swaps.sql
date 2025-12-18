-- Add free_tier_swaps column to meal_plan_generation_quota
-- Tracks lifetime meal swaps used by free tier users (limit: 3)

ALTER TABLE meal_plan_generation_quota
ADD COLUMN IF NOT EXISTS free_tier_swaps INTEGER DEFAULT 0 NOT NULL;

COMMENT ON COLUMN meal_plan_generation_quota.free_tier_swaps IS 'Lifetime count of meal swaps used by free tier users (limit: 3)';
