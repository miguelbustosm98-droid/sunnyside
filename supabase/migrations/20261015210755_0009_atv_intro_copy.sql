-- Párrafo de entrada del tour de ATV (opción B elegida por el cliente).
update public.tour_translations tt
set short_description = v.short_description
from public.tours t,
(values
  ('es', 'Unas vacaciones en Ixtapa Zihuatanejo no están completas sin un poco de lodo. Súbete a tu cuatrimoto, recorre la selva y los caminos de terracería, y termina rodando por la orilla del mar.'),
  ('en', 'A vacation in Ixtapa Zihuatanejo isn''t complete without a little mud. Hop on your ATV, ride through the jungle and dirt trails, and finish rolling along the shoreline.')
) as v(locale, short_description)
where t.slug = 'atv-ixtapa' and tt.tour_id = t.id and tt.locale = v.locale;
