-- Enable extensions
create extension if not exists "pgcrypto";

-- ========== AUTH SUPPORT ==========
-- Table of emails allowed to perform admin actions
create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

-- ========== PHONE CATALOG ==========
-- Minimal catalog for demo; extend as desired
create table if not exists public.phone_models (
  model_id text primary key,          -- e.g., "iphone_14_128_att"
  brand text not null,                -- e.g., "Apple"
  model_name text not null,           -- e.g., "iPhone 14"
  storage_gb int not null,            -- e.g., 128
  carrier text not null,              -- e.g., "AT&T", "Unlocked"
  created_at timestamptz not null default now()
);

-- ========== PRICES TABLE ==========
-- One row per model with 4 quality buckets
create table if not exists public.buyback_prices (
  model_id   text primary key references public.phone_models(model_id) on delete cascade,
  q1_price   numeric not null default 0,  -- 1 = unusable
  q2_price   numeric not null default 0,
  q3_price   numeric not null default 0,
  q4_price   numeric not null default 0,  -- 4 = perfect
  updated_at timestamptz not null default now()
);

-- Touch trigger to auto-update timestamps
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_buyback_prices_updated_at on public.buyback_prices;
create trigger trg_buyback_prices_updated_at
before update on public.buyback_prices
for each row execute function public.touch_updated_at();

-- ========== QUOTE LOG (optional) ==========
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  brand text not null,
  model_name text not null,
  storage_gb int not null,
  carrier text not null,
  quality int not null check (quality between 1 and 4),
  estimate numeric not null
);

-- ========== RLS POLICIES ==========
alter table public.phone_models enable row level security;
alter table public.buyback_prices enable row level security;
alter table public.quotes enable row level security;
alter table public.admin_emails enable row level security;

-- Public can read catalog & prices
create policy "public read models" on public.phone_models
for select using (true);

create policy "public read prices" on public.buyback_prices
for select using (true);

create policy "public insert quotes" on public.quotes
for insert with check (true);

create policy "public read quotes self" on public.quotes
for select using (true);

-- Only admins (email in admin_emails) can write models/prices
create or replace function public.is_admin() returns boolean language sql as $$
  select exists (
    select 1 from public.admin_emails ae
    join auth.users u on u.email = ae.email
    where u.id = auth.uid()
  );
$$;

-- Allow authenticated admins full access on models & prices
create policy "admin write models" on public.phone_models
as permissive for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin write prices" on public.buyback_prices
as permissive for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Admins can manage admin_emails too
create policy "admin manage admin_emails" on public.admin_emails
as permissive for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Seed sample catalog & prices (optional; edit as needed)
insert into public.phone_models (model_id, brand, model_name, storage_gb, carrier) values
  ('iphone_13_128_unlocked','Apple','iPhone 13',128,'Unlocked') on conflict do nothing,
  ('iphone_13_256_unlocked','Apple','iPhone 13',256,'Unlocked') on conflict do nothing,
  ('iphone_12_64_att','Apple','iPhone 12',64,'AT&T') on conflict do nothing,
  ('galaxy_s22_128_unlocked','Samsung','Galaxy S22',128,'Unlocked') on conflict do nothing;

insert into public.buyback_prices (model_id, q1_price,q2_price,q3_price,q4_price) values
  ('iphone_13_128_unlocked', 60, 200, 330, 420) on conflict do nothing,
  ('iphone_13_256_unlocked', 70, 220, 360, 460) on conflict do nothing,
  ('iphone_12_64_att',       30, 120, 210, 280) on conflict do nothing,
  ('galaxy_s22_128_unlocked',40, 160, 260, 320) on conflict do nothing;
