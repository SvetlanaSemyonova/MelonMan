-- Extend staff_profiles with richer identity fields for employees who
-- live and work across multiple jurisdictions (common in distributed teams).

alter table public.staff_profiles
  add column if not exists country_citizenship text not null default '',
  add column if not exists country_residence text not null default '',
  add column if not exists country_legal text not null default '',
  add column if not exists personal_note text not null default '';

comment on column public.staff_profiles.country_citizenship is 'Country of citizenship, e.g. Belarus';
comment on column public.staff_profiles.country_residence is 'Country where the person currently lives, e.g. Poland';
comment on column public.staff_profiles.country_legal is 'Jurisdiction used for legal / tax registration (e.g. IE / IP country), e.g. Georgia';
comment on column public.staff_profiles.personal_note is 'Free-form internal note about the employee (HR-only).';
