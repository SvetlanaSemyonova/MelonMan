-- Remove the demo staff seeded in migration 001, keeping the admin
-- (renamed to MelonAdmin by migration 008) and any real users added later.
-- Cascades into absences, staff_profile_changes, etc.

delete from public.staff_profiles
where email like '%@demo.local'
  and role != 'admin';
