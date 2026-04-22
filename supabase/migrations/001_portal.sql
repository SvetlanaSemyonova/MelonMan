-- MelonStaff: таблицы портала + открытые RLS для anon (замените политиками под auth, когда появится вход).
-- Выполните в Supabase: SQL Editor → New query → вставьте весь файл → Run.

create table if not exists public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text not null,
  last_name text not null,
  title text not null default '',
  role text not null check (role in ('employee', 'lead', 'admin')),
  permissions text[] not null default '{}',
  region text not null default '',
  employee_id text not null default '',
  manager_name text not null default '',
  joined_at date,
  vacation_used integer not null default 0,
  vacation_total integer not null default 20,
  birthday date,
  created_at timestamptz not null default now()
);

create table if not exists public.absences (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_profiles (id) on delete cascade,
  category text not null check (category in ('holiday', 'sick', 'remote', 'birthday_leave')),
  label text not null default '',
  start_date date not null,
  end_date date not null,
  status text not null default 'Approved',
  detail text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.national_holidays (
  id text primary key,
  month integer not null check (month >= 0 and month <= 11),
  day integer not null check (day >= 1 and day <= 31),
  name text not null,
  country text not null
);

create table if not exists public.regional_holidays (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  title text not null,
  region text not null default '',
  meta text not null default '',
  variant text not null default 'upcoming' check (variant in ('upcoming', 'past'))
);

create table if not exists public.calendar_events (
  id text primary key,
  kind text not null check (kind in ('national', 'sick', 'holiday', 'birthday', 'event')),
  label text not null,
  start_date date not null,
  end_date date,
  national_style text check (national_style is null or national_style in ('bar', 'text')),
  staff_id uuid references public.staff_profiles (id) on delete set null
);

alter table public.staff_profiles enable row level security;
alter table public.absences enable row level security;
alter table public.national_holidays enable row level security;
alter table public.regional_holidays enable row level security;
alter table public.calendar_events enable row level security;

-- Повторный db push: политики уже могли быть созданы вручную / прошлым запуском
drop policy if exists "staff_profiles_all" on public.staff_profiles;
drop policy if exists "absences_all" on public.absences;
drop policy if exists "national_holidays_all" on public.national_holidays;
drop policy if exists "regional_holidays_all" on public.regional_holidays;
drop policy if exists "calendar_events_all" on public.calendar_events;

create policy "staff_profiles_all" on public.staff_profiles for all using (true) with check (true);
create policy "absences_all" on public.absences for all using (true) with check (true);
create policy "national_holidays_all" on public.national_holidays for all using (true) with check (true);
create policy "regional_holidays_all" on public.regional_holidays for all using (true) with check (true);
create policy "calendar_events_all" on public.calendar_events for all using (true) with check (true);

-- Сиды (можно удалить и заполнить своими данными)
insert into public.staff_profiles (
  id, email, first_name, last_name, title, role, permissions, region, employee_id, manager_name, joined_at, vacation_used, vacation_total, birthday
) values
  ('11111111-1111-4111-8111-111111110001', 'sarah.jenkins@demo.local', 'Sarah', 'Jenkins', 'Product Designer', 'employee',
   array['self.data', 'self.requests']::text[], 'United Kingdom, London', 'EMP-SJ-001', 'Marcus Thorne', '2019-03-15', 15, 20, '1993-10-26'),
  ('11111111-1111-4111-8111-111111110002', 'marcus.thorne@demo.local', 'Marcus', 'Thorne', 'Engineering Lead', 'lead',
   array['self.data', 'self.requests', 'team.view', 'team.calendar', 'reports.export']::text[], 'United Kingdom, London', 'EMP-MT-002', 'Elena Vasquez', '2017-08-01', 8, 22, '1985-10-28'),
  ('11111111-1111-4111-8111-111111110003', 'elena.vasquez@demo.local', 'Elena', 'Vasquez', 'HR Partner', 'lead',
   array['self.data', 'self.requests', 'team.view', 'team.calendar', 'reports.export']::text[], 'Serbia, Belgrade', 'EMP-EV-003', 'Alex Mercer', '2018-01-10', 6, 20, '1991-01-12'),
  ('11111111-1111-4111-8111-111111110004', 'james.okonkwo@demo.local', 'James', 'Okonkwo', 'Backend Developer', 'employee',
   array['self.data', 'self.requests']::text[], 'Germany, Berlin', 'EMP-JO-004', 'Marcus Thorne', '2020-06-22', 11, 20, '1998-01-22'),
  ('11111111-1111-4111-8111-111111110005', 'alex.mercer@demo.local', 'Alex', 'Mercer', 'HR Director', 'admin',
   array['self.data', 'self.requests', 'team.view', 'team.calendar', 'org.view_all', 'org.settings', 'users.manage', 'reports.export', 'integrations.manage']::text[],
   'United Kingdom, London', 'EMP-AM-005', '—', '2016-02-14', 12, 25, '1987-02-03')
on conflict (id) do nothing;

insert into public.absences (staff_id, category, label, start_date, end_date, status, detail) values
  ('11111111-1111-4111-8111-111111110001', 'holiday', 'Holiday', '2026-03-28', '2026-04-05', 'Approved', '5 days remaining'),
  ('11111111-1111-4111-8111-111111110002', 'sick', 'Sick', '2026-04-01', '2026-04-01', 'Approved', 'Returning tomorrow'),
  ('11111111-1111-4111-8111-111111110003', 'remote', 'Remote', '2026-04-01', '2026-04-03', 'Approved', 'Until Friday'),
  ('11111111-1111-4111-8111-111111110004', 'holiday', 'Holiday', '2026-03-30', '2026-04-04', 'Approved', '3 days remaining'),
  ('11111111-1111-4111-8111-111111110001', 'holiday', 'Holiday (5 days)', '2026-04-02', '2026-04-06', 'Approved', 'Team schedule'),
  ('11111111-1111-4111-8111-111111110002', 'sick', 'Sick', '2026-03-30', '2026-03-31', 'Approved', 'Team schedule'),
  ('11111111-1111-4111-8111-111111110003', 'remote', 'Remote (3 days)', '2026-04-01', '2026-04-03', 'Approved', 'Team schedule'),
  ('11111111-1111-4111-8111-111111110004', 'birthday_leave', 'B-Day Leave', '2026-04-04', '2026-04-06', 'Approved', 'Team schedule'),
  ('11111111-1111-4111-8111-111111110005', 'holiday', 'Holiday', '2026-04-10', '2026-04-14', 'Approved', 'Team schedule'),
  ('11111111-1111-4111-8111-111111110001', 'holiday', 'Summer Vacation', '2024-08-12', '2024-08-22', 'Approved', '10 Working Days'),
  ('11111111-1111-4111-8111-111111110001', 'sick', 'Medical Leave', '2024-06-04', '2024-06-05', 'Approved', '2 Working Days'),
  ('11111111-1111-4111-8111-111111110001', 'birthday_leave', 'Birthday Leave', '2024-05-15', '2024-05-15', 'Approved', '1 Working Day');

insert into public.national_holidays (id, month, day, name, country) values
  ('us-1', 10, 1, 'Labor Day', 'United States'),
  ('us-2', 10, 11, 'Veterans Day', 'United States'),
  ('us-3', 10, 28, 'Thanksgiving', 'United States'),
  ('uk-1', 4, 1, 'Early May bank holiday', 'United Kingdom'),
  ('uk-2', 11, 26, 'Boxing Day', 'United Kingdom'),
  ('de-1', 9, 3, 'German Unity Day', 'Germany'),
  ('de-2', 11, 25, 'Christmas Day', 'Germany'),
  ('rs-1', 0, 1, 'New Year''s Day', 'Serbia'),
  ('rs-2', 4, 1, 'Labour Day', 'Serbia'),
  ('fr-1', 6, 14, 'Bastille Day', 'France'),
  ('jp-1', 4, 29, 'Showa Day', 'Japan'),
  ('ca-1', 6, 1, 'Canada Day', 'Canada')
on conflict (id) do nothing;

insert into public.regional_holidays (event_date, title, region, meta, variant) values
  ('2026-11-11', 'Armistice Day', 'Serbia, Belgrade', 'Public Holiday • Monday', 'upcoming'),
  ('2026-01-01', 'New Year''s Day', 'Serbia, Belgrade', 'Public Holiday • Past', 'past'),
  ('2026-01-07', 'Orthodox Christmas', 'Serbia, Belgrade', 'Public Holiday • Past', 'past');

insert into public.calendar_events (id, kind, label, start_date, end_date, national_style, staff_id) values
  ('s1', 'sick', 'Sarah J.', '2024-05-02', null, null, null),
  ('n1', 'national', 'Bank Holiday', '2024-05-06', null, 'bar', null),
  ('n2', 'national', 'May Holidays (3)', '2024-05-07', null, 'text', null),
  ('h1', 'holiday', '', '2024-05-08', '2024-05-10', null, null),
  ('b1', 'birthday', 'Marco''s Bday', '2024-05-15', null, null, null),
  ('e1', 'event', 'London Conf.', '2024-05-16', null, null, null),
  ('s2', 'sick', 'Alex P.', '2024-05-22', null, null, null),
  ('h4', 'holiday', 'Alex Leave', '2024-05-24', null, null, null),
  ('demo1', 'birthday', 'Team Day', '2024-06-01', null, null, null),
  ('demo2', 'national', 'Regional day', '2024-08-15', null, 'text', null),
  ('demo3', 'holiday', 'Winter break', '2024-12-23', '2024-12-27', null, null)
on conflict (id) do nothing;
