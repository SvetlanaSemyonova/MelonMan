alter table public.staff_profiles
  add column if not exists sick_total integer not null default 10;

comment on column public.staff_profiles.sick_total is 'Per-employee annual sick-leave allowance (days).';
