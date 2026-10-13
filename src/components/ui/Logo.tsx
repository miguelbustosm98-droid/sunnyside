/** Logo sin acción (no es un enlace a propósito: en landings de anuncios evita fugas). */
export function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 py-2.5" aria-label="Sunnyside">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4.5" fill="#f5a623" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1="12" y1="2.5" x2="12" y2="5" stroke="#f5a623" strokeWidth="1.8" strokeLinecap="round" transform={`rotate(${a} 12 12)`} />
        ))}
      </svg>
      <span className="text-lg font-extrabold tracking-tight text-navy">Sunnyside</span>
    </div>
  );
}
