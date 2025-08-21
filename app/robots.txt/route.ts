export const dynamic = 'force-static';

export function GET() {
  const body = `User-agent: *\nAllow: /\n`;
  return new Response(body, { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
