alter table public.staff_profiles
  add column if not exists department text not null default '';

comment on column public.staff_profiles.department is 'Staff department (Backend / Frontend, QA, Unity Client, ГД).';
