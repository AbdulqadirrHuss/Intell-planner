-- Granular Tracker Buckets Migration
-- Track specific tasks and subtasks inside a bucket by their text name, because tasks receive a new UUID every day.

-- 1. Link table for tracking specific tasks
create table if not exists public.tracker_bucket_tasks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  bucket_id uuid references public.tracker_buckets(id) on delete cascade not null,
  task_text text not null,
  unique(bucket_id, task_text)
);

-- 2. Link table for tracking specific subtasks
create table if not exists public.tracker_bucket_subtasks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  bucket_id uuid references public.tracker_buckets(id) on delete cascade not null,
  subtask_text text not null,
  unique(bucket_id, subtask_text)
);

-- 3. Enable RLS
alter table public.tracker_bucket_tasks enable row level security;
create policy "Public access" on public.tracker_bucket_tasks for all using (true);

alter table public.tracker_bucket_subtasks enable row level security;
create policy "Public access" on public.tracker_bucket_subtasks for all using (true);
