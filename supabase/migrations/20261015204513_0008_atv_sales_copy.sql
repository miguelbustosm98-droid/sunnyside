-- Textos de venta del tour de ATV (descripción corta y bloques), en español e inglés.
-- Solo se usan datos reales del tour: 3 horas, salidas 9:00 y 14:00, cuatrimotos automáticas,
-- guía todo el camino, selva, terracería, playa, parada en restaurante (consumo aparte).

update public.tour_translations tt
set short_description = v.short_description,
    description_blocks = v.blocks::jsonb
from public.tours t,
(values
  ('es',
   'Olvídate del paseo en camión y la foto de siempre. Aquí tú vas al volante: arrancas en plena selva, cruzas charcos y caminos de terracería, y terminas rodando por la orilla del mar en Ixtapa Zihuatanejo.',
   $j$[
     {"type":"p","text":"Son 3 horas lejos de las rutas turísticas de siempre. Cada tramo cambia: sombra de selva, lodo que salpica, subidas de terracería y, al final, el azul del Pacífico frente a ti."},
     {"type":"h","text":"Así se viven tus 3 horas"},
     {"type":"list","items":[
       "Te subes a tu propia cuatrimoto automática y sales detrás de tu guía",
       "Te metes a la selva por caminos de terracería, charcos y lodo",
       "Llegas a la playa y recorres la orilla del mar",
       "Paras para fotos en los puntos con mejor vista",
       "Recargas energía en un restaurante a medio camino (consumo por tu cuenta)"
     ]},
     {"type":"h","text":"¿Nunca has manejado una cuatrimoto?"},
     {"type":"p","text":"No pasa nada. Son automáticas: aceleras, frenas y listo. Tu guía va contigo todo el camino, marca el ritmo y te avisa dónde parar. Tú solo te preocupas por disfrutar."},
     {"type":"h","text":"Elige cómo quieres vivirla"},
     {"type":"list","items":[
       "Cuatrimoto individual: tú solo al volante, a tu ritmo",
       "Cuatrimoto para 2: uno maneja y el otro va disfrutando el paisaje",
       "RZR para 2: la aventura todo terreno en pareja, lado a lado",
       "RZR para 4: toda la familia o el grupo de amigos en un solo vehículo"
     ]},
     {"type":"h","text":"Dos salidas al día, cupo limitado"},
     {"type":"p","text":"Salimos todos los días a las 9:00 y a las 14:00, con lugares limitados en cada salida. Elige tu fecha, paga en línea en un par de minutos y recibe la confirmación en tu correo."}
   ]$j$),
  ('en',
   'Forget the bus tour and the same old photo. Here you are behind the wheel: you start deep in the jungle, splash through puddles and dirt trails, and finish riding along the shoreline in Ixtapa Zihuatanejo.',
   $j$[
     {"type":"p","text":"Three hours far from the usual tourist routes. Every stretch is different: jungle shade, splashing mud, dirt climbs and, at the end, the deep blue Pacific right in front of you."},
     {"type":"h","text":"How your 3 hours unfold"},
     {"type":"list","items":[
       "You hop on your own automatic ATV and head out behind your guide",
       "You ride into the jungle on dirt trails, puddles and mud",
       "You reach the beach and ride along the shoreline",
       "You stop for photos at the spots with the best views",
       "You refuel at a restaurant halfway through (food and drinks on you)"
     ]},
     {"type":"h","text":"Never driven an ATV?"},
     {"type":"p","text":"No problem. They are automatic: accelerate, brake, done. Your guide rides with you the whole way, sets the pace and tells you where to stop. All you have to do is enjoy it."},
     {"type":"h","text":"Choose how you want to ride"},
     {"type":"list","items":[
       "Single ATV: just you behind the wheel, at your own pace",
       "ATV for 2: one drives while the other enjoys the view",
       "RZR for 2: the off-road adventure as a couple, side by side",
       "RZR for 4: the whole family or group of friends in one vehicle"
     ]},
     {"type":"h","text":"Two departures a day, limited spots"},
     {"type":"p","text":"We leave every day at 9:00 am and 2:00 pm, with limited spots on each departure. Pick your date, pay online in a couple of minutes and get your confirmation by email."}
   ]$j$)
) as v(locale, short_description, blocks)
where t.slug = 'atv-ixtapa' and tt.tour_id = t.id and tt.locale = v.locale;
