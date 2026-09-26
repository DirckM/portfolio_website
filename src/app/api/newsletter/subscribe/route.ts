import { NextResponse, type NextRequest } from 'next/server';
import { Resend } from 'resend';
import {
  renderConfirmEmail,
  renderAlreadySubscribedEmail,
  CONFIRM_SUBJECT,
  alreadySubject,
} from '@/lib/email/confirm';
import type { Kit } from '@/lib/kits';
import { giveawayForSource } from '@/lib/giveaways';
import { SHARE_ID_RE, VISITOR_COOKIE } from '@/lib/designs';
import { visitorHash } from '@/lib/designs-http';
import { designsDb } from '@/lib/designs-db';
import { dbConfigured } from '@/lib/db';
import {
  normaliseEmail,
  startSignup,
  recentSignupsFromIp,
} from '@/lib/newsletter';
import { clientIp } from '@/lib/tokens';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SIGNUPS_PER_IP_PER_HOUR = 3;

/**
 * Newsletter signup, step one of double opt-in.
 *
 * The response is deliberately IDENTICAL for a new address, an address already
 * pending, and an address already confirmed. Anything else turns this endpoint
 * into a membership oracle: post an address, read the response, learn whether
 * that person is on Dirck's list. That is a privacy leak about third parties,
 * not just an annoyance.
 */
export async function POST(request: NextRequest) {
  if (!dbConfigured()) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  let body: {
    email?: string;
    source?: string;
    consent?: boolean;
    website?: string;
    elapsed?: number;
    /** A share link id from a shared /designs link. Stored only if it exists. */
    ref?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Honeypot. A field no human sees and every naive bot fills. Return the
  // success shape rather than an error, so a bot learns nothing from the
  // difference and keeps believing it worked.
  if (body.website) return NextResponse.json({ status: 'pending' });

  // A human cannot read the label, type an address and submit in under a
  // second. Same silent-success treatment.
  if (typeof body.elapsed === 'number' && body.elapsed < 1200) {
    return NextResponse.json({ status: 'pending' });
  }

  const email = normaliseEmail(body.email ?? '');
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: 'Consent required' }, { status: 400 });
  }

  const ip = clientIp(request.headers);
  if (ip && (await recentSignupsFromIp(ip)) >= MAX_SIGNUPS_PER_IP_PER_HOUR) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
  }

  const source = (body.source ?? 'unknown').slice(0, 80);
  // A share link id from /designs/<slug>?ref=. Looked up, never trusted: an
  // unknown or malformed id is dropped, so the column only ever holds ids of
  // real share links, and through them, of a real sharer.
  const ref =
    typeof body.ref === 'string' &&
    SHARE_ID_RE.test(body.ref) &&
    (await designsDb.shareLink(body.ref))
      ? body.ref
      : null;
  const result = await startSignup(email, {
    source,
    ip,
    userAgent: request.headers.get('user-agent'),
    referredByShare: ref,
  });

  if (!result.ok) {
    console.error('newsletter signup failed:', result.error);
    return NextResponse.json({ error: 'Could not sign up' }, { status: 500 });
  }

  // This browser came in through that link and has now signed up. Written
  // for every outcome, so the response stays identical either way.
  const vid = request.cookies.get(VISITOR_COOKIE)?.value;
  if (ref && vid) await designsDb.markVisitSignedUp(ref, visitorHash(vid));

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && result.data.action !== 'nothing') {
    await sendSignupEmail(
      apiKey,
      email,
      result.data,
      giveawayForSource(source)
    );
  }

  // Same body whether or not a kit was asked for and whichever email went out.
  return NextResponse.json({ status: 'pending' });
}

async function sendSignupEmail(
  apiKey: string,
  email: string,
  data: { action: string; confirmToken?: string },
  kit: Kit | null
) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://dirckmulder.com';
  const from = process.env.NEWSLETTER_FROM_EMAIL || 'dirck@dirckmulder.com';
  const replyTo = process.env.NEWSLETTER_REPLY_TO || 'dirck@dirckmulder.com';
  const resend = new Resend(apiKey);

  const isConfirm = data.action === 'send_confirm';
  const { html, text } = isConfirm
    ? renderConfirmEmail({ site, confirmToken: data.confirmToken ?? '', kit })
    : renderAlreadySubscribedEmail({ kit });

  const { error } = await resend.emails.send({
    from: `Dirck Mulder <${from}>`,
    to: email,
    replyTo,
    subject: isConfirm ? CONFIRM_SUBJECT : alreadySubject(kit),
    // `html` used to be built here and then never passed, so every subscriber
    // received the plain-text half of a fully designed email. Resend accepts a
    // send with no html, which is why nothing ever errored.
    html,
    text,
    tags: [
      { name: 'project', value: 'portfolio' },
      { name: 'kind', value: isConfirm ? 'confirm' : 'already-subscribed' },
      ...(kit
        ? [
            {
              name: 'kit',
              value: kit.sourcePrefix.replace(/[^a-zA-Z0-9_-]/g, '-'),
            },
          ]
        : []),
    ],
  });

  if (error) console.error('confirm email failed:', error);
}
