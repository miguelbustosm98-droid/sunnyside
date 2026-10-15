-- Ciudad de donde nos visita el cliente (opcional, para conocer el origen de los turistas).
alter table public.bookings
  add column if not exists customer_city text check (char_length(customer_city) <= 120);

-- Se reemplaza la función para aceptar p_city. Va al final y con default para que el
-- código desplegado antes de este cambio (que no la manda) siga funcionando.
drop function if exists public.create_pending_booking(text, date, time, jsonb, text, text, text, text, text, text, jsonb, integer);

create function public.create_pending_booking(
  p_tour_slug text,
  p_date date,
  p_time time,
  p_items jsonb,
  p_name text,
  p_email text,
  p_phone text,
  p_lodging text,
  p_comments text,
  p_locale text,
  p_utm jsonb,
  p_hold_minutes integer default 20,
  p_city text default null
)
returns table (booking_id uuid, booking_code text, total_cents integer, currency text, travelers integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tour public.tours%rowtype;
  v_sched public.tour_schedules%rowtype;
  v_n integer;
  v_travelers integer;
  v_total integer;
  v_ok boolean;
  v_booked integer;
  v_booking public.bookings%rowtype;
  v_locale text := case when p_locale = 'en' then 'en' else 'es' end;
begin
  select * into v_tour from public.tours t where t.slug = p_tour_slug and t.status = 'published';
  if not found then
    raise exception 'tour_not_found';
  end if;

  -- Bloquea la salida para evitar sobreventa si dos personas reservan al mismo tiempo
  select * into v_sched
  from public.tour_schedules s
  where s.tour_id = v_tour.id and s.active and s.start_time = p_time
    and extract(dow from p_date)::smallint = any (s.weekdays)
    and (s.valid_from is null or p_date >= s.valid_from)
    and (s.valid_until is null or p_date <= s.valid_until)
  order by s.id
  limit 1
  for update;
  if not found then
    raise exception 'slot_unavailable';
  end if;

  if exists (select 1 from public.tour_blackouts b where b.tour_id = v_tour.id and b.on_date = p_date) then
    raise exception 'slot_unavailable';
  end if;

  if ((p_date + p_time) at time zone 'America/Mexico_City') < now() + make_interval(hours => v_tour.min_notice_hours) then
    raise exception 'too_late';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'invalid_items';
  end if;

  select count(*), coalesce(sum(q.qty * o.travelers), 0), coalesce(sum(q.qty * o.price_cents), 0),
         bool_and(q.qty between 1 and o.max_quantity)
    into v_n, v_travelers, v_total, v_ok
  from (
    select (e ->> 'option_id')::uuid as option_id, (e ->> 'quantity')::integer as qty
    from jsonb_array_elements(p_items) e
  ) q
  join public.tour_options o on o.id = q.option_id and o.tour_id = v_tour.id and o.active;

  if v_n <> jsonb_array_length(p_items) or v_ok is not true then
    raise exception 'invalid_items';
  end if;
  if v_travelers < v_tour.min_travelers or v_travelers > v_tour.max_travelers_per_booking then
    raise exception 'invalid_travelers';
  end if;

  select coalesce(sum(x.travelers), 0)::integer into v_booked
  from public.bookings x
  where x.tour_id = v_tour.id and x.tour_date = p_date and x.tour_time = p_time
    and (x.status = 'paid' or (x.status = 'pending' and x.expires_at > now()));
  if v_booked + v_travelers > v_sched.capacity then
    raise exception 'sold_out';
  end if;

  insert into public.bookings (
    tour_id, tour_date, tour_time, travelers, status, currency, total_cents,
    customer_name, customer_email, customer_phone, customer_city, lodging, comments, locale, utm, expires_at
  ) values (
    v_tour.id, p_date, p_time, v_travelers, 'pending', v_tour.currency, v_total,
    trim(p_name), lower(trim(p_email)), trim(p_phone), nullif(trim(p_city), ''), nullif(trim(p_lodging), ''),
    nullif(trim(p_comments), ''), v_locale, coalesce(p_utm, '{}'::jsonb),
    now() + make_interval(mins => p_hold_minutes)
  ) returning * into v_booking;

  insert into public.booking_items (booking_id, option_id, option_name, unit_price_cents, quantity, travelers_per_unit)
  select v_booking.id, o.id,
         coalesce(
           (select tr.name from public.tour_option_translations tr where tr.option_id = o.id and tr.locale = v_locale),
           (select tr.name from public.tour_option_translations tr where tr.option_id = o.id and tr.locale = 'es'),
           'Option'),
         o.price_cents, q.qty, o.travelers
  from (
    select (e ->> 'option_id')::uuid as option_id, (e ->> 'quantity')::integer as qty
    from jsonb_array_elements(p_items) e
  ) q
  join public.tour_options o on o.id = q.option_id;

  return query select v_booking.id, v_booking.code, v_booking.total_cents, v_booking.currency::text, v_booking.travelers;
end;
$$;

revoke execute on function public.create_pending_booking(text, date, time, jsonb, text, text, text, text, text, text, jsonb, integer, text) from public, anon, authenticated;
grant execute on function public.create_pending_booking(text, date, time, jsonb, text, text, text, text, text, text, jsonb, integer, text) to service_role;
