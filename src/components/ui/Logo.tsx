import Image from 'next/image';

/** Logo sin acción (no es un enlace a propósito: en landings de anuncios evita fugas). */
export function Logo() {
  return (
    <div className="flex items-center justify-center py-4">
      <Image
        src="https://sunnyside.com.mx/wp-content/uploads/2026/03/Logo-blanco-scaled.png"
        alt="Sunnyside DMC Services"
        width={140}
        height={37}
        priority
        className="h-auto w-[140px]"
      />
    </div>
  );
}
