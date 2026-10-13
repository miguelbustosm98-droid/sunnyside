import Link from 'next/link';
import { getAdminUser } from '@/features/admin/auth';
import { logout } from '@/features/admin/actions';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-bold">Sin acceso</h1>
        <p className="mt-2 text-navy/70">Tu usuario no está en la lista de administradores.</p>
        <form action={logout} className="mt-6"><button className="rounded-xl border border-line px-4 py-2">Salir</button></form>
      </main>
    );
  }
  const nav = [
    ['/admin', 'Resumen'],
    ['/admin/bookings', 'Reservas'],
    ['/admin/tours', 'Tours'],
  ];
  return (
    <div className="min-h-screen bg-soft">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3">
          <b>Sunnyside</b>
          <nav className="flex flex-1 gap-4 text-sm font-medium">
            {nav.map(([href, label]) => <Link key={href} href={href} className="hover:text-brand">{label}</Link>)}
          </nav>
          <span className="hidden text-xs text-navy/60 sm:inline">{user.email}</span>
          <form action={logout}><button className="text-sm underline">Salir</button></form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
