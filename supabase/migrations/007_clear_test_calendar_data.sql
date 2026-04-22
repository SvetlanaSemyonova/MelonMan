-- Clear all seeded/test calendar data.
-- Public holidays in `national_holidays` (state holidays) and floating
-- Easter-derived holidays (computed in code) are intentionally preserved.

delete from public.absences;
delete from public.calendar_events;
