import { NextResponse } from 'next/server';
import { pgInsert, pgPatch, pgSelect } from '@/lib/db';
import { verifySvix } from '@/lib/svix-verify';

export const runtime = 'nodejs';

/**
 * Resend delivery webhooks.
 *
 * Records SENDER-SIDE FACTS ONLY: delivered, bounced, complained, failed,
 * suppressed. Deliberately not `email.opened` or `email.clicked`.
 *
 * That is not squeamishness. Around 62% of recorded opens are Apple Mail
 * Privacy Protection prefetching images rather than a person reading, so at
 * this list size the number carries no information. Opens and clicks are also
 * access to someone else's device, which needs consent under ePrivacy Art.
 * 5(3) that this list has not asked for. Delivery events are facts about our
 * own outbound mail and carry no such question.
 *
 * This endpoint is public. The signature is the only thing between it and
 * someone writing junk rows, so it is verified BEFORE the body is parsed.
 */

const TRACKED = new Set([
  'email.sent',
  'email.delivered',
  'email.delivery_delayed',
  'email.bounced',
  'email.complained',
  'email.failed',
  'email.suppressed',
]);

/** Delivery events that should change the subscriber's own status. */
const STATUS_FROM_EVENT: Record<string, string> = {
  'email.bounced': 'bounced',
  'email.complained': 'complained',
};

export async function POST(request: Request) {
  // MUST be the raw text. Parsing to JSON and re-stringifying changes the bytes
  // and the signature will never match.
  const raw = await request.text();

  const verified = verifySvix(
    raw,
    {
      id: request.headers.get('svix-id'),
      timestamp: request.headers.get('svix-timestamp'),
      signature: request.headers.get('svix-signature'),
    },
    process.env.RESEND_WEBHOOK_SECRET
  );
  if (!verified.ok) {
    console.warn('resend webhook rejected:', verified.reason);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: {
    type?: string;
    data?: { email_id?: string; tags?: Record<string, string> };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const type = event.type ?? '';
  // Acknowledge anything we do not track. Returning an error would make Resend
  // retry seven times for an event we deliberately ignore.
  if (!TRACKED.has(type)) return NextResponse.json({ ok: true });

  const providerId = event.data?.email_id ?? null;
  // Join on tags set at send time, not on the `to` array: that is an array and
  // it is an email address we would then be indexing for no reason.
  const tags = event.data?.tags ?? {};
  const subscriberId = tags.subscriber_id ?? null;
  const issueSlug = tags.issue ?? null;

  let issueId: string | null = null;
  if (issueSlug) {
    const found = await pgSelect<{ id: string }>(
      'newsletter_issues',
      `slug=eq.${encodeURIComponent(issueSlug)}&select=id&limit=1`
    );
    if (found.ok) issueId = found.data[0]?.id ?? null;
  }

  await pgInsert(
    'email_events',
    {
      issue_id: issueId,
      subscriber_id: subscriberId,
      provider_id: providerId,
      event: type.replace(/^email\./, ''),
      meta: { type },
    },
    { returning: false }
  );

  // A bounce or a complaint takes the address out of circulation. Gmail's bulk
  // sender rules put the complaint ceiling at 0.3%, which at a hundred
  // subscribers is a single person, so this cannot wait for a manual sweep.
  const newStatus = STATUS_FROM_EVENT[type];
  if (newStatus && subscriberId) {
    await pgPatch(
      'subscribers',
      `id=eq.${subscriberId}&status=neq.unsubscribed`,
      { status: newStatus, updated_at: new Date().toISOString() }
    );
  }

  if (providerId) {
    await pgPatch(
      'newsletter_sends',
      `provider_id=eq.${encodeURIComponent(providerId)}`,
      { status: type.replace(/^email\./, ''), updated_at: new Date().toISOString() }
    );
  }

  return NextResponse.json({ ok: true });
}
