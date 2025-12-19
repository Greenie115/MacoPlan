-- Security Features Migration
-- Adds tables for: login attempts tracking, account lockouts, 2FA

-- ============================================================================
-- 1. Login Attempts Table - Track all login attempts for rate limiting
-- ============================================================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created ON login_attempts(email, created_at DESC);

-- Enable RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read (no user access needed)
CREATE POLICY "Service role full access to login_attempts"
  ON login_attempts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 2. Account Lockouts Table - Track locked accounts
-- ============================================================================
CREATE TABLE IF NOT EXISTS account_lockouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  locked_until TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_lockouts_email ON account_lockouts(email);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_locked_until ON account_lockouts(locked_until);

-- Enable RLS
ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;

-- Only service role can manage lockouts
CREATE POLICY "Service role full access to account_lockouts"
  ON account_lockouts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 3. User 2FA Settings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('totp', 'email')),
  totp_secret TEXT, -- Encrypted TOTP secret for authenticator apps
  is_enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[], -- Array of hashed backup codes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, method)
);

CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON user_2fa(user_id);

-- Enable RLS
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;

-- Users can read their own 2FA settings
CREATE POLICY "Users can view own 2FA settings"
  ON user_2fa
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own 2FA settings
CREATE POLICY "Users can update own 2FA settings"
  ON user_2fa
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own 2FA settings
CREATE POLICY "Users can insert own 2FA settings"
  ON user_2fa
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own 2FA settings
CREATE POLICY "Users can delete own 2FA settings"
  ON user_2fa
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. Pending 2FA Verification Table - Temporary codes during login
-- ============================================================================
CREATE TABLE IF NOT EXISTS pending_2fa_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL, -- Hashed 6-digit code
  method TEXT NOT NULL CHECK (method IN ('totp', 'email')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_2fa_user_id ON pending_2fa_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_2fa_expires ON pending_2fa_verification(expires_at);

-- Enable RLS
ALTER TABLE pending_2fa_verification ENABLE ROW LEVEL SECURITY;

-- Only service role can manage pending verifications
CREATE POLICY "Service role full access to pending_2fa_verification"
  ON pending_2fa_verification
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 5. Add 2FA columns to user_profiles
-- ============================================================================
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_2fa_method TEXT CHECK (preferred_2fa_method IS NULL OR preferred_2fa_method IN ('totp', 'email'));

-- ============================================================================
-- 6. Cleanup function for expired data
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_security_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete expired pending 2FA verifications
  DELETE FROM pending_2fa_verification WHERE expires_at < NOW();

  -- Delete old login attempts (older than 30 days)
  DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '30 days';

  -- Delete expired lockouts
  DELETE FROM account_lockouts WHERE locked_until < NOW();
END;
$$;

-- ============================================================================
-- 7. Helper function to check if account is locked
-- ============================================================================
CREATE OR REPLACE FUNCTION is_account_locked(check_email TEXT)
RETURNS TABLE(is_locked BOOLEAN, locked_until TIMESTAMPTZ, attempt_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE WHEN al.locked_until > NOW() THEN true ELSE false END as is_locked,
    al.locked_until,
    al.attempt_count
  FROM account_lockouts al
  WHERE al.email = check_email;

  -- If no record found, return not locked
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TIMESTAMPTZ, 0;
  END IF;
END;
$$;

-- ============================================================================
-- 8. Helper function to count recent failed attempts
-- ============================================================================
CREATE OR REPLACE FUNCTION count_recent_failed_attempts(check_email TEXT, window_minutes INTEGER DEFAULT 15)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO attempt_count
  FROM login_attempts
  WHERE email = check_email
    AND success = false
    AND created_at > NOW() - (window_minutes || ' minutes')::INTERVAL;

  RETURN COALESCE(attempt_count, 0);
END;
$$;
