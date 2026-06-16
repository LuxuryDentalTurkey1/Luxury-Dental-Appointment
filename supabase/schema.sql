-- ============================================================
--  Luxury Dental Turkey — database schema
--  HOW TO RUN: Supabase dashboard → SQL Editor → New query →
--  paste all of this → click "Run".  (Safe to run more than once.)
-- ============================================================

-- ---------- BOOKINGS ----------------------------------------
create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  consultation_type   text not null,                 -- 'face-to-face' | 'online'
  appointment_date    date not null,                 -- the chosen day
  appointment_time_uk text not null,                 -- 'HH:MM' in UK time (we store UK)
  duration_minutes    int  not null,
  price_gbp           numeric(8,2) not null,
  full_name           text not null,
  email               text not null,
  phone               text not null,
  country             text not null,
  treatment           text not null,
  notes               text,
  status              text not null default 'upcoming',  -- upcoming|completed|cancelled|no_show
  payment_status      text not null default 'unpaid',    -- unpaid|paid|refunded
  transaction_id      text,
  amount_paid         numeric(8,2),
  paid_at             timestamptz,
  staff_notes         text
);
create index if not exists bookings_date_idx    on public.bookings (appointment_date);
create index if not exists bookings_created_idx on public.bookings (created_at desc);

-- ---------- MESSAGES (in-site chat) -------------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  body        text not null,
  status      text not null default 'new'            -- new|read|replied
);
create index if not exists messages_created_idx on public.messages (created_at desc);

-- ---------- ROW LEVEL SECURITY ------------------------------
alter table public.bookings enable row level security;
alter table public.messages enable row level security;

-- The public website may CREATE bookings and messages...
drop policy if exists "public_insert_bookings" on public.bookings;
create policy "public_insert_bookings" on public.bookings
  for insert to anon, authenticated with check (true);

drop policy if exists "public_insert_messages" on public.messages;
create policy "public_insert_messages" on public.messages
  for insert to anon, authenticated with check (true);

-- ...but only logged-in staff may READ / UPDATE them.
drop policy if exists "staff_read_bookings" on public.bookings;
create policy "staff_read_bookings" on public.bookings
  for select to authenticated using (true);

drop policy if exists "staff_update_bookings" on public.bookings;
create policy "staff_update_bookings" on public.bookings
  for update to authenticated using (true);

drop policy if exists "staff_read_messages" on public.messages;
create policy "staff_read_messages" on public.messages
  for select to authenticated using (true);

drop policy if exists "staff_update_messages" on public.messages;
create policy "staff_update_messages" on public.messages
  for update to authenticated using (true);
