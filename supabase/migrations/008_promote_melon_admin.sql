-- Ensure the portal has a single primary admin account named "MelonAdmin"
-- with all permissions granted. Preserves other staff rows untouched.

-- 1) If there's no admin at all, promote the oldest staff row to admin.
update public.staff_profiles
set role = 'admin'
where id = (select id from public.staff_profiles order by created_at asc limit 1)
  and not exists (select 1 from public.staff_profiles where role = 'admin');

-- 2) Rename the oldest admin to MelonAdmin and grant full permissions.
update public.staff_profiles
set first_name = 'MelonAdmin',
    middle_name = '',
    last_name = '',
    title = 'Administrator',
    role = 'admin',
    permissions = array[
      'self.data', 'self.requests',
      'team.view', 'team.calendar',
      'org.view_all', 'org.settings',
      'users.manage', 'reports.export', 'integrations.manage'
    ]::text[]
where id = (
  select id from public.staff_profiles where role = 'admin'
  order by created_at asc limit 1
);

-- 3) If the staff table is empty (fresh DB), seed MelonAdmin.
insert into public.staff_profiles (
  email, first_name, middle_name, last_name, title, role, permissions,
  region, employee_id, manager_name, joined_at,
  vacation_used, vacation_total, sick_total
)
select 'admin@melonstaff.local', 'MelonAdmin', '', '', 'Administrator', 'admin',
  array['self.data','self.requests','team.view','team.calendar','org.view_all','org.settings','users.manage','reports.export','integrations.manage']::text[],
  '', '', '', current_date, 0, 20, 10
where not exists (select 1 from public.staff_profiles);
