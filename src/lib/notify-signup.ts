/**
 * A Telegram ping to Dirck's hub bot for every newly confirmed subscriber, so he
 * sees each signup as it happens instead of querying the database.
 *
 * Only on the confirm, never on the signup: a pending address may be a typo, a
 * bot or someone who never clicks, and the list is the confirmed rows.
 *
 * FAILS OPEN. No token, a Telegram outage or a slow lookup must never delay or
 * break someone's confirmation, so every error is logged and swallowed, and the
 * request has a short timeout.
 *
 * Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, optionally TELEGRAM_THREAD_ID (a
 * forum topic). The token is the hub bot's, kept in Vercel, never in the repo.
 */

import { pgSelect } from '@/lib/db';
import { escapeHtml } from '@/lib/escape-html';

/** Where they signed up, in words. */
export function describeSource(source: string): string {
  if (source === 'newsletter-page') return 'the newsletter page';
  if (source.startsWith('post:')) return `the post ${source.slice(5)}`;
  if (source.startsWith('kit:')) return `the ${source.split(':')[1]} kit`;
  if (source.startsWith('designs:')) return `the ${source.slice(8)} designs page`;
  if (source.startsWith('modal:')) return `the pop-up on ${source.slice(6)}`;
  if (source === 'added-by-dirck' || source === 'manual-dirck') return 'added by you';
  return source;
}

async function referrerEmail(subscriberId: string): Promise<string | null> {
  const me = await pgSelect<{ referred_by_share: string | null }>(
    'subscribers',
    `select=referred_by_share&id=eq.${subscriberId}`
  );
  const share = me.ok ? me.data[0]?.referred_by_share : null;
  if (!share) return null;
  const link = await pgSelect<{ subscriber_id: string }>(
    'share_links',
    `select=subscriber_id&id=eq.${encodeURIComponent(share)}`
  );
  const by = link.ok ? link.data[0]?.subscriber_id : null;
  if (!by) return null;
  const who = await pgSelect<{ email: string }>(
    'subscribers',
    `select=email&id=eq.${by}`
  );
  return who.ok ? (who.data[0]?.email ?? null) : null;
}

export async function notifyNewSubscriber(s: {
  id: string;
  email: string;
  source: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;

  try {
    const [referrer, list] = await Promise.all([
      referrerEmail(s.id),
      pgSelect<{ id: string }>('subscribers', 'select=id&status=eq.confirmed'),
    ]);
    const lines = [
      '<b>dirckmulder.com newsletter: new subscriber</b>',
      escapeHtml(s.email),
      `Signed up via ${escapeHtml(describeSource(s.source))}`,
      ...(referrer ? [`Referred by ${escapeHtml(referrer)}`] : []),
      ...(list.ok ? [`List is now ${list.data.length} confirmed`] : []),
    ];
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        ...(process.env.TELEGRAM_THREAD_ID
          ? { message_thread_id: Number(process.env.TELEGRAM_THREAD_ID) }
          : {}),
        text: lines.join('\n'),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) console.error('signup ping failed:', res.status, await res.text());
  } catch (err) {
    console.error('signup ping failed:', err);
  }
}
