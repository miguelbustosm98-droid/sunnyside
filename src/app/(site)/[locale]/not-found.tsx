import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold">404</h1>
      <Link href="/" className="mt-4 inline-block text-brand underline">Sunnyside</Link>
    </main>
  );
}
