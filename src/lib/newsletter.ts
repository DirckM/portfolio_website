/**
 * Subscriber operations. Everything that touches portfolio.subscribers lives
 * here so the invariants (lowercase email, hashed tokens, an audit event for
 * every state change) are enforced in one place rather than per route.
 */

import { pgSelect, pgInsert, pgPatch, type DbResult } from '@/lib/db';
import { newToken, sha256hex, pseudonymise } from '@/lib/tokens';

/**
 * The exact wording someone agrees to. Stored verbatim on the row, copied from
 * HERE and never from the request body, so a client cannot claim a weaker
 * consent than it actually displayed. GDPR Art. 7(1) wants proof of what was
 * agreed, not just that something was.
 *
 * Changing this text is a real event: existing rows keep the wording those
 * people saw, and only new signups get the new text.
 */
export const CONSENT_TEXT =
  'I agree to receive an occasional email from Dirck Mulder about what he is ' +
  'building. I can unsubscribe in one click from any of them.';

export const CONFIRM_TTL_HOURS = 72;

export type SubscriberStatus =
  | 'pending'
  | 'confirmed'
  | 'unsubscribed'
  | 'bounced'
  | 'complained';

export interface Subscriber {
  id: string;
  email: string;
  status: SubscriberStatus;
  source: string;
  confirmed_at: string | null;
  created_at: string;
}

export interface SignupContext {
  source: string;
  referrerPath?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

/** Append to the audit trail. Best effort: never block the user's action. */
async function logEvent(
  subscriberId: string | null,
  email: string,
  event: string,
  meta: Record<string, unknown> = {},
  ip?: string | null
): Promise<void> {
  await pgInsert(
    'subscriber_events',
    {
      subscriber_id: subscriberId,
      email_hash: sha256hex(email),
      event,
      meta,
      ip_hash: ip ? pseudonymise(ip) : null,
    },
    { returning: false }
  );
}

export function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export async function findByEmail(
  email: string
): Promise<DbResult<Subscriber | null>> {
  const res = await pgSelect<Subscriber>(
    'subscribers',
    `email=eq.${encodeURIComponent(email)}&select=id,email,status,source,confirmed_at,created_at&limit=1`
  );
  if (!res.ok) return res;
  return { ok: true, data: res.data[0] ?? null };
}

export interface SignupResult {
  /** What the caller should do next. */
  action: 'send_confirm' | 'send_already_confirmed' | 'nothing';
  confirmToken?: string;
  subscriberId?: string;
}

/**
 * Create or refresh a signup.
 *
 * Three cases, and the caller's HTTP response is identical for all of them so
 * the endpoint cannot be used to test whether an address is on the list:
 *  - unknown address  -> new pending row, send the confirmation
 *  - pending already  -> mint a fresh token, resend (rate limited by the caller)
 *  - confirmed already-> send "you are already subscribed", never a new token
 *  - unsubscribed     -> treat as a fresh signup, because they asked again
 */
export async function startSignup(
  email: string,
  ctx: SignupContext
): Promise<DbResult<SignupResult>> {
  const existing = await findByEmail(email);
  if (!existing.ok) return existing;

  const confirmToken = newToken();
  const confirmHash = sha256hex(confirmToken);
  const expires = new Date(
    Date.now() + CONFIRM_TTL_HOURS * 3600_000
  ).toISOString();

  if (existing.data && existing.data.status === 'confirmed') {
    await logEvent(existing.data.id, email, 'signup', { already: true }, ctx.ip);
    return { ok: true, data: { action: 'send_already_confirmed' } };
  }

  if (existing.data) {
    const patched = await pgPatch<Subscriber>(
      'subscribers',
      `id=eq.${existing.data.id}`,
      {
        status: 'pending',
        source: ctx.source,
        confirm_token_hash: confirmHash,
        confirm_sent_at: new Date().toISOString(),
        confirm_expires_at: expires,
        unsubscribed_at: null,
        updated_at: new Date().toISOString(),
      }
    );
    if (!patched.ok) return patched;
    await logEvent(existing.data.id, email, 'confirm_resent', {}, ctx.ip);
    return {
      ok: true,
      data: {
        action: 'send_confirm',
        confirmToken,
        subscriberId: existing.data.id,
      },
    };
  }

  const created = await pgInsert<Subscriber>('subscribers', {
    email,
    status: 'pending',
    source: ctx.source,
    referrer_path: ctx.referrerPath ?? null,
    confirm_token_hash: confirmHash,
    confirm_sent_at: new Date().toISOString(),
    confirm_expires_at: expires,
    unsubscribe_token_hash: sha256hex(newToken()),
    consent_text: CONSENT_TEXT,
    consent_ip_hash: ctx.ip ? pseudonymise(ctx.ip) : null,
    consent_user_agent: ctx.userAgent?.slice(0, 500) ?? null,
  });
  if (!created.ok) return created;

  const row = created.data[0];
  await logEvent(row.id, email, 'signup', { source: ctx.source }, ctx.ip);
  return {
    ok: true,
    data: { action: 'send_confirm', confirmToken, subscriberId: row.id },
  };
}

/**
 * Confirm a pending subscription and hand back the unsubscribe token, which is
 * minted here rather than at signup: it only has to exist once there is
 * actually mail to unsubscribe from, and this way an abandoned pending row
 * never holds a live token.
 */
export async function confirmByToken(
  token: string
): Promise<DbResult<{ email: string; unsubscribeToken: string } | null>> {
  const hash = sha256hex(token);
  const unsubscribeToken = newToken();

  // Conditional on status AND expiry, so a stale or replayed link cannot
  // resurrect an unsubscribed row, and two taps cannot both win.
  const patched = await pgPatch<{ email: string }>(
    'subscribers',
    `confirm_token_hash=eq.${hash}&status=eq.pending&confirm_expires_at=gt.${new Date().toISOString()}`,
    {
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      confirm_token_hash: null,
      unsubscribe_token_hash: sha256hex(unsubscribeToken),
      updated_at: new Date().toISOString(),
    }
  );
  if (!patched.ok) return patched;
  if (patched.data.length === 0) return { ok: true, data: null };

  const email = patched.data[0].email;
  await logEvent(null, email, 'confirmed');
  return { ok: true, data: { email, unsubscribeToken } };
}

export async function unsubscribeByToken(
  token: string
): Promise<DbResult<boolean>> {
  const patched = await pgPatch<{ email: string }>(
    'subscribers',
    `unsubscribe_token_hash=eq.${sha256hex(token)}&status=neq.unsubscribed`,
    {
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  );
  if (!patched.ok) return patched;
  if (patched.data.length > 0) {
    await logEvent(null, patched.data[0].email, 'unsubscribed');
  }
  // An already-unsubscribed token still reports success. Telling someone their
  // unsubscribe "failed" because it already worked is the worst possible
  // moment to show an error.
  return { ok: true, data: true };
}

/**
 * Cheap abuse control without a KV store: count recent signups from the same
 * hashed IP. Not airtight, and it does not need to be at this volume. It stops
 * a script filling the table, which is the actual risk.
 */
export async function recentSignupsFromIp(ip: string): Promise<number> {
  const since = new Date(Date.now() - 3600_000).toISOString();
  const res = await pgSelect<{ id: number }>(
    'subscriber_events',
    `ip_hash=eq.${pseudonymise(ip)}&event=eq.signup&created_at=gt.${since}&select=id`
  );
  return res.ok ? res.data.length : 0;
}
