-- Supabase schema for TK Phones concierge site
-- Run this script inside your Supabase SQL editor or via the CLI.

-- Extensions
create extension if not exists "pgcrypto" with schema public;

-- Table: quality_pricing
create table if not exists public.quality_pricing (
  rating integer primary key,
  amount numeric not null,
  description text,
  updated_at timestamptz default timezone('utc', now())
);

alter table public.quality_pricing enable row level security;

create policy if not exists "Admins manage pricing" on public.quality_pricing
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Table: phone_quotes
create table if not exists public.phone_quotes (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  email text not null,
  phone_model text not null,
  storage text not null,
  rating integer not null references public.quality_pricing (rating),
  offer numeric,
  notes text,
  diagnostic_payload jsonb,
  created_at timestamptz default timezone('utc', now())
);

alter table public.phone_quotes enable row level security;

create policy if not exists "Allow inserts" on public.phone_quotes
  for insert
  with check (true);

-- Table: support_requests
create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz default timezone('utc', now())
);

alter table public.support_requests enable row level security;

create policy if not exists "Allow customer inserts" on public.support_requests
  for insert
  with check (true);

-- Seed baseline pricing bands
insert into public.quality_pricing (rating, amount, description)
values
  (1, 20, 'Salvage only'),
  (2, 120, 'Noticeable wear, functional'),
  (3, 240, 'Good condition'),
  (4, 360, 'Excellent condition')
on conflict (rating) do update
  set amount = excluded.amount,
      description = excluded.description,
      updated_at = timezone('utc', now());
