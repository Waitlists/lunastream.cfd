-- Create notification_reads table to track which users have read which notifications
create table if not exists public.notification_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  notification_id uuid not null references public.notifications(id) on delete cascade,
  read_at timestamp with time zone default now(),
  unique(user_id, notification_id)
);

alter table public.notification_reads enable row level security;

create policy "notification_reads_select_own"
  on public.notification_reads for select
  using (auth.uid() = user_id);

create policy "notification_reads_insert_own"
  on public.notification_reads for insert
  with check (auth.uid() = user_id);

-- For guest users (no auth), we'll use localStorage on the client side
