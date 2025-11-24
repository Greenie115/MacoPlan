-- Create plans table
create table if not exists plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  date_range text, -- Keeping as text for now to match UI "Nov 5-11, 2025"
  target_calories int,
  target_protein int,
  target_carbs int,
  target_fat int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create plan_days table
create table if not exists plan_days (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references plans(id) on delete cascade not null,
  date date, -- Actual date for sorting/logic
  day_of_week text, -- "Mon", "Tue", etc.
  total_calories int default 0,
  total_protein int default 0,
  total_carbs int default 0,
  total_fat int default 0,
  order_index int not null
);

-- Create plan_meals table
create table if not exists plan_meals (
  id uuid default gen_random_uuid() primary key,
  plan_day_id uuid references plan_days(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete set null, -- Optional link to recipe
  name text not null,
  type text not null, -- 'breakfast', 'lunch', 'dinner', 'snack'
  calories int default 0,
  protein_grams int default 0,
  carb_grams int default 0,
  fat_grams int default 0,
  image_url text,
  order_index int not null
);

-- Add RLS policies
alter table plans enable row level security;
alter table plan_days enable row level security;
alter table plan_meals enable row level security;

-- Policies for plans
create policy "Users can view their own plans"
  on plans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own plans"
  on plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own plans"
  on plans for update
  using (auth.uid() = user_id);

create policy "Users can delete their own plans"
  on plans for delete
  using (auth.uid() = user_id);

-- Policies for plan_days (cascade from plan)
create policy "Users can view days of their plans"
  on plan_days for select
  using (exists (select 1 from plans where plans.id = plan_days.plan_id and plans.user_id = auth.uid()));

create policy "Users can insert days to their plans"
  on plan_days for insert
  with check (exists (select 1 from plans where plans.id = plan_days.plan_id and plans.user_id = auth.uid()));

-- Policies for plan_meals (cascade from plan_day -> plan)
create policy "Users can view meals of their plans"
  on plan_meals for select
  using (exists (
    select 1 from plan_days 
    join plans on plans.id = plan_days.plan_id 
    where plan_days.id = plan_meals.plan_day_id and plans.user_id = auth.uid()
  ));

create policy "Users can insert meals to their plans"
  on plan_meals for insert
  with check (exists (
    select 1 from plan_days 
    join plans on plans.id = plan_days.plan_id 
    where plan_days.id = plan_meals.plan_day_id and plans.user_id = auth.uid()
  ));
