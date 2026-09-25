import { NextResponse, type NextRequest } from 'next/server';
import { cookieName, share } from '@/lib/designs';
import { designsDb } from '@/lib/designs-db';
import { clientIp, pseudonymise } from '@/lib/tokens';

export const runtime = 'nodejs';

/**
 * The share click on /designs/<slug>. POST only, and there is deliberately
 * no GET: a mail scanner or link prefetcher that follows links must never be
 * able to count as a share. Access comes from the HttpOnly cookie the page set,
 * never from anything in the request body but the slug.
 */
export async function POST(request: NextRequest) {
  let body: { slug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const slug = body.slug ?? '';
  const ip = clientIp(request.headers);
  const result = await share(designsDb, {
    slug,
    token: request.cookies.get(cookieName(slug))?.value ?? null,
    ipHash: ip ? pseudonymise(ip) : null,
  });
  if (!result.ok)
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  return NextResponse.json({ url: result.url });
}
