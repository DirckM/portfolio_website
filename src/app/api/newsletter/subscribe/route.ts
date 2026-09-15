import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { dbConfigured } from '@/lib/db';
import {
  normaliseEmail,
  startSignup,
  recentSignupsFromIp,
  CONSENT_TEXT,
} from '@/lib/newsletter';
import { clientIp } from '@/lib/tokens';
import { renderShell, button, h1, p } from '@/lib/email/shell';
import { escapeHtml } from '@/lib/escape-html';

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
export async function POST(request: Request) {
  if (!dbConfigured()) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  let body: {
    email?: string;
    source?: string;
    consent?: boolean;
    website?: string;
    elapsed?: number;
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

  const result = await startSignup(email, {
    source: (body.source ?? 'unknown').slice(0, 80),
    ip,
    userAgent: request.headers.get('user-agent'),
  });

  if (!result.ok) {
    console.error('newsletter signup failed:', result.error);
    return NextResponse.json({ error: 'Could not sign up' }, { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && result.data.action !== 'nothing') {
    await sendSignupEmail(apiKey, email, result.data);
  }

  return NextResponse.json({ status: 'pending' });
}

async function sendSignupEmail(
  apiKey: string,
  email: string,
  data: { action: string; confirmToken?: string }
) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://dirckmulder.com';
  const from = process.env.NEWSLETTER_FROM_EMAIL || 'dirck@dirckmulder.com';
  const replyTo = process.env.NEWSLETTER_REPLY_TO || 'dirck@dirckmulder.com';
  const resend = new Resend(apiKey);

  const isConfirm = data.action === 'send_confirm';
  const html = isConfirm
    ? renderShell({
        preheader: 'One click and you are on the list.',
        body: [
          h1('Confirm your email'),
          p('You asked to hear what I am building. One click and you are on the list.'),
          button(`${site}/api/newsletter/confirm?t=${data.confirmToken}`, 'Confirm'),
          p(
            `<span style="color:#6b6b6b;font-size:13px;">You agreed to: ${escapeHtml(CONSENT_TEXT)}</span>`
          ),
          p(
            '<span style="color:#6b6b6b;font-size:13px;">If you did not ask for this, ignore this email and nothing happens. The link expires in three days.</span>'
          ),
        ].join(''),
      })
    : renderShell({
        preheader: 'You are already on the list.',
        body: [
          h1('You are already on the list'),
          p('Nothing to do. The next issue will land in your inbox.'),
          p(
            '<span style="color:#6b6b6b;font-size:13px;">Every issue has a one-click unsubscribe at the bottom.</span>'
          ),
        ].join(''),
      });

  const { error } = await resend.emails.send({
    from: `Dirck Mulder <${from}>`,
    to: email,
    replyTo,
    subject: isConfirm ? 'Confirm your email' : 'You are already subscribed',
    text: isConfirm
      ? `Confirm your email to get what I am building:\n${site}/api/newsletter/confirm?t=${data.confirmToken}\n\nYou agreed to: ${CONSENT_TEXT}\n\nIf you did not ask for this, ignore this email. The link expires in three days.`
      : 'You are already on the list. Nothing to do.',
    tags: [{ name: 'project', value: 'portfolio' }],
  });

  // A failed send must not fail the request. The row is already pending, so a
  // resend recovers it, and telling the user "something went wrong" after they
  // successfully signed up is worse than a missing email they can retry.
  if (error) console.error('confirm email failed:', error);
}
