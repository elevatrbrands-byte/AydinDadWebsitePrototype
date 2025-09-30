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
