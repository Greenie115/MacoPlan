-- Blog newsletter signups. Written only by the subscribeToNewsletter server
-- action via the service role, so RLS is on with no policies (no client access).
create table if not exists public.newsletter_subscribers (
  email text primary key,
  source text not null default 'blog',
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;
