/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // En local, sunnyside.com.mx responde al servidor con su verificación anti-bots:
    // el navegador pide las fotos directo. En Vercel se optimizan normalmente.
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      { protocol: 'https', hostname: 'sunnyside.com.mx' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};
export default nextConfig;
