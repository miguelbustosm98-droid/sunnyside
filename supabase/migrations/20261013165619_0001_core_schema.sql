-- Sunnyside Reservas: esquema base
create type public.tour_status as enum ('draft', 'published', 'archived');
create type public.booking_status as enum ('pending', 'paid', 'cancelled', 'expired', 'refunded');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Administradores del panel (usuarios de Supabase Auth con permiso)
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

-- Tours
create table public.tours (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status public.tour_status not null default 'draft',
  duration_minutes integer not null check (duration_minutes > 0),
  min_travelers integer not null default 1 check (min_travelers >= 1),
  max_travelers_per_booking integer not null default 12 check (max_travelers_per_booking >= 1),
  currency char(3) not null default 'MXN',
  video_youtube_id text,
  cancellation_hours integer not null default 48 check (cancellation_hours >= 0),
  min_notice_hours integer not null default 24 check (min_notice_hours >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger tours_set_updated_at before update on public.tours
  for each row execute function public.set_updated_at();

-- Textos por idioma. description_blocks: [{"type":"p","text":""},{"type":"h","text":""},{"type":"list","items":[""]}]
create table public.tour_translations (
  tour_id uuid not null references public.tours (id) on delete cascade,
  locale text not null check (locale in ('es', 'en')),
  title text not null,
  subtitle text,
  location text,
  meeting_point text,
  short_description text,
  description_blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(description_blocks) = 'array'),
  primary key (tour_id, locale)
);

create table public.tour_images (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index tour_images_tour_id_idx on public.tour_images (tour_id, sort_order);

-- Opciones y precios (ej. ATV individual, doble, por persona). travelers = personas que ocupa cada unidad.
create table public.tour_options (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  price_cents integer not null check (price_cents >= 0),
  travelers integer not null default 1 check (travelers >= 1),
  max_quantity integer not null default 10 check (max_quantity >= 1),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index tour_options_tour_id_idx on public.tour_options (tour_id, sort_order);

create table public.tour_option_translations (
  option_id uuid not null references public.tour_options (id) on delete cascade,
  locale text not null check (locale in ('es', 'en')),
  name text not null,
  description text,
  primary key (option_id, locale)
);

-- Horarios: dias de la semana (0 = domingo) y cupo en personas por salida
create table public.tour_schedules (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  weekdays smallint[] not null default '{0,1,2,3,4,5,6}' check (weekdays <@ array[0,1,2,3,4,5,6]::smallint[] and cardinality(weekdays) > 0),
  start_time time not null,
  capacity integer not null check (capacity > 0),
  valid_from date,
  valid_until date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index tour_schedules_tour_id_idx on public.tour_schedules (tour_id);

create table public.tour_blackouts (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours (id) on delete cascade,
  on_date date not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (tour_id, on_date)
);

-- Reservas
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  tour_id uuid not null references public.tours (id),
  tour_date date not null,
  tour_time time not null,
  travelers integer not null check (travelers > 0),
  status public.booking_status not null default 'pending',
  currency char(3) not null,
  total_cents integer not null check (total_cents >= 0),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_email text not null check (customer_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(customer_email) <= 200),
  customer_phone text not null check (char_length(customer_phone) between 7 and 30),
  lodging text check (char_length(lodging) <= 200),
  comments text check (char_length(comments) <= 1000),
  internal_notes text,
  locale text not null default 'es' check (locale in ('es', 'en')),
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  utm jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  paid_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bookings_slot_idx on public.bookings (tour_id, tour_date, tour_time);
create index bookings_status_idx on public.bookings (status);
create index bookings_created_at_idx on public.bookings (created_at desc);
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

create table public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  option_id uuid references public.tour_options (id) on delete set null,
  option_name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  travelers_per_unit integer not null check (travelers_per_unit > 0)
);
create index booking_items_booking_id_idx on public.booking_items (booking_id);
create index booking_items_option_id_idx on public.booking_items (option_id);
