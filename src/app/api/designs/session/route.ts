import { NextResponse, type NextRequest } from 'next/server';
import { cookieName, resolveAccess } from '@/lib/designs';
import { designsDb } from '@/lib/designs-db';

export const runtime = 'nodejs';

/**
 * Turns the `?t=` a subscriber arrived with into an HttpOnly cookie, so the
 * page can drop the token from the address bar (and from anything they copy
 * out of it) and a reload still knows who they are.
 *
 * POST only, called by the page after it has loaded. It counts nothing and
 * sends nothing, it only remembers a token that was already valid.
 */
export async function POST(request: NextRequest) {
  let body: { slug?: string; token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const slug = body.slug ?? '';
  const access = await resolveAccess(designsDb, slug, body.token);
  if (!access) return NextResponse.json({ ok: false }, { status: 403 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName(slug), body.token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
