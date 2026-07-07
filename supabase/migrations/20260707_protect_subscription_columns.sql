-- The 20260702 migration protected is_test_user / simulated_tier, but left a
-- bigger hole open: lib/utils/subscription.ts trusts user_profiles.subscription_status
-- ('active'/'trialing' => paid tier), and that column had no protection at all.
-- Any authenticated user could UPDATE their own subscription_status (or the
-- stripe_* columns backing it) via the Supabase REST API and grant themselves
-- premium for free — same self-grant hole, bigger blast radius. These columns
-- are only ever written by the Stripe webhook (service role), so the fix is
-- the same BEFORE UPDATE trigger, extended to cover them.

create or replace function public.protect_tier_simulation_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.role() is distinct from 'service_role' then
    if new.is_test_user is distinct from old.is_test_user
       or new.simulated_tier is distinct from old.simulated_tier
       or new.subscription_status is distinct from old.subscription_status
       or new.stripe_customer_id is distinct from old.stripe_customer_id
       or new.stripe_subscription_id is distinct from old.stripe_subscription_id
       or new.subscription_period_end is distinct from old.subscription_period_end then
      raise exception 'Not allowed to modify tier simulation columns';
    end if;
  end if;
  return new;
end;
$$;

-- Trigger already exists from the 20260702 migration; replacing the function
-- body is sufficient, no need to recreate it.
