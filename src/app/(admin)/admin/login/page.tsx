import { login } from '@/features/admin/actions';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-extrabold">Sunnyside · Admin</h1>
      <form action={login} className="space-y-3">
        <input name="email" type="email" required placeholder="Correo" autoComplete="email" className="w-full rounded-xl border border-line px-3 py-2.5" />
        <input name="password" type="password" required placeholder="Contraseña" autoComplete="current-password" className="w-full rounded-xl border border-line px-3 py-2.5" />
        {error && <p className="text-sm text-red-600">Correo o contraseña incorrectos.</p>}
        <button className="w-full rounded-xl bg-brand py-3 font-bold text-white">Entrar</button>
      </form>
    </main>
  );
}
