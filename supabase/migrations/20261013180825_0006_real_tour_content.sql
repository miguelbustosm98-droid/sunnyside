-- Datos reales tomados de sunnyside.com.mx (opciones, horarios y fotos del ATV; fotos y punto de encuentro del caballo)

-- ATV: opciones reales
update public.tour_option_translations ot
set name = v.name
from public.tour_options o
join (values
  (1, 'es', 'ATV sencilla'), (1, 'en', 'Single ATV'),
  (2, 'es', 'ATV doble'),    (2, 'en', 'Double ATV'),
  (3, 'es', 'RZR 2 personas'), (3, 'en', 'RZR 2 people'),
  (4, 'es', 'RZR 4 personas'), (4, 'en', 'RZR 4 people')
) as v(sort_order, locale, name) on v.sort_order = o.sort_order
join public.tours t on t.id = o.tour_id and t.slug = 'atv-ixtapa'
where ot.option_id = o.id and ot.locale = v.locale;

-- El RZR 2 PAX es para 2 personas (no 3)
update public.tour_options o set travelers = 2
from public.tours t
where t.id = o.tour_id and t.slug = 'atv-ixtapa' and o.sort_order = 3;

-- ATV: horarios 9:00 y 14:00, cupo 25
update public.tour_schedules s set capacity = 25
from public.tours t
where t.id = s.tour_id and t.slug = 'atv-ixtapa';

insert into public.tour_schedules (tour_id, weekdays, start_time, capacity)
select t.id, array[0,1,2,3,4,5,6], '14:00', 25
from public.tours t
where t.slug = 'atv-ixtapa'
  and not exists (select 1 from public.tour_schedules s where s.tour_id = t.id and s.start_time = '14:00');

-- Fotos (9 del ATV, 5 del caballo)
delete from public.tour_images i
using public.tours t
where t.id = i.tour_id and t.slug in ('atv-ixtapa', 'paseo-a-caballo');

insert into public.tour_images (tour_id, url, alt, sort_order)
select t.id, 'https://sunnyside.com.mx/wp-content/uploads/' || v.path, v.alt, v.ord
from public.tours t
join (values
  ('atv-ixtapa', 0, '2026/06/Adrenaline-Adventure_ATV-Man-1536x865.jpg', 'ATV atravesando un charco en la selva'),
  ('atv-ixtapa', 1, '2023/04/ATV-4x4-168-1024x1536.jpg', 'ATV 4x4 en el recorrido'),
  ('atv-ixtapa', 2, '2023/04/ATV-4x4-31-1024x683.jpg', 'Grupo en ATV por la selva'),
  ('atv-ixtapa', 3, '2023/04/ATV-4x4-156-1024x683.jpg', 'ATV en sendero de terracería'),
  ('atv-ixtapa', 4, '2023/04/ATV-4x4-43-scaled-e1760132308699.jpg', 'Recorrido en ATV'),
  ('atv-ixtapa', 5, '2023/04/ATV-4x4-136-1024x683.jpg', 'ATV en la playa'),
  ('atv-ixtapa', 6, '2023/04/ATV-4x4-26-1024x683.jpg', 'ATV cruzando un arroyo'),
  ('atv-ixtapa', 7, '2023/04/DSC00041-topaz-1024x683.jpg', 'Aventura en ATV en Ixtapa'),
  ('atv-ixtapa', 8, '2023/04/DSC09911-topaz-1024x683.jpg', 'ATV en Ixtapa Zihuatanejo'),
  ('paseo-a-caballo', 0, '2023/04/IMG_5268-1024x683.jpg', 'Paseo a caballo en la playa'),
  ('paseo-a-caballo', 1, '2026/07/IMG_5345-1024x683.jpg', 'Cabalgata entre palmeras'),
  ('paseo-a-caballo', 2, '2026/08/IMG_5304-1024x683.jpg', 'Caballos junto al mar'),
  ('paseo-a-caballo', 3, '2026/08/Alta-26-1024x683.jpg', 'Paseo a caballo en Ixtapa'),
  ('paseo-a-caballo', 4, '2026/08/Alta-10-1024x683.jpg', 'Jinetes en la playa')
) as v(slug, ord, path, alt) on v.slug = t.slug;

-- Caballo: punto de encuentro
update public.tour_translations tr
set meeting_point = case tr.locale when 'es' then 'Lobby del hotel' else 'Hotel lobby' end
from public.tours t
where t.id = tr.tour_id and t.slug = 'paseo-a-caballo';
