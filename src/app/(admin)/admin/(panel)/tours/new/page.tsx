import { createTour } from '@/features/admin/actions';

export default function NewTour() {
  return (
    <form action={createTour} className="max-w-md space-y-3 rounded-2xl bg-white p-5 shadow-sm">
      <h1 className="text-xl font-extrabold">Nuevo tour</h1>
      <input name="title" required placeholder="Título (ej. Tour en lancha)" className="w-full rounded-xl border border-line px-3 py-2.5" />
      <input name="slug" required placeholder="slug-en-la-url (ej. tour-en-lancha)" className="w-full rounded-xl border border-line px-3 py-2.5" />
      <button className="rounded-xl bg-brand px-4 py-2.5 font-bold text-white">Crear borrador</button>
    </form>
  );
}
