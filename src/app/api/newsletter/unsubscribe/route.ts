import { NextResponse } from 'next/server';
import { unsubscribeByToken } from '@/lib/newsletter';

export const runtime = 'nodejs';

/**
 * One-click unsubscribe.
 *
 * Two methods on purpose:
 *
 * GET is the link a person clicks in the footer of an issue. It acts
 * immediately, with no confirmation step and no login. Making someone log in
 * or click twice to leave is exactly the dark pattern GDPR and Gmail's bulk
 * sender rules exist to stop.
 *
 * POST is what mail clients call themselves when they see the
 * `List-Unsubscribe-Post: List-Unsubscribe=One-Click` header, per RFC 8058.
 * Gmail and Apple Mail render their own unsubscribe button from that and never
 * open the browser. It must answer 200 even for a token it does not recognise:
 * clients treat a non-200 as a broken unsubscribe and hold it against the
 * sender's reputation.
 */
export async function GET(request: Request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const token = new URL(request.url).searchParams.get('t');

  if (token) await unsubscribeByToken(token);

  // The token rides along to the survey page so a reason can be attached
  // without that page ever holding an email address. The unsubscribe is
  // ALREADY COMMITTED by this point: the survey can only add information, it
  // can never gate or reverse leaving.
  const to = token
    ? `${site}/newsletter/unsubscribed?t=${encodeURIComponent(token)}`
    : `${site}/newsletter/unsubscribed`;

  // Always the same page. An unsubscribe that reports failure is worse than one
  // that quietly succeeded, and the person has no way to act on the difference.
  return NextResponse.redirect(to, 302);
}

export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get('t');
  if (token) await unsubscribeByToken(token);
  return new NextResponse(null, { status: 200 });
}
