'use client';

const KEY = 'ss_attr';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];

function cookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/** Captura UTM/click-id (primer contacto de la sesión) + cookies de Meta. */
export function getAttribution() {
  let utm: Record<string, string> = {};
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored) utm = JSON.parse(stored);
    const params = new URLSearchParams(window.location.search);
    let changed = false;
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) { utm[k] = v.slice(0, 200); changed = true; }
    }
    if (changed) sessionStorage.setItem(KEY, JSON.stringify(utm));
  } catch {
    /* storage no disponible */
  }
  let fbc = cookie('_fbc');
  if (!fbc && utm.fbclid) fbc = `fb.1.${Date.now()}.${utm.fbclid}`;
  return { utm, fbp: cookie('_fbp'), fbc, pageUrl: window.location.href };
}
