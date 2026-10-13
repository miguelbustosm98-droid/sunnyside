'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from './auth';
import { bool, int, optStr, pesosToCents, str } from './form';
import { textToBlocks } from '@/core/blocks';

function fail(msg: string, error: { message: string } | null): void {
  if (error) throw new Error(`${msg}: ${error.message}`);
}

/* ---------- Sesión ---------- */
export async function login(fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: str(fd, 'email'), password: str(fd, 'password') });
  if (error) redirect('/admin/login?error=1');
  redirect('/admin');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

/* ---------- Reservas ---------- */
export async function setBookingStatus(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = str(fd, 'id');
  const status = str(fd, 'status');
  const patch: Record<string, unknown> = { status };
  if (status === 'cancelled') patch.cancelled_at = new Date().toISOString();
  const { error } = await supabase.from('bookings').update(patch).eq('id', id);
  fail('No se pudo actualizar la reserva', error);
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath('/admin/bookings');
}

export async function saveBookingNotes(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = str(fd, 'id');
  const { error } = await supabase.from('bookings').update({ internal_notes: optStr(fd, 'notes') }).eq('id', id);
  fail('No se pudo guardar la nota', error);
  revalidatePath(`/admin/bookings/${id}`);
}

/* ---------- Tours ---------- */
export async function createTour(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const slug = str(fd, 'slug').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  const title = str(fd, 'title');
  if (!slug || !title) throw new Error('Slug y título son obligatorios');
  const { data, error } = await supabase.from('tours').insert({ slug, duration_minutes: 120, status: 'draft' }).select('id').single();
  fail('No se pudo crear el tour', error);
  const id = (data as { id: string }).id;
  const tr = await supabase.from('tour_translations').insert([
    { tour_id: id, locale: 'es', title },
    { tour_id: id, locale: 'en', title },
  ]);
  fail('No se pudo crear la traducción', tr.error);
  redirect(`/admin/tours/${id}`);
}

export async function saveTour(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = str(fd, 'id');
  const base = await supabase.from('tours').update({
    status: str(fd, 'status'),
    duration_minutes: int(fd, 'duration_minutes', 120),
    min_travelers: int(fd, 'min_travelers', 1),
    max_travelers_per_booking: int(fd, 'max_travelers_per_booking', 12),
    min_notice_hours: int(fd, 'min_notice_hours', 24),
    cancellation_hours: int(fd, 'cancellation_hours', 48),
    sort_order: int(fd, 'sort_order', 0),
    video_youtube_id: optStr(fd, 'video_youtube_id'),
  }).eq('id', id);
  fail('No se pudo guardar el tour', base.error);

  for (const locale of ['es', 'en'] as const) {
    const { error } = await supabase.from('tour_translations').upsert({
      tour_id: id,
      locale,
      title: str(fd, `title_${locale}`) || 'Sin título',
      subtitle: optStr(fd, `subtitle_${locale}`),
      location: optStr(fd, `location_${locale}`),
      meeting_point: optStr(fd, `meeting_point_${locale}`),
      short_description: optStr(fd, `short_${locale}`),
      description_blocks: textToBlocks(str(fd, `blocks_${locale}`)),
    });
    fail(`No se pudo guardar el texto (${locale})`, error);
  }
  revalidatePath(`/admin/tours/${id}`);
  revalidatePath('/admin/tours');
}

/* ---------- Imágenes ---------- */
export async function addImage(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const tourId = str(fd, 'tour_id');
  let url = str(fd, 'url');
  const file = fd.get('file');
  if (file instanceof File && file.size > 0) {
    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${tourId}/${randomUUID()}.${ext}`;
    const up = await supabase.storage.from('tour-images').upload(path, file, { contentType: file.type, upsert: false });
    fail('No se pudo subir la imagen', up.error);
    url = supabase.storage.from('tour-images').getPublicUrl(path).data.publicUrl;
  }
  if (!url) throw new Error('Pega una URL o elige un archivo');
  const { error } = await supabase.from('tour_images').insert({ tour_id: tourId, url, alt: optStr(fd, 'alt'), sort_order: int(fd, 'sort_order', 99) });
  fail('No se pudo guardar la imagen', error);
  revalidatePath(`/admin/tours/${tourId}`);
}

export async function saveImage(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('tour_images').update({ alt: optStr(fd, 'alt'), sort_order: int(fd, 'sort_order', 0) }).eq('id', str(fd, 'id'));
  fail('No se pudo guardar la imagen', error);
  revalidatePath(`/admin/tours/${str(fd, 'tour_id')}`);
}

export async function deleteImage(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('tour_images').delete().eq('id', str(fd, 'id'));
  fail('No se pudo borrar la imagen', error);
  revalidatePath(`/admin/tours/${str(fd, 'tour_id')}`);
}

/* ---------- Opciones de precio ---------- */
export async function saveOption(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const tourId = str(fd, 'tour_id');
  let id = str(fd, 'id');
  const row = {
    tour_id: tourId,
    price_cents: pesosToCents(fd, 'price'),
    travelers: int(fd, 'travelers', 1),
    max_quantity: int(fd, 'max_quantity', 10),
    sort_order: int(fd, 'sort_order', 0),
    active: bool(fd, 'active'),
  };
  if (id) {
    const { error } = await supabase.from('tour_options').update(row).eq('id', id);
    fail('No se pudo guardar la opción', error);
  } else {
    const { data, error } = await supabase.from('tour_options').insert({ ...row, active: true }).select('id').single();
    fail('No se pudo crear la opción', error);
    id = (data as { id: string }).id;
  }
  const tr = await supabase.from('tour_option_translations').upsert([
    { option_id: id, locale: 'es', name: str(fd, 'name_es') || 'Opción', description: optStr(fd, 'desc_es') },
    { option_id: id, locale: 'en', name: str(fd, 'name_en') || str(fd, 'name_es') || 'Option', description: optStr(fd, 'desc_en') },
  ]);
  fail('No se pudo guardar el nombre de la opción', tr.error);
  revalidatePath(`/admin/tours/${tourId}`);
}

export async function deleteOption(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('tour_options').delete().eq('id', str(fd, 'id'));
  fail('No se pudo borrar (si ya tiene reservas, desactívala en su lugar)', error);
  revalidatePath(`/admin/tours/${str(fd, 'tour_id')}`);
}

/* ---------- Horarios ---------- */
export async function saveSchedule(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const tourId = str(fd, 'tour_id');
  const id = str(fd, 'id');
  const weekdays = fd.getAll('weekdays').map((v) => parseInt(String(v), 10)).filter((n) => n >= 0 && n <= 6);
  const row = {
    tour_id: tourId,
    start_time: str(fd, 'start_time'),
    capacity: int(fd, 'capacity', 10),
    weekdays,
    valid_from: optStr(fd, 'valid_from'),
    valid_until: optStr(fd, 'valid_until'),
    active: id ? bool(fd, 'active') : true,
  };
  const q = id ? supabase.from('tour_schedules').update(row).eq('id', id) : supabase.from('tour_schedules').insert(row);
  const { error } = await q;
  fail('No se pudo guardar el horario', error);
  revalidatePath(`/admin/tours/${tourId}`);
}

export async function deleteSchedule(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('tour_schedules').delete().eq('id', str(fd, 'id'));
  fail('No se pudo borrar el horario', error);
  revalidatePath(`/admin/tours/${str(fd, 'tour_id')}`);
}

/* ---------- Días bloqueados ---------- */
export async function addBlackout(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const tourId = str(fd, 'tour_id');
  const { error } = await supabase.from('tour_blackouts').insert({ tour_id: tourId, on_date: str(fd, 'on_date'), reason: optStr(fd, 'reason') });
  fail('No se pudo bloquear el día', error);
  revalidatePath(`/admin/tours/${tourId}`);
}

export async function deleteBlackout(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('tour_blackouts').delete().eq('id', str(fd, 'id'));
  fail('No se pudo quitar el bloqueo', error);
  revalidatePath(`/admin/tours/${str(fd, 'tour_id')}`);
}
