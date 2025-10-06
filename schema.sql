create extension if not exists "pgcrypto";

create table if not exists public.phone_models (
  model_id text primary key,
  brand text not null,
  display_name text not null,
  active boolean not null default true,
  inserted_at timestamp with time zone default now()
);

create table if not exists public.buyback_prices (
  model_id text primary key references public.phone_models(model_id) on delete cascade,
  q1_price numeric(10,2) not null default 0,
  q2_price numeric(10,2) not null default 0,
  q3_price numeric(10,2) not null default 0,
  q4_price numeric(10,2) not null default 0,
  updated_at timestamp with time zone default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  model_id text references public.phone_models(model_id) on delete set null,
  quality smallint not null check (quality between 1 and 4),
  score integer not null,
  est_price numeric(10,2) not null,
  answers jsonb not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  inserted_at timestamp with time zone default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists(
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

drop policy if exists "phone_models_select" on public.phone_models;
drop policy if exists "phone_models_write" on public.phone_models;

drop policy if exists "buyback_prices_select" on public.buyback_prices;
drop policy if exists "buyback_prices_write" on public.buyback_prices;

drop policy if exists "quotes_insert" on public.quotes;
drop policy if exists "quotes_select_admin" on public.quotes;

alter table public.phone_models enable row level security;
alter table public.buyback_prices enable row level security;
alter table public.quotes enable row level security;

create policy "phone_models_select" on public.phone_models
for select
using (true);

create policy "phone_models_write" on public.phone_models
for all
using (public.is_admin())
with check (public.is_admin());

create policy "buyback_prices_select" on public.buyback_prices
for select
using (true);

create policy "buyback_prices_write" on public.buyback_prices
for all
using (public.is_admin())
with check (public.is_admin());

create policy "quotes_insert" on public.quotes
for insert
with check (true);

create policy "quotes_select_admin" on public.quotes
for select
using (public.is_admin());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists update_buyback_timestamp on public.buyback_prices;

create trigger update_buyback_timestamp
before update on public.buyback_prices
for each row
execute function public.set_updated_at();
