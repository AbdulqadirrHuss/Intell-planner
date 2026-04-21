-- ═══════════════════════════════════════════════════
-- TRACKER PROGRESS BARS — Supabase Migration
-- Run this in your Supabase SQL editor
-- ═══════════════════════════════════════════════════

-- 1. Progress bar definitions (one per named bar, linked to a bucket)
create table if not exists tracker_progress_bars (
  id uuid primary key default gen_random_uuid(),
  bucket_id uuid references tracker_buckets(id) on delete cascade not null,
  label text not null default 'Progress Bar',
  color text not null default '#8b5cf6',
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- 2. Junction: progress bar ↔ categories
create table if not exists tracker_pb_categories (
  id uuid primary key default gen_random_uuid(),
  pb_id uuid references tracker_progress_bars(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  unique (pb_id, category_id)
);

-- 3. Junction: progress bar ↔ specific task texts
create table if not exists tracker_pb_tasks (
  id uuid primary key default gen_random_uuid(),
  pb_id uuid references tracker_progress_bars(id) on delete cascade not null,
  task_text text not null,
  unique (pb_id, task_text)
);

-- 4. Junction: progress bar ↔ specific subtask texts
create table if not exists tracker_pb_subtasks (
  id uuid primary key default gen_random_uuid(),
  pb_id uuid references tracker_progress_bars(id) on delete cascade not null,
  subtask_text text not null,
  unique (pb_id, subtask_text)
);

-- RLS Policies (enable if you use RLS)
alter table tracker_progress_bars enable row level security;
alter table tracker_pb_categories enable row level security;
alter table tracker_pb_tasks enable row level security;
alter table tracker_pb_subtasks enable row level security;

-- Allow all access (adjust to match your existing RLS policy style)
create policy "Allow all tracker_progress_bars" on tracker_progress_bars for all using (true) with check (true);
create policy "Allow all tracker_pb_categories" on tracker_pb_categories for all using (true) with check (true);
create policy "Allow all tracker_pb_tasks" on tracker_pb_tasks for all using (true) with check (true);
create policy "Allow all tracker_pb_subtasks" on tracker_pb_subtasks for all using (true) with check (true);
