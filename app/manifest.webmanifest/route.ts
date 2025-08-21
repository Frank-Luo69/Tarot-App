export const dynamic = 'force-static';

export function GET() {
  const body = {
    name: 'Tarot App',
    short_name: 'Tarot',
    start_url: '/tarot',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#111111',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
    ]
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/manifest+json; charset=utf-8' }
  });
}
