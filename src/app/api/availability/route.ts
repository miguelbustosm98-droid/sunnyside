import { NextResponse } from 'next/server';
import { availabilityQuery } from '@/features/booking/schemas';
import { getAvailability } from '@/features/booking/service';
import { isValidIsoDate, parseIsoDate } from '@/core/dates';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const parsed = availabilityQuery.safeParse({ slug: sp.get('slug'), from: sp.get('from'), to: sp.get('to') });
  if (!parsed.success || !isValidIsoDate(parsed.data.from) || !isValidIsoDate(parsed.data.to)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const { slug, from, to } = parsed.data;
  const days = (parseIsoDate(to).getTime() - parseIsoDate(from).getTime()) / 86400000;
  if (days < 0 || days > 92) return NextResponse.json({ error: 'bad_range' }, { status: 400 });

  try {
    const slots = await getAvailability(slug, from, to);
    if (!slots) return NextResponse.json({ error: 'tour_not_found' }, { status: 404 });
    return NextResponse.json({ slots }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
