-- Supabase schema
create table if not exists public.models (
  id text primary key,
  brand text not null,
  name text not null,
  base numeric not null check (base >= 0)
);

create table if not exists public.multipliers (
  quality int primary key check (quality between 1 and 4),
  value numeric not null check (value >= 0)
);

-- Seed defaults
insert into public.multipliers (quality, value) values
  (1, 0.20) on conflict (quality) do update set value = excluded.value;
insert into public.multipliers (quality, value) values (2, 0.45) on conflict (quality) do nothing;
insert into public.multipliers (quality, value) values (3, 0.70) on conflict (quality) do nothing;
insert into public.multipliers (quality, value) values (4, 0.90) on conflict (quality) do nothing;

-- RLS & policies
alter table public.models enable row level security;
alter table public.multipliers enable row level security;

create policy if not exists "read models for all"
  on public.models for select using (true);
create policy if not exists "read multipliers for all"
  on public.multipliers for select using (true);

create policy if not exists "write models for authenticated"
  on public.models for all using (auth.role() = 'authenticated');
create policy if not exists "write multipliers for authenticated"
  on public.multipliers for all using (auth.role() = 'authenticated');
