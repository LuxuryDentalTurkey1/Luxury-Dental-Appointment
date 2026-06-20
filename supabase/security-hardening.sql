-- ============================================================
--  Luxury Dental Turkey — security hardening
--  WHEN: run this in Supabase → SQL Editor → New query AFTER the new
--        code has finished deploying on Vercel (so live bookings keep
--        working during the switch). Safe to run more than once.
-- ============================================================

-- 1) DUPLICATE GUARD ----------------------------------------------------------
--    Stops a refreshed success page or a webhook retry from inserting the same
--    paid booking twice. Online payments each have a unique Stripe id; manual
--    bookings all share the literal 'manual', so they are excluded.
create unique index if not exists bookings_txn_unique
  on public.bookings (transaction_id)
  where transaction_id is not null and transaction_id <> 'manual';

-- 2) SETTINGS (prices / hours) ------------------------------------------------
--    Anyone may READ (the public booking page shows prices); only logged-in
--    staff may CHANGE them. Closes the "set the price to £0" hole.
alter table public.settings enable row level security;
drop policy if exists "public_read_settings" on public.settings;
create policy "public_read_settings" on public.settings
  for select to anon, authenticated using (true);
drop policy if exists "staff_write_settings" on public.settings;
create policy "staff_write_settings" on public.settings
  for update to authenticated using (true) with check (true);

-- 3) BLOCKED DATES ------------------------------------------------------------
--    Public may read (to grey out closed days); only staff may change.
alter table public.blocked_dates enable row level security;
drop policy if exists "public_read_blocked" on public.blocked_dates;
create policy "public_read_blocked" on public.blocked_dates
  for select to anon, authenticated using (true);
drop policy if exists "staff_write_blocked" on public.blocked_dates;
create policy "staff_write_blocked" on public.blocked_dates
  for all to authenticated using (true) with check (true);

-- 4) TIME BLOCKS (busy intervals) --------------------------------------------
--    Public may read busy intervals (so taken slots show as full); only staff
--    may add / move / delete them.
alter table public.time_blocks enable row level security;
drop policy if exists "public_read_blocks" on public.time_blocks;
create policy "public_read_blocks" on public.time_blocks
  for select to anon, authenticated using (true);
drop policy if exists "staff_write_blocks" on public.time_blocks;
create policy "staff_write_blocks" on public.time_blocks
  for all to authenticated using (true) with check (true);

-- 5) BOOKINGS: close the public-insert hole ----------------------------------
--    The public no longer writes bookings directly. After a verified Stripe
--    payment the SERVER inserts them with the service key (which bypasses RLS),
--    and staff add manual ones while logged in. Removing the open insert means
--    nobody can POST fake bookings with the public key.
drop policy if exists "public_insert_bookings" on public.bookings;
drop policy if exists "staff_insert_bookings" on public.bookings;
create policy "staff_insert_bookings" on public.bookings
  for insert to authenticated with check (true);
