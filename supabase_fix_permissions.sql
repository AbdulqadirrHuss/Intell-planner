
-- ⚠️ RUN THIS IN SUPABASE SQL EDITOR
-- This script disables Row Level Security (RLS) to ensure your app can save data without permission errors.

alter table public.categories disable row level security;
alter table public.recurring_task_templates disable row level security;
alter table public.recurring_subtask_templates disable row level security;
alter table public.day_types disable row level security;
alter table public.day_type_categories disable row level security;
alter table public.daily_logs disable row level security;
alter table public.tasks disable row level security;
alter table public.subtasks disable row level security;
alter table public.stat_definitions disable row level security;
alter table public.stat_values disable row level security;
