import { NextResponse, type NextRequest } from 'next/server';
import { cookieName, recordTokenVisit } from '@/lib/designs';
import { designsDb } from '@/lib/designs-db';
import { cookieOptions, jsonBody, who } from '@/lib/designs-http';

export const runtime = 'nodejs';

/**
 * A subscriber landed with ?t= from their email. This is that click, counted
 * as page_view_token, and it turns the token into an HttpOnly cookie so the
 * page can drop it from the address bar and a reload still knows them.
 * POST only, called by the page after load, never by its GET.
 */
export async function POST(request: NextRequest) {
  const body = await jsonBody<{ slug?: string; token?: string }>(request);
  if (!body)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const slug = body.slug ?? '';
  const { w, finish } = who(request, slug);
  const result = await recordTokenVisit(designsDb, {
    ...w,
    token: body.token ?? null,
  });
  if (!result.ok)
    return NextResponse.json({ ok: false }, { status: result.status });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName(slug), body.token!, cookieOptions());
  return finish(res);
}
