-- Create function to increment statistics atomically
-- Renamed parameter to p_metric_name to avoid ambiguity with column name
create or replace function increment_statistic(p_metric_name text)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.statistics (metric_name, metric_value, updated_at)
  values (p_metric_name, 1, now())
  on conflict (metric_name)
  do update set
    metric_value = statistics.metric_value + 1,
    updated_at = now();
end;
$$;
