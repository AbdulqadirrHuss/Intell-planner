-- Tracker Buckets Migration
-- Run this in your Supabase SQL Editor

-- 1. Tracker Buckets table
create table if not exists public.tracker_buckets (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  mode text not null check (mode in ('daily', 'independent')),
  color text default '#8b5cf6',
  sort_order integer default 0,
  collapsed boolean default false
);

-- 2. Link table: bucket <-> categories
create table if not exists public.tracker_bucket_categories (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  bucket_id uuid references public.tracker_buckets(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  unique(bucket_id, category_id)
);

-- 3. RLS
alter table public.tracker_buckets enable row level security;
create policy "Public access" on public.tracker_buckets for all using (true);

alter table public.tracker_bucket_categories enable row level security;
create policy "Public access" on public.tracker_bucket_categories for all using (true);
