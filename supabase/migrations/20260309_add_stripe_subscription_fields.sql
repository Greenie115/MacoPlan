-- Add missing Stripe subscription columns to user_profiles
-- These are referenced by the webhook handler but may not exist yet

-- Add subscription tracking columns (idempotent with IF NOT EXISTS pattern)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN stripe_subscription_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_status TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'subscription_period_end'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN subscription_period_end TIMESTAMPTZ;
  END IF;
END $$;

-- Create webhook_events table for idempotency tracking
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);

-- Create meal_plan_generation_quota table if it doesn't exist
CREATE TABLE IF NOT EXISTS meal_plan_generation_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_generated INT DEFAULT 0,
  free_tier_generated INT DEFAULT 0,
  current_period_generated INT DEFAULT 0,
  free_tier_swaps INT DEFAULT 0,
  stripe_subscription_id TEXT,
  period_start_date TIMESTAMPTZ DEFAULT now(),
  period_end_date TIMESTAMPTZ,
  last_generation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS for meal_plan_generation_quota
ALTER TABLE meal_plan_generation_quota ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own quota') THEN
    CREATE POLICY "Users can view own quota"
      ON meal_plan_generation_quota FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own quota') THEN
    CREATE POLICY "Users can update own quota"
      ON meal_plan_generation_quota FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own quota') THEN
    CREATE POLICY "Users can insert own quota"
      ON meal_plan_generation_quota FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- RLS for webhook_events (only service role should access)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
-- No user policies — only service role (used by webhook handler) can access
