-- =========================================================
-- TK Phones — Supabase schema for the React SPA
-- =========================================================

create extension if not exists "pgcrypto";

-- Multipliers for integrity tiers (1..4)
create table if not exists public.multipliers (
  quality int primary key check (quality between 1 and 4),
  value numeric not null check (value >= 0)
);

-- Models catalog
create table if not exists public.models (
  id   text primary key,
  brand text not null,
  name  text not null,
  base  numeric not null check (base >= 0)
);

-- Optional quotes log
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  model_id text not null,
  integrity int not null check (integrity between 1 and 4),
  estimate numeric not null
);

-- RLS
alter table public.multipliers enable row level security;
alter table public.models enable row level security;
alter table public.quotes enable row level security;

-- Public read access
drop policy if exists "read multipliers" on public.multipliers;
create policy "read multipliers" on public.multipliers
for select using (true);

drop policy if exists "read models" on public.models;
create policy "read models" on public.models
for select using (true);

drop policy if exists "insert quotes" on public.quotes;
create policy "insert quotes" on public.quotes
for insert with check (true);

drop policy if exists "read quotes" on public.quotes;
create policy "read quotes" on public.quotes
for select using (true);

-- Simple write policy for authenticated users (tighten as needed)
drop policy if exists "write multipliers (auth)" on public.multipliers;
create policy "write multipliers (auth)" on public.multipliers
as permissive for all to authenticated
using (true) with check (true);

drop policy if exists "write models (auth)" on public.models;
create policy "write models (auth)" on public.models
as permissive for all to authenticated
using (true) with check (true);

-- Seed defaults
insert into public.multipliers (quality, value) values
  (1, 0.20) on conflict (quality) do update set value = excluded.value;

insert into public.multipliers (quality, value) values
  (2, 0.45), (3, 0.70), (4, 0.90)
on conflict (quality) do nothing;

insert into public.models (id, brand, name, base) values
  ('iph13-128', 'Apple', 'iPhone 13 (128 GB)', 320),
  ('iph12-64',  'Apple', 'iPhone 12 (64 GB)', 180),
  ('s21-128',   'Samsung', 'Galaxy S21 (128 GB)', 170),
  ('px6-128',   'Google', 'Pixel 6 (128 GB)', 160)
on conflict (id) do nothing;
