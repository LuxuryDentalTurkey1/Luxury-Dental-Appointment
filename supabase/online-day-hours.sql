-- ============================================================
--  Luxury Dental Turkey — per-day online hours
--  RUN in Supabase → SQL Editor. Safe to run more than once.
--  Lets each weekday have its own online opening hours (and lets you
--  edit them from Admin → Settings). Index: 0=Sun ... 6=Sat.
--  open = first bookable hour, close = the appointment must finish by then,
--  closed = the whole day is off for online.
-- ============================================================

alter table public.settings
  add column if not exists online_day_hours jsonb;

-- Seed the current defaults on the settings row only if it is still empty
-- (Sun/Mon 09-21, Tue/Wed 09-20, Thu/Fri 18-21 evening-only, Sat 09-17).
update public.settings
set online_day_hours = '[
  {"open":9,"close":21,"closed":false},
  {"open":9,"close":21,"closed":false},
  {"open":9,"close":20,"closed":false},
  {"open":9,"close":20,"closed":false},
  {"open":18,"close":21,"closed":false},
  {"open":18,"close":21,"closed":false},
  {"open":9,"close":17,"closed":false}
]'::jsonb
where id = 1 and online_day_hours is null;
