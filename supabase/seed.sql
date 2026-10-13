-- Datos iniciales (ya aplicados al proyecto "Sunnyside Reservas"). Solo para proyectos nuevos.
-- Tours EN BORRADOR: completar precios, horarios y fotos en el panel y luego publicar.
insert into public.tours (slug, status, duration_minutes, min_travelers, max_travelers_per_booking, video_youtube_id, cancellation_hours, min_notice_hours, sort_order)
values
  ('atv-ixtapa', 'draft', 180, 1, 12, '-6J9DPeJyOI', 48, 24, 1),
  ('paseo-a-caballo', 'draft', 90, 1, 12, null, 48, 24, 2)
on conflict (slug) do nothing;

insert into public.tour_translations (tour_id, locale, title, subtitle, location, meeting_point, short_description, description_blocks)
select t.id, v.locale, v.title, v.subtitle, 'Ixtapa - Zihuatanejo', v.meeting_point, v.short_description, v.description_blocks::jsonb
from public.tours t
join (values
  ('atv-ixtapa', 'es', 'Aventura en ATV', 'Selva, senderos y playa en Ixtapa Zihuatanejo', 'Lobby del hotel',
   'Vive la mejor experiencia en Ixtapa Zihuatanejo a bordo de un ATV: recorre la selva, caminos de terracería y charcos hasta llegar a la playa, con guía durante todo el recorrido. Los ATV son automáticos y fáciles de manejar.',
   '[{"type":"p","text":"Dejas atrás las vías principales y descubres rincones de Ixtapa Zihuatanejo que normalmente quedan fuera de las rutas turísticas: terracería, vegetación tropical, charcos y pequeños arroyos. Es una aventura todo terreno donde cada tramo cambia."},{"type":"h","text":"Qué vas a vivir"},{"type":"list","items":["Recorrido de 3 horas con guía todo el camino","ATV automáticos y fáciles de manejar","Terracería, charcos y selva","Llegada a la playa y recorrido por la orilla del mar","Parada en restaurante (el consumo no está incluido en el tour y corre por cuenta del cliente)","Paradas para tomar fotos"]},{"type":"p","text":"Después de la selva llegas a la costa de Ixtapa Zihuatanejo: playas rodeadas de vegetación tropical y el azul intenso del mar. Haz una pausa, toma fotos y llévate un recuerdo que no vas a olvidar."},{"type":"p","text":"Ideal para tus vacaciones si buscas adrenalina, aire libre y una forma distinta de conocer Ixtapa Zihuatanejo. Elige tu fecha y reserva tu lugar."}]'),
  ('atv-ixtapa', 'en', 'ATV Adventure', 'Jungle, trails and beach in Ixtapa Zihuatanejo', 'Hotel lobby',
   'Live the best experience in Ixtapa Zihuatanejo on an ATV: ride through the jungle, dirt roads and puddles all the way to the beach, with a guide by your side the whole tour. The ATVs are automatic and easy to drive.',
   '[{"type":"p","text":"You leave the main roads behind and discover corners of Ixtapa Zihuatanejo that usually stay off the tourist routes: dirt trails, tropical vegetation, puddles and small streams. It is an off-road adventure where every stretch is different."},{"type":"h","text":"What you will do"},{"type":"list","items":["3-hour ride with a guide the whole way","Automatic ATVs that are easy to drive","Dirt trails, puddles and jungle","Arrive at the beach and ride along the shoreline","Restaurant stop (food and drinks are not included in the tour and are paid by the guest)","Photo stops"]},{"type":"p","text":"After the jungle you reach the Ixtapa Zihuatanejo coast: beaches surrounded by tropical vegetation and the deep blue of the sea. Take a break, snap some photos and bring home a memory you will not forget."},{"type":"p","text":"Perfect for your vacation if you want adrenaline, fresh air and a different way to get to know Ixtapa Zihuatanejo. Pick your date and book your spot."}]'),
  ('paseo-a-caballo', 'es', 'Paseo a caballo', 'Palmeras, playa y mar en Ixtapa Zihuatanejo', null,
   'Vive la mejor experiencia a caballo en Ixtapa Zihuatanejo: cabalga entre palmeras de coco hasta la playa, con caballos dóciles y guías que te acompañan todo el recorrido. No necesitas experiencia.',
   '[{"type":"p","text":"Tu aventura empieza en un rancho familiar con caballos dóciles y bien entrenados. Antes de salir, tus guías te ayudan a elegir el caballo ideal para tu nivel."},{"type":"h","text":"Qué vas a vivir"},{"type":"list","items":["Recorrido a caballo de hora y media con guía todo el camino","No necesitas experiencia: hay caballo para principiantes y para jinetes con experiencia","Senderos entre palmeras de coco y vegetación tropical","Paseo junto al mar en una de las playas de la zona","Información local de tus guías durante el recorrido"]},{"type":"p","text":"Avanzas a ritmo tranquilo con la brisa costera hasta llegar a la playa: arena suave, amplias vistas y olas. Disfruta un paseo junto al mar o contempla el paisaje a ritmo relajado."},{"type":"p","text":"Ideal para parejas, familias y amigos que visitan Ixtapa Zihuatanejo. Elige tu fecha y reserva tu lugar."}]'),
  ('paseo-a-caballo', 'en', 'Horseback Ride', 'Palm trees, beach and sea in Ixtapa Zihuatanejo', null,
   'Live the best horseback experience in Ixtapa Zihuatanejo: ride among coconut palms all the way to the beach, with gentle horses and guides by your side the whole way. No experience needed.',
   '[{"type":"p","text":"Your adventure starts at a family ranch with gentle, well-trained horses. Before you set out, your guides help you pick the right horse for your level."},{"type":"h","text":"What you will do"},{"type":"list","items":["One-and-a-half-hour horseback ride with a guide the whole way","No experience needed: horses for beginners and experienced riders","Trails among coconut palms and tropical vegetation","A ride along the sea at one of the local beaches","Local insights from your guides during the ride"]},{"type":"p","text":"You move at an easy pace with the coastal breeze until you reach the beach: soft sand, wide views and waves. Enjoy a ride by the sea or simply take in the scenery at a relaxed pace."},{"type":"p","text":"Perfect for couples, families and friends visiting Ixtapa Zihuatanejo. Pick your date and book your spot."}]')
) as v(slug, locale, title, subtitle, meeting_point, short_description, description_blocks) on v.slug = t.slug
on conflict (tour_id, locale) do nothing;

insert into public.tour_images (tour_id, url, alt, sort_order)
select t.id, v.url, v.alt, v.sort_order
from public.tours t
join (values
  ('atv-ixtapa', 'https://sunnyside.com.mx/wp-content/uploads/2026/06/Adrenaline-Adventure_ATV-Man-1536x865.jpg', 'ATV atravesando un charco en la selva', 0),
  ('atv-ixtapa', 'https://sunnyside.com.mx/wp-content/uploads/2023/04/ATV-4x4-168-1024x1536.jpg', 'ATV 4x4 en el recorrido', 1)
) as v(slug, url, alt, sort_order) on v.slug = t.slug
where not exists (select 1 from public.tour_images i where i.tour_id = t.id and i.url = v.url);

-- Opciones y precios PROVISIONALES (editar en el panel antes de publicar)
with opts as (
  insert into public.tour_options (tour_id, price_cents, travelers, max_quantity, sort_order)
  select t.id, v.price_cents, v.travelers, v.max_quantity, v.sort_order
  from public.tours t
  join (values
    ('atv-ixtapa', 290000, 1, 6, 1),
    ('atv-ixtapa', 390000, 2, 6, 2),
    ('atv-ixtapa', 470000, 3, 4, 3),
    ('atv-ixtapa', 890000, 4, 3, 4),
    ('paseo-a-caballo', 137000, 1, 10, 1)
  ) as v(slug, price_cents, travelers, max_quantity, sort_order) on v.slug = t.slug
  where not exists (select 1 from public.tour_options o where o.tour_id = t.id)
  returning id, tour_id, sort_order
)
insert into public.tour_option_translations (option_id, locale, name, description)
select o.id, l.locale,
  case when t.slug = 'paseo-a-caballo'
       then case l.locale when 'es' then 'Por persona' else 'Per person' end
       else case l.locale when 'es' then 'Opción ' || o.sort_order || ' (editar en el panel)' else 'Option ' || o.sort_order || ' (edit in admin)' end
  end,
  null
from opts o
join public.tours t on t.id = o.tour_id
cross join (values ('es'), ('en')) as l(locale);

-- Horarios PROVISIONALES (ajustar en el panel antes de publicar)
insert into public.tour_schedules (tour_id, weekdays, start_time, capacity)
select t.id, '{0,1,2,3,4,5,6}'::smallint[], v.start_time::time, v.capacity
from public.tours t
join (values ('atv-ixtapa', '09:00', 12), ('paseo-a-caballo', '09:00', 10)) as v(slug, start_time, capacity) on v.slug = t.slug
where not exists (select 1 from public.tour_schedules s where s.tour_id = t.id);
