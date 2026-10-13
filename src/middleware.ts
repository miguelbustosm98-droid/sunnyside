import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { defaultLocale, locales } from '@/i18n/config';

function pickLocale(request: NextRequest): string {
  const header = request.headers.get('accept-language') ?? '';
  return header.toLowerCase().startsWith('en') ? 'en' : defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Panel admin: requiere sesión (la verificación de rol admin ocurre en el layout).
  if (pathname.startsWith('/admin')) {
    const { response, user } = await updateSession(request, NextResponse.next({ request }));
    if (!user && pathname !== '/admin/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Sitio público: asegurar prefijo de idioma.
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!hasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${pickLocale(request)}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }
  const current = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ?? defaultLocale;
  const headers = new Headers(request.headers);
  headers.set('x-locale', current);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
