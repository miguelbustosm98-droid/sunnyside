import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** Devuelve el usuario si está autenticado Y está en admin_users; si no, null. */
export async function getAdminUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: row } = await supabase.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
  return row ? data.user : null;
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');
  return user;
}
