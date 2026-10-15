/**
 * The real portfolio.issue_sends store and the real Resend client behind
 * src/lib/newsletter-send.ts. Shared by scripts/send-issue.ts (the whole list,
 * run by Dirck) and the confirm route (the latest issue to one new subscriber),
 * so both write the same reservation rows and nobody gets an issue twice.
 */

import { Resend } from 'resend';
import { dbConfigured, pgDelete, pgInsert, pgPatch, pgSelect } from '@/lib/db';
import { sha256hex } from '@/lib/tokens';
import {
  IssueSendsMissing,
  type Mailer,
  type SendStore,
} from '@/lib/newsletter-send';

const missingTable = (error: string, status?: number) =>
  status === 404 || /PGRST205|42P01|issue_sends/.test(error);

export const issueSendStore: SendStore = {
  async assertReady() {
    if (!dbConfigured())
      throw new Error('No Supabase URL or service key in the environment.');
    const res = await pgSelect('issue_sends', 'select=issue_slug&limit=1');
    if (!res.ok) {
      if (missingTable(res.error, res.status))
        throw new IssueSendsMissing(res.error);
      throw new Error(`Database check failed: ${res.error}`);
    }
  },
  async confirmedRecipients() {
    const res = await pgSelect<{ id: string; email: string }>(
      'subscribers',
      'status=eq.confirmed&select=id,email&order=created_at.asc&limit=10000'
    );
    if (!res.ok) throw new Error(`Could not read subscribers: ${res.error}`);
    return res.data;
  },
  async sendsFor(s) {
    const res = await pgSelect<{
      subscriber_id: string;
      resend_id: string | null;
      sent_at: string | null;
      created_at: string;
    }>(
      'issue_sends',
      `issue_slug=eq.${encodeURIComponent(s)}&select=subscriber_id,resend_id,sent_at,created_at&limit=10000`
    );
    if (!res.ok) throw new Error(`Could not read issue_sends: ${res.error}`);
    return res.data;
  },
  async reserve(s, subscriberId, hashes) {
    const res = await pgInsert(
      'issue_sends',
      {
        issue_slug: s,
        subscriber_id: subscriberId,
        unsubscribe_token_hash: hashes.unsubscribe,
        designs_token_hash: hashes.designs,
      },
      { returning: false }
    );
    if (res.ok) return true;
    if (res.status === 409) return false; // unique (issue_slug, subscriber_id): another run has it
    throw new Error(`Could not reserve ${subscriberId}: ${res.error}`);
  },
  async markSent(s, r, resendId, hashes) {
    const now = new Date().toISOString();
    const res = await pgPatch(
      'issue_sends',
      `issue_slug=eq.${encodeURIComponent(s)}&subscriber_id=eq.${r.id}`,
      {
        sent_at: now,
        ...(resendId ? { resend_id: resendId } : {}),
        ...(hashes
          ? {
              unsubscribe_token_hash: hashes.unsubscribe,
              designs_token_hash: hashes.designs,
            }
          : {}),
      }
    );
    // The email is out at this point. A failed bookkeeping write is loud, but it
    // must not stop the run and leave everybody after this person unsent.
    if (!res.ok)
      console.error(
        `  WARNING: sent to ${r.id} but could not mark it: ${res.error}`
      );
    await pgPatch('subscribers', `id=eq.${r.id}`, { last_sent_at: now });
    await pgInsert(
      'subscriber_events',
      {
        subscriber_id: r.id,
        email_hash: sha256hex(r.email),
        event: 'issue_sent',
        meta: { issue: s, resend_id: resendId },
      },
      { returning: false }
    );
  },
  async release(s, subscriberId) {
    await pgDelete(
      'issue_sends',
      `issue_slug=eq.${encodeURIComponent(s)}&subscriber_id=eq.${subscriberId}&sent_at=is.null`
    );
  },
};

export function resendMailer(apiKey: string): Mailer {
  const resend = new Resend(apiKey);
  return {
    async send(email, idempotencyKey) {
      try {
        const res = await resend.emails.send(email, { idempotencyKey });
        if (res.data) return { ok: true, id: res.data.id };
        const e = res.error!;
        const retryAfter = Number(res.headers?.['retry-after']);
        const retryAfterMs =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : undefined;
        if (e.name === 'rate_limit_exceeded' || e.statusCode === 429) {
          return {
            ok: false,
            kind: 'rate_limited',
            message: e.message,
            retryAfterMs,
          };
        }
        if (e.name === 'invalid_idempotent_request')
          return { ok: false, kind: 'conflict', message: e.message };
        if (
          e.name === 'concurrent_idempotent_requests' ||
          e.name === 'application_error' ||
          e.name === 'internal_server_error' ||
          e.statusCode === null ||
          e.statusCode >= 500
        ) {
          return {
            ok: false,
            kind: 'transient',
            message: e.message,
            retryAfterMs,
          };
        }
        return {
          ok: false,
          kind: 'rejected',
          message: `${e.name}: ${e.message}`,
        };
      } catch (err) {
        // A network error: the request may or may not have landed. Retrying
        // with the same key and body is exactly what the key is for.
        return {
          ok: false,
          kind: 'transient',
          message: err instanceof Error ? err.message : String(err),
        };
      }
    },
  };
}
