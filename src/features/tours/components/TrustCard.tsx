import type { Dict } from '@/i18n';
import { StripeBadge } from '@/components/ui/StripeBadge';
import { ClockIcon, IconWithBar, PinIcon, ShieldIcon } from './icons';

interface Props {
  t: Dict;
  cancellationHours: number;
  meetingPoint: string | null;
}

export function TrustCard({ t, cancellationHours, meetingPoint }: Props) {
  const items = [
    { icon: <ClockIcon />, title: t.tour.freeCancel, sub: t.tour.freeCancelHours(cancellationHours) },
    { icon: <ShieldIcon />, title: t.tour.securePay, sub: t.tour.securePaySub, stripe: true },
    meetingPoint ? { icon: <PinIcon />, title: t.tour.meetingPoint, sub: meetingPoint } : null,
  ].filter(Boolean) as { icon: React.ReactNode; title: string; sub: string; stripe?: boolean }[];

  return (
    <ul className="divide-y divide-line rounded-2xl border border-line px-6">
      {items.map((i) => (
        <li key={i.title} className="flex items-start gap-6 py-5">
          <IconWithBar>{i.icon}</IconWithBar>
          <div>
            <p className="font-semibold">{i.title}</p>
            <p className="mt-0.5 text-sm text-navy/55">
              {i.sub}
              {i.stripe && <StripeBadge className="ml-1.5" />}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
