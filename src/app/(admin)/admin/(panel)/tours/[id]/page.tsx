import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { blocksToText, parseBlocks } from '@/core/blocks';
import { shortTime } from '@/core/dates';
import * as A from '@/features/admin/actions';

const field = 'w-full rounded-xl border border-line px-3 py-2 text-sm';
const card = 'rounded-2xl bg-white p-5 shadow-sm';
const btn = 'rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white';
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default async function EditTour({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: tour } = await supabase
    .from('tours')
    .select(`*, tour_translations(*), tour_images(*), tour_schedules(*), tour_blackouts(*),
             tour_options(*, tour_option_translations(*))`)
    .eq('id', id)
    .maybeSingle();
  if (!tour) notFound();

  const tr = (l: string) => (tour.tour_translations as any[]).find((t) => t.locale === l) ?? {};
  const es = tr('es');
  const en = tr('en');
  const images = [...(tour.tour_images as any[])].sort((a, b) => a.sort_order - b.sort_order);
  const options = [...(tour.tour_options as any[])].sort((a, b) => a.sort_order - b.sort_order);
  const schedules = [...(tour.tour_schedules as any[])].sort((a, b) => a.start_time.localeCompare(b.start_time));
  const blackouts = [...(tour.tour_blackouts as any[])].sort((a, b) => a.on_date.localeCompare(b.on_date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/tours" className="text-sm text-brand underline">← Tours</Link>
        <Link href={`/es/tours/${tour.slug}`} target="_blank" className="text-sm text-brand underline">Ver página →</Link>
      </div>

      {/* Datos generales + textos */}
      <form action={A.saveTour} className={`${card} space-y-4`}>
        <input type="hidden" name="id" value={tour.id} />
        <h2 className="text-lg font-extrabold">Datos generales</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="text-xs font-bold">Estado
            <select name="status" defaultValue={tour.status} className={field}>
              <option value="draft">Borrador (oculto)</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </label>
          <Num label="Duración (min)" name="duration_minutes" v={tour.duration_minutes} />
          <Num label="Mín. viajeros" name="min_travelers" v={tour.min_travelers} />
          <Num label="Máx. por reserva" name="max_travelers_per_booking" v={tour.max_travelers_per_booking} />
          <Num label="Anticipación mín. (h)" name="min_notice_hours" v={tour.min_notice_hours} />
          <Num label="Cancelación gratis (h)" name="cancellation_hours" v={tour.cancellation_hours} />
          <Num label="Orden" name="sort_order" v={tour.sort_order} />
          <label className="text-xs font-bold">ID de YouTube
            <input name="video_youtube_id" defaultValue={tour.video_youtube_id ?? ''} className={field} placeholder="-6J9DPeJyOI" />
          </label>
        </div>

        {(['es', 'en'] as const).map((l) => {
          const t = l === 'es' ? es : en;
          return (
            <fieldset key={l} className="space-y-2 rounded-xl border border-line p-3">
              <legend className="px-1 text-sm font-extrabold">{l === 'es' ? 'Español' : 'English'}</legend>
              <input name={`title_${l}`} defaultValue={t.title ?? ''} placeholder="Título" className={field} />
              <input name={`subtitle_${l}`} defaultValue={t.subtitle ?? ''} placeholder="Subtítulo" className={field} />
              <div className="grid gap-2 sm:grid-cols-2">
                <input name={`location_${l}`} defaultValue={t.location ?? ''} placeholder="Ubicación (ej. Ixtapa-Zihuatanejo)" className={field} />
                <input name={`meeting_point_${l}`} defaultValue={t.meeting_point ?? ''} placeholder="Punto de encuentro" className={field} />
              </div>
              <textarea name={`short_${l}`} defaultValue={t.short_description ?? ''} rows={3} placeholder="Texto corto de venta (aparece antes del video)" className={field} />
              <textarea name={`blocks_${l}`} defaultValue={blocksToText(parseBlocks(t.description_blocks))} rows={10} className={`${field} font-mono`}
                placeholder={'Párrafo...\n\n## Subtítulo\n\nQué vas a vivir:\n- Punto 1\n- Punto 2'} />
            </fieldset>
          );
        })}
        <p className="text-xs text-navy/60">Descripción: separa párrafos con una línea en blanco; "## " para subtítulo; líneas con "- " forman una lista (la línea anterior terminada en ":" es su título).</p>
        <button className={btn}>Guardar</button>
      </form>

      {/* Imágenes */}
      <section className={`${card} space-y-3`}>
        <h2 className="text-lg font-extrabold">Fotos (la primera abre el carrusel)</h2>
        {images.map((im) => (
          <div key={im.id} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={im.url} alt="" className="h-14 w-20 rounded-lg object-cover" />
            <form action={A.saveImage} className="flex flex-1 gap-2">
              <input type="hidden" name="id" value={im.id} /><input type="hidden" name="tour_id" value={tour.id} />
              <input name="sort_order" type="number" defaultValue={im.sort_order} className={`${field} w-20`} title="Orden" />
              <input name="alt" defaultValue={im.alt ?? ''} placeholder="Texto alternativo" className={field} />
              <button className={btn}>OK</button>
            </form>
            <form action={A.deleteImage}>
              <input type="hidden" name="id" value={im.id} /><input type="hidden" name="tour_id" value={tour.id} />
              <button className="text-sm text-red-600 underline">Borrar</button>
            </form>
          </div>
        ))}
        <form action={A.addImage} className="flex flex-wrap gap-2 border-t border-line pt-3">
          <input type="hidden" name="tour_id" value={tour.id} />
          <input name="url" placeholder="URL de imagen…" className={`${field} flex-1`} />
          <input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="text-sm" />
          <input name="sort_order" type="number" defaultValue={images.length} className={`${field} w-20`} />
          <button className={btn}>Agregar foto</button>
        </form>
      </section>

      {/* Opciones */}
      <section className={`${card} space-y-3`}>
        <h2 className="text-lg font-extrabold">Opciones y precios</h2>
        {options.map((o) => <OptionForm key={o.id} tourId={tour.id} o={o} />)}
        <div className="border-t border-line pt-3">
          <p className="mb-2 text-sm font-bold">Nueva opción</p>
          <OptionForm tourId={tour.id} />
        </div>
      </section>

      {/* Horarios */}
      <section className={`${card} space-y-3`}>
        <h2 className="text-lg font-extrabold">Horarios y cupo</h2>
        {schedules.map((s) => <ScheduleForm key={s.id} tourId={tour.id} s={s} />)}
        <div className="border-t border-line pt-3">
          <p className="mb-2 text-sm font-bold">Nuevo horario</p>
          <ScheduleForm tourId={tour.id} />
        </div>
      </section>

      {/* Bloqueos */}
      <section className={`${card} space-y-3`}>
        <h2 className="text-lg font-extrabold">Días bloqueados</h2>
        {blackouts.map((b) => (
          <form key={b.id} action={A.deleteBlackout} className="flex items-center gap-3 text-sm">
            <input type="hidden" name="id" value={b.id} /><input type="hidden" name="tour_id" value={tour.id} />
            <span>{b.on_date}{b.reason ? ` — ${b.reason}` : ''}</span>
            <button className="text-red-600 underline">Quitar</button>
          </form>
        ))}
        <form action={A.addBlackout} className="flex flex-wrap gap-2 border-t border-line pt-3">
          <input type="hidden" name="tour_id" value={tour.id} />
          <input name="on_date" type="date" required className={field + ' w-44'} />
          <input name="reason" placeholder="Motivo (opcional)" className={`${field} flex-1`} />
          <button className={btn}>Bloquear día</button>
        </form>
      </section>
    </div>
  );
}

function Num({ label, name, v }: { label: string; name: string; v: number }) {
  return (
    <label className="text-xs font-bold">{label}
      <input name={name} type="number" defaultValue={v} className={field} />
    </label>
  );
}

function OptionForm({ tourId, o }: { tourId: string; o?: any }) {
  const nm = (l: string) => o?.tour_option_translations?.find((t: any) => t.locale === l);
  return (
    <form action={A.saveOption} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-6">
      <input type="hidden" name="tour_id" value={tourId} />
      {o && <input type="hidden" name="id" value={o.id} />}
      <input name="name_es" defaultValue={nm('es')?.name ?? ''} placeholder="Nombre (ES)" className={`${field} sm:col-span-2`} required />
      <input name="name_en" defaultValue={nm('en')?.name ?? ''} placeholder="Name (EN)" className={`${field} sm:col-span-2`} />
      <input name="price" defaultValue={o ? o.price_cents / 100 : ''} placeholder="Precio MXN" inputMode="decimal" className={field} required />
      <input name="travelers" type="number" defaultValue={o?.travelers ?? 1} title="Viajeros que cubre" className={field} />
      <input name="max_quantity" type="number" defaultValue={o?.max_quantity ?? 10} title="Máx. cantidad" className={field} />
      <input name="sort_order" type="number" defaultValue={o?.sort_order ?? 0} title="Orden" className={field} />
      {o && <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="active" defaultChecked={o.active} /> Activa</label>}
      <div className="flex gap-3 sm:col-span-2">
        <button className={btn}>{o ? 'Guardar' : 'Agregar'}</button>
      </div>
      {o && (
        <button formAction={A.deleteOption} className="text-left text-sm text-red-600 underline">Borrar</button>
      )}
    </form>
  );
}

function ScheduleForm({ tourId, s }: { tourId: string; s?: any }) {
  const days: number[] = s?.weekdays ?? [0, 1, 2, 3, 4, 5, 6];
  return (
    <form action={A.saveSchedule} className="space-y-2 rounded-xl border border-line p-3">
      <input type="hidden" name="tour_id" value={tourId} />
      {s && <input type="hidden" name="id" value={s.id} />}
      <div className="flex flex-wrap gap-3">
        {DAYS.map((d, i) => (
          <label key={d} className="flex items-center gap-1 text-sm">
            <input type="checkbox" name="weekdays" value={i} defaultChecked={days.includes(i)} />{d}
          </label>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-5">
        <input name="start_time" type="time" defaultValue={s ? shortTime(s.start_time) : '09:00'} required className={field} />
        <input name="capacity" type="number" min={1} defaultValue={s?.capacity ?? 10} title="Cupo (personas)" className={field} />
        <input name="valid_from" type="date" defaultValue={s?.valid_from ?? ''} title="Válido desde" className={field} />
        <input name="valid_until" type="date" defaultValue={s?.valid_until ?? ''} title="Válido hasta" className={field} />
        {s && <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="active" defaultChecked={s.active} /> Activo</label>}
      </div>
      <div className="flex gap-3">
        <button className={btn}>{s ? 'Guardar' : 'Agregar'}</button>
        {s && <button formAction={A.deleteSchedule} className="text-sm text-red-600 underline">Borrar</button>}
      </div>
    </form>
  );
}
