-- Batch Prep Mode (P0) migration
-- 2026-04-09

-- ============================================================================
-- Table: user_training_profile
-- ============================================================================

CREATE TABLE user_training_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  training_days_per_week INT NOT NULL DEFAULT 5
    CHECK (training_days_per_week BETWEEN 0 AND 7),
  training_day_macros JSONB NOT NULL,
  rest_day_macros JSONB NOT NULL,
  prep_day TEXT NOT NULL DEFAULT 'sunday'
    CHECK (prep_day IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  containers_per_week INT NOT NULL DEFAULT 10
    CHECK (containers_per_week BETWEEN 3 AND 21),
  max_prep_time_mins INT NOT NULL DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_training_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_training_profile" ON user_training_profile
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_training_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_training_profile_updated_at
  BEFORE UPDATE ON user_training_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_user_training_profile_updated_at();

-- ============================================================================
-- Table: batch_prep_plans
-- ============================================================================

CREATE TABLE batch_prep_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_starting DATE NOT NULL,
  training_day_plan JSONB NOT NULL,
  rest_day_plan JSONB NOT NULL,
  prep_timeline JSONB NOT NULL,
  shopping_list JSONB NOT NULL,
  container_assignments JSONB NOT NULL,
  total_containers INT NOT NULL,
  estimated_prep_time_mins INT NOT NULL,
  generation_params JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE batch_prep_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_batch_prep_plans" ON batch_prep_plans
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_batch_prep_plans_user_week
  ON batch_prep_plans(user_id, week_starting DESC);

-- ============================================================================
-- Table: anthropic_usage_log (observability — no user read policy)
-- ============================================================================

CREATE TABLE anthropic_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INT NOT NULL,
  output_tokens INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'validation_fail', 'retry', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE anthropic_usage_log ENABLE ROW LEVEL SECURITY;
-- No user policy — only service role can read/write

CREATE INDEX idx_anthropic_usage_log_created ON anthropic_usage_log(created_at DESC);
