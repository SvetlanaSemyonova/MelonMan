-- Per-staff invite tokens. Admin generates a one-time URL, employee clicks it
-- and lands on the password-setup page (InviteAcceptPage).

alter table public.staff_profiles
  add column if not exists invite_token text,
  add column if not exists invite_expires_at timestamptz;

-- Tokens are globally unique while active; allow many nulls (no active invite).
create unique index if not exists staff_profiles_invite_token_uidx
  on public.staff_profiles (invite_token)
  where invite_token is not null;
