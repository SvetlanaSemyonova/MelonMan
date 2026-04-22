-- Audit log for staff profile edits done from the Settings page.

create table if not exists public.staff_profile_changes (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references public.staff_profiles (id) on delete cascade,
  changed_by uuid references public.staff_profiles (id) on delete set null,
  changed_at timestamptz not null default now(),
  field text not null,
  old_value text,
  new_value text
);

create index if not exists staff_profile_changes_staff_id_idx
  on public.staff_profile_changes (staff_id);

create index if not exists staff_profile_changes_changed_at_idx
  on public.staff_profile_changes (changed_at desc);

alter table public.staff_profile_changes enable row level security;

drop policy if exists "staff_profile_changes_all" on public.staff_profile_changes;
create policy "staff_profile_changes_all"
  on public.staff_profile_changes
  for all
  using (true) with check (true);
