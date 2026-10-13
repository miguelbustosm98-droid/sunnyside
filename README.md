# Sunnyside Reservas

Landing + motor de reservas + panel admin para tours (ATV, caballos…) en Ixtapa-Zihuatanejo.
**Next.js 15 (App Router) · Supabase · Stripe · Vercel · Tailwind v4**

## Arquitectura

```
src/
  app/                  Rutas (solo orquestan, sin lógica de negocio)
    (site)/[locale]/    Sitio público es/en: inicio, tours/[slug], booking/success
    (admin)/admin/      Panel: login + (panel)/ resumen, reservas, tours
    api/                availability, checkout, stripe/webhook
  core/                 Lógica pura y probada (fechas, precios, cupos, errores, bloques). Sin dependencias.
  features/
    tours/              Consultas a Supabase + componentes (galería, video, hechos, confianza)
    booking/            Widget de reserva (calendario, horarios, opciones, datos), esquemas zod, servicio
    payments/           Stripe Checkout, webhook idempotente, emails (Resend, opcional)
    analytics/          Meta Pixel, UTM/fbp/fbc, Conversions API (opcional)
    admin/              Server actions y auth del panel
  lib/                  env, clientes Supabase (browser / server / service-role / middleware)
  i18n/                 Diccionarios es/en
  components/ui/        Piezas compartidas (Logo)
supabase/               migrations/ (esquema, RLS, funciones) y seed.sql
tests/core/             Pruebas de la lógica pura (npm test)
```

Reglas: `app/` no contiene lógica; `features/*` no se importan entre sí salvo por tipos; `core/` no importa nada.

## Seguridad de las reservas
- El navegador **nunca** escribe reservas: `POST /api/checkout` usa la función SQL `create_pending_booking` (service_role) que
  recalcula precios desde la base de datos, bloquea la salida (`FOR UPDATE`) y evita sobreventa.
- Una reserva `pending` retiene cupo ~32 min; si no se paga, deja de contar sola (y Stripe emite `checkout.session.expired`).
- El webhook de Stripe confirma el pago (idempotente) y dispara correo + evento Purchase (CAPI).
- RLS: el público solo lee tours publicados; todo lo demás es solo admin.

## Puesta en marcha
1. **GitHub**: sube esta carpeta a un repo.
2. **Vercel**: importa el repo y define las variables de `.env.example`:
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase → Project Settings → API (secret/service_role). Nunca con prefijo `NEXT_PUBLIC_`.
   - `NEXT_PUBLIC_SITE_URL`: la URL final (sin `/` al final).
   - `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` (siguiente punto).
   - Opcionales: Pixel (`NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_TOKEN`), correos (`RESEND_API_KEY`, `RESEND_FROM`, `ADMIN_NOTIFY_EMAIL`).
3. **Stripe**: Developers → Webhooks → endpoint `https://TU-DOMINIO/api/stripe/webhook`, eventos
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`. Copia el *signing secret*.
4. **Primer administrador**: Supabase → Authentication → Users → *Add user* (correo + contraseña, marcar confirmado). Luego en SQL Editor:
   ```sql
   insert into public.admin_users (user_id) select id from auth.users where email = 'TU_CORREO';
   ```
   Entra en `/admin`.
5. **Completa y publica** los tours en el panel (vienen en *Borrador* con datos provisionales): nombres/precios de opciones,
   personas por opción, horarios y cupo, fotos, punto de encuentro del caballo. Cuando esté listo, cambia el estado a *Publicado*.
6. Cuando salgas a producción pon `NEXT_PUBLIC_INDEXABLE=true` (mientras tanto el sitio lleva `noindex`).

## Desarrollo local
```bash
cp .env.example .env.local   # completa las claves
npm install
npm run dev
npm test                     # pruebas de src/core
npx supabase gen types typescript --project-id tmpolvintkttkrkczjze > src/lib/database.types.ts  # opcional
```

## Notas
- Logo: `components/ui/Logo.tsx` es un texto provisional sin enlace; cámbialo por `<Image src="/logo.png" …>` poniendo el archivo en `public/`.
- Atribución: UTM, `fbclid`, `_fbp` y `_fbc` se guardan en `bookings.utm`; Purchase se envía por navegador y por CAPI con el mismo `event_id` (deduplicación).
- Si sigues vendiendo también por WordPress/WooCommerce, los cupos son independientes: dirige el tráfico de anuncios a un solo sistema.
- Los errores de formularios del panel usan la página de error de Next (suficiente para un MVP); se pueden pulir con `useActionState`.
