/**
 * Request plumbing shared by the /api/designs routes: who is asking, and the
 * first-party visitor cookie.
 *
 * The visitor cookie is a random id minted on the first POST from a browser.
 * Only its salted hash is stored, so a row can say "the same browser" without
 * saying whose. It never identifies a subscriber on its own: that only comes
 * from the designs cookie, which only a valid emailed token sets.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { cookieName, VISITOR_COOKIE, type Who } from '@/lib/designs';
import { clientIp, newToken, pseudonymise } from '@/lib/tokens';

const YEAR = 60 * 60 * 24 * 365;

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: YEAR,
  };
}

/** The salted hash a visitor id is stored as. */
export const visitorHash = (visitorId: string) =>
  pseudonymise(`visitor:${visitorId}`);

/** Everything a designs action needs to know about the request. */
export function who(request: NextRequest, slug: string) {
  const existing = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId = existing && existing.length <= 64 ? existing : newToken();
  const ip = clientIp(request.headers);
  const w: Who = {
    slug,
    token: request.cookies.get(cookieName(slug))?.value ?? null,
    visitorHash: visitorHash(visitorId),
    ipHash: ip ? pseudonymise(ip) : null,
  };
  /** Attach the visitor cookie when this browser did not have one yet. */
  const finish = (res: NextResponse) => {
    if (!existing) res.cookies.set(VISITOR_COOKIE, visitorId, cookieOptions());
    return res;
  };
  return { w, finish };
}

export async function jsonBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
