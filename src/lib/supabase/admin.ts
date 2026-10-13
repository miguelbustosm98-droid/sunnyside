import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { publicEnv } from '@/lib/env';
import { serverEnv } from '@/lib/env.server';

/** Cliente service_role. SOLO en rutas de servidor. Ignora RLS. */
export function createServiceClient() {
  return createClient(publicEnv.supabaseUrl, serverEnv.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
