-- Seed national / global public holidays for the 6 primary countries plus
-- a "Global" bucket for company-wide observances.
-- Safe to re-run: id is text primary key + on conflict do nothing.
-- All labels are in Russian for consistency across the portal.
-- Note: national_holidays.month is 0-indexed (Jan = 0) per 001_portal.sql.

insert into public.national_holidays (id, month, day, name, country) values
  -- Global / company-wide
  ('global-new-year',            0,  1, 'Новый год',                                  'Global'),

  -- Poland (Польша)
  ('pl-new-year',                0,  1, 'Новый год',                                  'Польша'),
  ('pl-epiphany',                0,  6, 'Богоявление',                                'Польша'),
  ('pl-labour',                  4,  1, 'День труда',                                 'Польша'),
  ('pl-constitution',            4,  3, 'День Конституции 3 мая',                     'Польша'),
  ('pl-assumption',              7, 15, 'Успение Богородицы',                         'Польша'),
  ('pl-all-saints',             10,  1, 'День всех святых',                           'Польша'),
  ('pl-independence',           10, 11, 'День независимости',                         'Польша'),
  ('pl-christmas',              11, 25, 'Рождество',                                  'Польша'),
  ('pl-christmas-2',            11, 26, 'Второй день Рождества',                      'Польша'),

  -- Belarus (Беларусь)
  ('by-new-year',                0,  1, 'Новый год',                                  'Беларусь'),
  ('by-orthodox-christmas',      0,  7, 'Рождество (православное)',                   'Беларусь'),
  ('by-womens-day',              2,  8, 'Международный женский день',                 'Беларусь'),
  ('by-labour',                  4,  1, 'День труда',                                 'Беларусь'),
  ('by-victory',                 4,  9, 'День Победы',                                'Беларусь'),
  ('by-independence',            6,  3, 'День Независимости',                         'Беларусь'),
  ('by-catholic-christmas',     11, 25, 'Рождество (католическое)',                   'Беларусь'),

  -- Russia (Россия)
  ('ru-new-year',                0,  1, 'Новый год',                                  'Россия'),
  ('ru-orthodox-christmas',      0,  7, 'Рождество Христово',                         'Россия'),
  ('ru-defender',                1, 23, 'День защитника Отечества',                   'Россия'),
  ('ru-womens-day',              2,  8, 'Международный женский день',                 'Россия'),
  ('ru-labour',                  4,  1, 'Праздник Весны и Труда',                     'Россия'),
  ('ru-victory',                 4,  9, 'День Победы',                                'Россия'),
  ('ru-russia-day',              5, 12, 'День России',                                'Россия'),
  ('ru-unity',                  10,  4, 'День народного единства',                    'Россия'),

  -- Cyprus (Кипр)
  ('cy-new-year',                0,  1, 'Новый год',                                  'Кипр'),
  ('cy-epiphany',                0,  6, 'Богоявление',                                'Кипр'),
  ('cy-greek-independence',      2, 25, 'День независимости Греции',                  'Кипр'),
  ('cy-labour',                  4,  1, 'День труда',                                 'Кипр'),
  ('cy-assumption',              7, 15, 'Успение Богородицы',                         'Кипр'),
  ('cy-independence',            9,  1, 'День независимости Кипра',                   'Кипр'),
  ('cy-ochi',                    9, 28, 'День «Охи»',                                 'Кипр'),
  ('cy-christmas',              11, 25, 'Рождество',                                  'Кипр'),
  ('cy-boxing',                 11, 26, 'Второй день Рождества',                      'Кипр'),

  -- Serbia (Сербия)
  ('rs-new-year',                0,  1, 'Новый год',                                  'Сербия'),
  ('rs-new-year-2',              0,  2, 'Новый год (2-й день)',                       'Сербия'),
  ('rs-orthodox-christmas',      0,  7, 'Рождество (православное)',                   'Сербия'),
  ('rs-statehood',               1, 15, 'День государственности',                     'Сербия'),
  ('rs-labour',                  4,  1, 'День труда',                                 'Сербия'),
  ('rs-armistice',              10, 11, 'День перемирия',                             'Сербия'),

  -- Bulgaria (Болгария)
  ('bg-new-year',                0,  1, 'Новый год',                                  'Болгария'),
  ('bg-liberation',              2,  3, 'День Освобождения',                          'Болгария'),
  ('bg-labour',                  4,  1, 'День труда',                                 'Болгария'),
  ('bg-st-george',               4,  6, 'Гергьёв день',                               'Болгария'),
  ('bg-education',               4, 24, 'День болгарского просвещения и культуры',    'Болгария'),
  ('bg-unification',             8,  6, 'День Объединения',                           'Болгария'),
  ('bg-independence',            8, 22, 'День независимости',                         'Болгария'),
  ('bg-christmas-eve',          11, 24, 'Сочельник',                                  'Болгария'),
  ('bg-christmas',              11, 25, 'Рождество',                                  'Болгария'),
  ('bg-christmas-2',            11, 26, 'Второй день Рождества',                      'Болгария')

on conflict (id) do nothing;
