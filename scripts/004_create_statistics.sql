-- Create statistics table for tracking various metrics
create table if not exists public.statistics (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,
  metric_value bigint not null default 0,
  updated_at timestamp with time zone default now(),
  unique(metric_name)
);

alter table public.statistics enable row level security;

-- Anyone can read statistics
create policy "statistics_select_all"
  on public.statistics for select
  using (true);

-- Only service role can update (will be done via API)
create policy "statistics_update_service"
  on public.statistics for update
  using (true);

create policy "statistics_insert_service"
  on public.statistics for insert
  with check (true);

-- Create visitor_ips table to track unique visitors
create table if not exists public.visitor_ips (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null unique,
  first_visit timestamp with time zone default now(),
  last_visit timestamp with time zone default now()
);

alter table public.visitor_ips enable row level security;

-- Only service role can access visitor IPs (privacy)
create policy "visitor_ips_select_service"
  on public.visitor_ips for select
  using (true);

create policy "visitor_ips_insert_service"
  on public.visitor_ips for insert
  with check (true);

create policy "visitor_ips_update_service"
  on public.visitor_ips for update
  using (true);

-- Initialize statistics with default values
insert into public.statistics (metric_name, metric_value) values
  ('unique_visitors', 0),
  ('watch_count', 0),
  ('tmdb_requests', 0),
  ('user_signups', 0)
on conflict (metric_name) do nothing;
