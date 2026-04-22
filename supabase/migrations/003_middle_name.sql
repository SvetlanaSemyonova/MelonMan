alter table public.staff_profiles
  add column if not exists middle_name text not null default '';

comment on column public.staff_profiles.middle_name is 'Patronymic / middle name (отчество).';
