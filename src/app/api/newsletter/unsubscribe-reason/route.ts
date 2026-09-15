import { NextResponse } from 'next/server';
import { recordUnsubscribeReason, type UnsubscribeReason } from '@/lib/newsletter';

export const runtime = 'nodejs';

const ALLOWED: ReadonlySet<string> = new Set([
  'too_many',
  'not_relevant',
  'got_what_i_came_for',
  'dont_remember',
  'other',
]);

/**
 * Records why someone left.
 *
 * This runs strictly AFTER the unsubscribe has already been committed by the
 * GET handler, which is what keeps leaving a single click. RFC 8058 permits a
 * page on the manual path precisely because a human is present. The machine
 * POST path is a different route and is not touched by any of this.
 *
 * The unsubscribe token is the authorisation: only someone holding a link from
 * a real delivered email can write a row, which is enough to stop the endpoint
 * becoming an open form. It cannot be used to unsubscribe anyone, because that
 * already happened.
 */
export async function POST(request: Request) {
  let body: { token?: string; reason?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const reason = body.reason && ALLOWED.has(body.reason)
    ? (body.reason as UnsubscribeReason)
    : null;
  const note = body.note?.trim().slice(0, 2000) || null;

  // Nothing to say is a valid answer, and pretending otherwise would make the
  // survey feel mandatory when it is not.
  if (!reason && !note) return NextResponse.json({ ok: true });

  const res = await recordUnsubscribeReason(token, reason, note);
  if (!res.ok) {
    console.error('unsubscribe reason failed:', res.error);
    // Swallow it. The person has already unsubscribed successfully and an error
    // here would suggest otherwise.
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
