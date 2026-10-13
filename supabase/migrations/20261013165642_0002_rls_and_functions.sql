-- Seguridad (RLS) y funciones de disponibilidad / reserva

alter table public.admin_users enable row level security;
alter table public.tours enable row level security;
alter table public.tour_translations enable row level security;
alter table public.tour_images enable row level security;
alter table public.tour_options enable row level security;
alter table public.tour_option_translations enable row level security;
alter table public.tour_schedules enable row level security;
alter table public.tour_blackouts enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_items enable row level security;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- admin_users: cada admin ve solo su propia fila; nadie escribe desde el cliente
create policy admin_users_self_read on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

-- Lectura publica solo de tours publicados y sus datos
create policy tours_public_read on public.tours
  for select to anon, authenticated using (status = 'published');
create policy tours_admin_all on public.tours
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy tour_translations_public_read on public.tour_translations
  for select to anon, authenticated
  using (exists (select 1 from public.tours t where t.id = tour_id and t.status = 'published'));
create policy tour_translations_admin_all on public.tour_translations
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy tour_images_public_read on public.tour_images
  for select to anon, authenticated
  using (exists (select 1 from public.tours t where t.id = tour_id and t.status = 'published'));
create policy tour_images_admin_all on public.tour_images
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy tour_options_public_read on public.tour_options
  for select to anon, authenticated
  using (active and exists (select 1 from public.tours t where t.id = tour_id and t.status = 'published'));
create policy tour_options_admin_all on public.tour_options
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy tour_option_translations_public_read on public.tour_option_translations
  for select to anon, authenticated
  using (exists (
    select 1 from public.tour_options o join public.tours t on t.id = o.tour_id
    where o.id = option_id and o.active and t.status = 'published'));
create policy tour_option_translations_admin_all on public.tour_option_translations
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Horarios, bloqueos, reservas: solo admin (el publico usa funciones controladas)
create policy tour_schedules_admin_all on public.tour_schedules
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy tour_blackouts_admin_all on public.tour_blackouts
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy bookings_admin_all on public.bookings
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy booking_items_admin_all on public.booking_items
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Disponibilidad: salidas con cupo restante para un rango de fechas (max 92 dias).
-- Cuenta reservas pagadas y pendientes que todavia no expiran. Respeta bloqueos y aviso minimo.
create or replace function public.slot_availability(p_tour_id uuid, p_from date, p_to date)
returns table (
  slot_date date,
  slot_time time,
  schedule_id uuid,
  capacity integer,
  booked integer,
  remaining integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select sl.slot_date, sl.start_time, sl.schedule_id, sl.capacity, bk.booked,
         greatest(sl.capacity - bk.booked, 0)
  from (
    select d::date as slot_date, s.id as schedule_id, s.start_time, s.capacity
    from generate_series(p_from::timestamp, p_to::timestamp, interval '1 day') d
    join public.tours t on t.id = p_tour_id and t.status = 'published'
    join public.tour_schedules s on s.tour_id = t.id and s.active
      and extract(dow from d)::smallint = any (s.weekdays)
      and (s.valid_from is null or d::date >= s.valid_from)
      and (s.valid_until is null or d::date <= s.valid_until)
    where not exists (
        select 1 from public.tour_blackouts b where b.tour_id = t.id and b.on_date = d::date)
      and ((d::date + s.start_time) at time zone 'America/Mexico_City')
          >= now() + make_interval(hours => t.min_notice_hours)
  ) sl
  cross join lateral (
    select coalesce(sum(x.travelers), 0)::integer as booked
    from public.bookings x
    where x.tour_id = p_tour_id
      and x.tour_date = sl.slot_date
      and x.tour_time = sl.start_time
      and (x.status = 'paid' or (x.status = 'pending' and x.expires_at > now()))
  ) bk
  where p_to >= p_from and p_to - p_from <= 92
  order by sl.slot_date, sl.start_time;
$$;

revoke execute on function public.slot_availability(uuid, date, date) from public;
grant execute on function public.slot_availability(uuid, date, date) to anon, authenticated, service_role;

-- Crea una reserva pendiente de forma atomica. Los precios SIEMPRE salen de la base de datos.
-- p_items: [{"option_id": "...", "quantity": 2}]
create or replace function public.create_pending_booking(
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
  p_hold_minutes integer default 20
)
returns table (
  booking_id uuid,
  booking_code text,
  total_cents integer,
  currency text,
  travelers integer
)
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
    customer_name, customer_email, customer_phone, lodging, comments, locale, utm, expires_at
  ) values (
    v_tour.id, p_date, p_time, v_travelers, 'pending', v_tour.currency, v_total,
    trim(p_name), lower(trim(p_email)), trim(p_phone), nullif(trim(p_lodging), ''),
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

revoke execute on function public.create_pending_booking(text, date, time, jsonb, text, text, text, text, text, text, jsonb, integer) from public, anon, authenticated;
grant execute on function public.create_pending_booking(text, date, time, jsonb, text, text, text, text, text, text, jsonb, integer) to service_role;
