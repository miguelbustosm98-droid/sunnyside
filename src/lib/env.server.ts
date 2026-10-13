import 'server-only';

/** Variables privadas: solo servidor. Lanza error claro si falta una requerida. */
export function requireServerEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta la variable de entorno ${name}`);
  return v;
}

export const serverEnv = {
  get serviceRoleKey() { return requireServerEnv('SUPABASE_SERVICE_ROLE_KEY'); },
  get stripeSecretKey() { return requireServerEnv('STRIPE_SECRET_KEY'); },
  get stripeWebhookSecret() { return requireServerEnv('STRIPE_WEBHOOK_SECRET'); },
  metaCapiToken: process.env.META_CAPI_TOKEN ?? '',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  resendFrom: process.env.RESEND_FROM ?? '',
  adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL ?? '',
};
