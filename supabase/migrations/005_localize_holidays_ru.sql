-- Force Russian labels on every seeded public holiday.
-- Safe no-op if already Russian. Targets rows by the deterministic IDs from 004.

update public.national_holidays set name = 'Новый год'                                 where id = 'global-new-year';

update public.national_holidays set name = 'Новый год'                                 where id = 'pl-new-year';
update public.national_holidays set name = 'Богоявление'                               where id = 'pl-epiphany';
update public.national_holidays set name = 'День труда'                                where id = 'pl-labour';
update public.national_holidays set name = 'День Конституции 3 мая'                    where id = 'pl-constitution';
update public.national_holidays set name = 'Успение Богородицы'                        where id = 'pl-assumption';
update public.national_holidays set name = 'День всех святых'                          where id = 'pl-all-saints';
update public.national_holidays set name = 'День независимости'                        where id = 'pl-independence';
update public.national_holidays set name = 'Рождество'                                 where id = 'pl-christmas';
update public.national_holidays set name = 'Второй день Рождества'                     where id = 'pl-christmas-2';

update public.national_holidays set name = 'Новый год'                                 where id = 'by-new-year';
update public.national_holidays set name = 'Рождество (православное)'                  where id = 'by-orthodox-christmas';
update public.national_holidays set name = 'Международный женский день'                where id = 'by-womens-day';
update public.national_holidays set name = 'День труда'                                where id = 'by-labour';
update public.national_holidays set name = 'День Победы'                               where id = 'by-victory';
update public.national_holidays set name = 'День Независимости'                        where id = 'by-independence';
update public.national_holidays set name = 'Рождество (католическое)'                  where id = 'by-catholic-christmas';

update public.national_holidays set name = 'Новый год'                                 where id = 'cy-new-year';
update public.national_holidays set name = 'Богоявление'                               where id = 'cy-epiphany';
update public.national_holidays set name = 'День независимости Греции'                 where id = 'cy-greek-independence';
update public.national_holidays set name = 'День труда'                                where id = 'cy-labour';
update public.national_holidays set name = 'Успение Богородицы'                        where id = 'cy-assumption';
update public.national_holidays set name = 'День независимости Кипра'                  where id = 'cy-independence';
update public.national_holidays set name = 'День «Охи»'                                where id = 'cy-ochi';
update public.national_holidays set name = 'Рождество'                                 where id = 'cy-christmas';
update public.national_holidays set name = 'Второй день Рождества'                     where id = 'cy-boxing';

update public.national_holidays set name = 'Новый год'                                 where id = 'rs-new-year';
update public.national_holidays set name = 'Новый год (2-й день)'                      where id = 'rs-new-year-2';
update public.national_holidays set name = 'Рождество (православное)'                  where id = 'rs-orthodox-christmas';
update public.national_holidays set name = 'День государственности'                    where id = 'rs-statehood';
update public.national_holidays set name = 'День труда'                                where id = 'rs-labour';
update public.national_holidays set name = 'День перемирия'                            where id = 'rs-armistice';

update public.national_holidays set name = 'Новый год'                                 where id = 'bg-new-year';
update public.national_holidays set name = 'День Освобождения'                         where id = 'bg-liberation';
update public.national_holidays set name = 'День труда'                                where id = 'bg-labour';
update public.national_holidays set name = 'Гергьёв день'                              where id = 'bg-st-george';
update public.national_holidays set name = 'День болгарского просвещения и культуры'   where id = 'bg-education';
update public.national_holidays set name = 'День Объединения'                          where id = 'bg-unification';
update public.national_holidays set name = 'День независимости'                        where id = 'bg-independence';
update public.national_holidays set name = 'Сочельник'                                 where id = 'bg-christmas-eve';
update public.national_holidays set name = 'Рождество'                                 where id = 'bg-christmas';
update public.national_holidays set name = 'Второй день Рождества'                     where id = 'bg-christmas-2';
