import type { Dict } from '@/i18n';

export function TrustCard({ t, cancellationHours }: { t: Dict; cancellationHours: number }) {
  const items = [
    t.tour.freeCancelHours(cancellationHours),
    t.tour.securePay,
    t.tour.support,
  ];
  return (
    <div className="rounded-2xl border border-line bg-soft p-4">
      <ul className="space-y-1.5 text-sm font-medium">
        {items.map((i) => (
          <li key={i} className="flex gap-2"><span className="text-green-600">✔</span>{i}</li>
        ))}
      </ul>
    </div>
  );
}
