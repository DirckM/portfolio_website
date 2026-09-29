import { NextResponse, type NextRequest } from 'next/server';
import { download } from '@/lib/designs';
import { designsDb } from '@/lib/designs-db';
import { jsonBody, who } from '@/lib/designs-http';

export const runtime = 'nodejs';

/**
 * The download click. POST only, and there is deliberately no GET: a scanner
 * or prefetcher that follows links must never count as a download. Access
 * comes from the HttpOnly designs cookie, never from the request body.
 */
export async function POST(request: NextRequest) {
  const body = await jsonBody<{ slug?: string }>(request);
  if (!body)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const { w, finish } = who(request, body.slug ?? '');
  const result = await download(designsDb, w);
  if (!result.ok) {
    return finish(
      NextResponse.json({ error: result.error }, { status: result.status })
    );
  }
  return finish(NextResponse.json({ url: result.url }));
}
