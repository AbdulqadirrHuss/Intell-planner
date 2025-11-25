
-- ⚠️ WARNING: THIS WILL DELETE ALL DATA IN THESE TABLES
-- Run this if you want a completely fresh start for the Planner App

-- Drop tables in dependency order (reverse of creation)
drop table if exists public.stat_values;
drop table if exists public.stat_definitions;
drop table if exists public.subtasks;
drop table if exists public.tasks;
drop table if exists public.daily_logs;
drop table if exists public.day_type_categories;
drop table if exists public.day_types;
drop table if exists public.recurring_subtask_templates;
drop table if exists public.recurring_task_templates;
drop table if exists public.categories;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Categories
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  color text not null
);

-- 2. Recurring Task Templates
create table public.recurring_task_templates (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  category_id uuid references public.categories(id) on delete set null,
  text text not null,
  days_of_week integer[] default '{}'
);

-- 3. Recurring Subtask Templates
create table public.recurring_subtask_templates (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  parent_template_id uuid references public.recurring_task_templates(id) on delete cascade not null,
  text text not null
);

-- 4. Day Types
create table public.day_types (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null
);

-- 5. Day Type Categories (Link Table)
create table public.day_type_categories (
  id uuid default uuid_generate_v4() primary key,
  day_type_id uuid references public.day_types(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  sort_order integer default 0
);

-- 6. Daily Logs
create table public.daily_logs (
  date date primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  day_type_id uuid references public.day_types(id) on delete set null
);

-- 7. Tasks
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  log_date date not null,
  text text not null,
  category_id uuid references public.categories(id) on delete set null,
  is_recurring boolean default false,
  completed boolean default false
);

-- 8. Subtasks
create table public.subtasks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  parent_task_id uuid references public.tasks(id) on delete cascade not null,
  log_date date not null,
  text text not null,
  is_recurring boolean default false,
  completed boolean default false
);

-- 9. Stat Definitions
create table public.stat_definitions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  type text not null check (type in ('percent', 'count', 'check')),
  linked_category_id uuid references public.categories(id) on delete set null,
  target numeric,
  color text
);

-- 10. Stat Values
create table public.stat_values (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  stat_definition_id uuid references public.stat_definitions(id) on delete cascade not null,
  value numeric default 0,
  is_manual boolean default false
);

-- Enable Row Level Security (RLS) - OPEN ACCESS (For Development)
alter table public.categories enable row level security;
create policy "Public access" on public.categories for all using (true);

alter table public.recurring_task_templates enable row level security;
create policy "Public access" on public.recurring_task_templates for all using (true);

alter table public.recurring_subtask_templates enable row level security;
create policy "Public access" on public.recurring_subtask_templates for all using (true);

alter table public.day_types enable row level security;
create policy "Public access" on public.day_types for all using (true);

alter table public.day_type_categories enable row level security;
create policy "Public access" on public.day_type_categories for all using (true);

alter table public.daily_logs enable row level security;
create policy "Public access" on public.daily_logs for all using (true);

alter table public.tasks enable row level security;
create policy "Public access" on public.tasks for all using (true);

alter table public.subtasks enable row level security;
create policy "Public access" on public.subtasks for all using (true);

alter table public.stat_definitions enable row level security;
create policy "Public access" on public.stat_definitions for all using (true);

alter table public.stat_values enable row level security;
create policy "Public access" on public.stat_values for all using (true);
