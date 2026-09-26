-- BARKHO — Supabase schema
-- Run this once in the Supabase SQL editor for your project.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  customer_email text,
  customer_name text,
  shipping_address jsonb,
  items jsonb not null,
  amount_total numeric,
  currency text,
  printful_order_id text,
  status text default 'paid',
  created_at timestamptz default now()
);

-- Row Level Security: the site's backend uses the service_role key (which
-- bypasses RLS), so this just makes sure no one can read/write this table
-- with the public anon key if it's ever exposed by mistake.
alter table orders enable row level security;
