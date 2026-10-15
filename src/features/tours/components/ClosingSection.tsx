/** Cierre emocional antes del último botón. */
export function ClosingSection({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-2xl bg-navy px-6 py-8 text-center text-white">
      <h3 className="font-display text-3xl font-extrabold uppercase leading-none tracking-tight">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/80">{text}</p>
    </section>
  );
}
