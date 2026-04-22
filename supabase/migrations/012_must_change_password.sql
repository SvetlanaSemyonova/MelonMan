-- Force password change on first login for newly created staff.
-- Existing rows are backfilled to false so current sessions don't break.

alter table public.staff_profiles
  add column if not exists must_change_password boolean not null default true;

update public.staff_profiles
set must_change_password = false;
