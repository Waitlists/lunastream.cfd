-- Create users table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create continue_watching table
create table if not exists public.continue_watching (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  media_id text not null,
  media_type text not null check (media_type in ('movie', 'tv', 'anime', 'sports')),
  title text not null,
  poster_path text,
  episode integer,
  season integer,
  timestamp numeric not null default 0,
  duration numeric,
  updated_at timestamp with time zone default now(),
  unique(user_id, media_id, media_type, episode, season)
);

alter table public.continue_watching enable row level security;

create policy "continue_watching_select_own"
  on public.continue_watching for select
  using (auth.uid() = user_id);

create policy "continue_watching_insert_own"
  on public.continue_watching for insert
  with check (auth.uid() = user_id);

create policy "continue_watching_update_own"
  on public.continue_watching for update
  using (auth.uid() = user_id);

create policy "continue_watching_delete_own"
  on public.continue_watching for delete
  using (auth.uid() = user_id);

-- Create notifications table (admin can insert, all users can read)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

alter table public.notifications enable row level security;

-- Anyone can read notifications
create policy "notifications_select_all"
  on public.notifications for select
  using (true);

-- Only service role can insert (admin panel will use service role key)
create policy "notifications_insert_service"
  on public.notifications for insert
  with check (true);

create policy "notifications_delete_service"
  on public.notifications for delete
  using (true);
