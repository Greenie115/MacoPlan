-- Close the self-grant hole: any authenticated user could previously UPDATE
-- their own is_test_user / simulated_tier via the REST API and hand themselves
-- free premium. A column-level REVOKE does not help here because Supabase
-- grants table-level UPDATE to `authenticated`, which overrides column grants.
-- A BEFORE UPDATE trigger is the robust fix: it rejects any change to these two
-- columns unless the request runs as the service role (the email-gated
-- updateSimulatedTier server action).

create or replace function public.protect_tier_simulation_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.role() is distinct from 'service_role' then
    if new.is_test_user is distinct from old.is_test_user
       or new.simulated_tier is distinct from old.simulated_tier then
      raise exception 'Not allowed to modify tier simulation columns';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_tier_simulation_columns on public.user_profiles;

create trigger protect_tier_simulation_columns
before update on public.user_profiles
for each row
execute function public.protect_tier_simulation_columns();
