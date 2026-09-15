import { NextResponse } from 'next/server';
import { confirmByToken } from '@/lib/newsletter';

export const runtime = 'nodejs';

/**
 * Step two of double opt-in.
 *
 * A GET that changes state, which is normally wrong, but a confirmation link in
 * an email has no other shape available. It is safe here because the action is
 * idempotent and strictly additive: the worst a link scanner can do is confirm
 * a subscription the person already asked for. That is not true of the send
 * approval endpoint, which is why that one is built completely differently.
 *
 * Redirects rather than rendering, so the address bar ends up on a real page
 * the person can bookmark, share or navigate from.
 */
export async function GET(request: Request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const token = new URL(request.url).searchParams.get('t');

  if (!token) {
    return NextResponse.redirect(`${site}/newsletter/confirm-failed?reason=missing`, 302);
  }

  const result = await confirmByToken(token);

  if (!result.ok) {
    console.error('confirm failed:', result.error);
    return NextResponse.redirect(`${site}/newsletter/confirm-failed?reason=error`, 302);
  }

  // Null means the token matched nothing that was still pending and unexpired.
  // Both cases land on the same page: we cannot tell the person which it was
  // without revealing whether that address is on the list.
  if (!result.data) {
    return NextResponse.redirect(`${site}/newsletter/confirm-failed?reason=expired`, 302);
  }

  return NextResponse.redirect(`${site}/newsletter/confirmed`, 302);
}
