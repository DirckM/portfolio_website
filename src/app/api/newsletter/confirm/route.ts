import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { confirmByToken } from '@/lib/newsletter';
import { getTutorialPosts } from '@/lib/blog-utils';
import {
  renderWelcome,
  renderWelcomeText,
  welcomeSubject,
} from '@/lib/email/welcome';
import { kitForSource } from '@/lib/kits';

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
    return NextResponse.redirect(
      `${site}/newsletter/confirm-failed?reason=missing`,
      302
    );
  }

  const result = await confirmByToken(token);

  if (!result.ok) {
    console.error('confirm failed:', result.error);
    return NextResponse.redirect(
      `${site}/newsletter/confirm-failed?reason=error`,
      302
    );
  }

  // Null means the token matched nothing that was still pending and unexpired.
  // Both cases land on the same page: we cannot tell the person which it was
  // without revealing whether that address is on the list.
  if (!result.data) {
    return NextResponse.redirect(
      `${site}/newsletter/confirm-failed?reason=expired`,
      302
    );
  }

  await sendWelcome(
    result.data.email,
    result.data.unsubscribeToken,
    result.data.source
  );

  return NextResponse.redirect(`${site}/newsletter/confirmed`, 302);
}

/**
 * The welcome email, sent once, right here.
 *
 * Before this, confirming led to a redirect and then nothing until the next
 * issue, which could be a month. An address that hears nothing after opting in
 * has forgotten who you are by the time you do write.
 *
 * Failure is swallowed on purpose, exactly as in the subscribe route. The
 * person IS confirmed at this point, and bouncing them to an error page over a
 * missing greeting would undo a successful action to report a cosmetic one.
 */
async function sendWelcome(
  email: string,
  unsubscribeToken: string,
  source: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('welcome email skipped: RESEND_API_KEY is not set');
    return;
  }

  const from = process.env.NEWSLETTER_FROM_EMAIL || 'dirck@dirckmulder.com';
  const replyTo = process.env.NEWSLETTER_REPLY_TO || 'dirck@dirckmulder.com';
  const kit = kitForSource(source);
  const payload = {
    unsubscribeToken,
    postCount: getTutorialPosts().length,
    kit,
  };

  const { error } = await new Resend(apiKey).emails.send({
    from: `Dirck Mulder <${from}>`,
    to: email,
    replyTo,
    subject: welcomeSubject(kit),
    html: renderWelcome(payload),
    text: renderWelcomeText(payload),
    tags: [
      { name: 'project', value: 'portfolio' },
      { name: 'kind', value: 'welcome' },
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

  if (error) console.error('welcome email failed:', error);
}
