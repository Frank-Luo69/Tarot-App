export const dynamic = 'force-static';

const site = process.env.SITE_URL || 'http://localhost:3000';

export function GET() {
  const urls = ['/', '/tarot'];
  const lastmod = new Date().toISOString();
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u => `\n  <url><loc>${site}${u}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${u==='/'?0.5:0.8}</priority></url>`).join('') +
    `\n</urlset>`;
  return new Response(body, { status: 200, headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
