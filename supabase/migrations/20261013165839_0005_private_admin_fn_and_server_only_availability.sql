-- is_admin() sale del esquema expuesto por la API REST
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
alter function public.is_admin() set schema private;

-- La disponibilidad se consulta solo desde el servidor (service_role)
revoke execute on function public.slot_availability(uuid, date, date) from public, anon, authenticated;
grant execute on function public.slot_availability(uuid, date, date) to service_role;
