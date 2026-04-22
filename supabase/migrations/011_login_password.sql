-- Minimal app-level credentials for the portal login screen.
-- WARNING: passwords are stored in plaintext in the anon-readable table.
-- Replace with Supabase Auth (or hash + edge function) before exposing publicly.

alter table public.staff_profiles
  add column if not exists login text,
  add column if not exists password text;

-- Seed MelonAdmin with Admin / Admin credentials.
update public.staff_profiles
set login = 'Admin',
    password = 'Admin'
where id = (
  select id from public.staff_profiles
  where role = 'admin'
  order by created_at asc
  limit 1
);
