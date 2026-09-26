/**
 * Sending a newsletter issue to the list. The logic only: the database and
 * Resend are passed in, so scripts/send-issue.test.ts can run every path
 * without a network, and scripts/send-issue.ts wires in the real ones.
 *
 * THE UNSUBSCRIBE TOKEN. Tokens are stored as sha256 only, so the token that
 * went into someone's welcome email cannot be read back. Rotating
 * subscribers.unsubscribe_token_hash would kill the unsubscribe link in every
 * email they already have, which the schema forbids for good reason. So every
 * issue send mints its own token and stores its hash on that send's row in
 * portfolio.issue_sends. unsubscribeByToken() checks the subscriber row first
 * and the send rows second, so every link ever sent keeps working.
 *
 * IDEMPOTENCY, in two layers:
 *  1. A row per (issue, subscriber) is reserved BEFORE the send and marked
 *     sent after. A re-run skips every row with sent_at set.
 *  2. Each send carries the Resend idempotency key `issue/<slug>/<subscriber>`.
 *     A row that was reserved but never marked (the script died mid-send) is
 *     retried with the same key and a NEW token. Resend answers 409
 *     invalid_idempotent_request when that key already sent a different body,
 *     which proves the first attempt went out: the row is marked sent and the
 *     original token hash is kept. A 200 proves it never went out: the row takes
 *     the new token's hash. Resend keeps keys for 24 hours, so a reserved row
 *     older than 23 hours is not retried automatically. It is listed instead.
 */

import { newToken, sha256hex } from '@/lib/tokens';
import { renderIssue, renderIssueText } from '@/lib/email/issue';
import {
  toIssue,
  validateIssueFile,
  type IssueFile,
} from '@/lib/email/issue-file';
import { SITE } from '@/lib/email/theme';

export interface Recipient {
  id: string;
  email: string;
}

export interface SendRow {
  subscriber_id: string;
  resend_id: string | null;
  sent_at: string | null;
  created_at: string;
}

/** Thrown when portfolio.issue_sends does not exist yet. */
export class IssueSendsMissing extends Error {
  constructor(detail: string) {
    super(
      'The table portfolio.issue_sends does not exist, so this send cannot be made idempotent.\n' +
        'Apply supabase/migrations/20260925_0001_issue_sends.sql first (Supabase SQL editor or the hub-db skill).\n' +
        `Database said: ${detail}`
    );
    this.name = 'IssueSendsMissing';
  }
}

/**
 * The two per-send tokens, hashed. `unsubscribe` is the footer link and the
 * List-Unsubscribe header. `designs` is the "Get the code" button. Separate,
 * so a forwarded or scanned designs link can never take anyone off the list.
 */
export interface TokenHashes {
  unsubscribe: string;
  designs: string;
}

export interface SendStore {
  /** Throws IssueSendsMissing when the table is not there. */
  assertReady(): Promise<void>;
  confirmedRecipients(): Promise<Recipient[]>;
  sendsFor(slug: string): Promise<SendRow[]>;
  /** Insert the reservation. False when the row already exists (a parallel run). */
  reserve(
    slug: string,
    subscriberId: string,
    hashes: TokenHashes
  ): Promise<boolean>;
  /** Set resend_id and sent_at. New token hashes replace the reserved ones when given. */
  markSent(
    slug: string,
    recipient: Recipient,
    resendId: string | null,
    hashes?: TokenHashes
  ): Promise<void>;
  /** Drop a reservation after Resend definitely refused the email. */
  release(slug: string, subscriberId: string): Promise<void>;
}

export interface OutgoingEmail {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
  headers: Record<string, string>;
  tags: { name: string; value: string }[];
}

export type MailResult =
  | { ok: true; id: string }
  | {
      ok: false;
      /**
       * rate_limited and transient are retried with the same body. conflict
       * means this key already sent a different body. rejected is final.
       */
      kind: 'rate_limited' | 'transient' | 'conflict' | 'rejected';
      message: string;
      retryAfterMs?: number;
    };

export interface Mailer {
  send(email: OutgoingEmail, idempotencyKey: string): Promise<MailResult>;
}

export type Mode =
  | { kind: 'dry-run' }
  | { kind: 'test'; to: string }
  | { kind: 'send' };

export interface SendOptions {
  file: IssueFile;
  mode: Mode;
  store: SendStore;
  mailer: Mailer;
  from: string;
  replyTo: string;
  /** Asked before a real send. Must return the slug, typed. */
  confirm?: (question: string) => Promise<string>;
  log?: (line: string) => void;
  /** Minimum gap between two sends. Resend allows 10 requests/s per team. */
  minIntervalMs?: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  /** Where the dry run writes the rendered HTML. */
  writePreview?: (html: string, text: string) => Promise<string>;
}

export interface SendReport {
  recipients: number;
  alreadySent: number;
  sent: number;
  failed: { subscriberId: string; reason: string }[];
  /** Reserved over 23 hours ago and never confirmed: check Resend by hand. */
  stale: string[];
  previewPath?: string;
}

const STALE_MS = 23 * 3600_000;
const MAX_ATTEMPTS = 5;

export const idempotencyKey = (slug: string, subscriberId: string) =>
  `issue/${slug}/${subscriberId}`;

export function unsubscribeUrl(token: string): string {
  return `${SITE}/api/newsletter/unsubscribe?t=${encodeURIComponent(token)}`;
}

/**
 * The one email, for one person. The List-Unsubscribe pair is what Gmail and
 * Apple Mail turn into their own unsubscribe button (RFC 2369 + RFC 8058); the
 * POST it triggers lands on the same route as the footer link, which answers a
 * bare 200.
 */
export function buildEmail(
  file: IssueFile,
  to: string,
  token: string,
  from: string,
  replyTo: string,
  subscriberId?: string,
  designsToken?: string
): OutgoingEmail {
  const issue = toIssue(file, token, designsToken);
  return {
    from: `Dirck Mulder <${from}>`,
    to,
    replyTo,
    subject: file.subject,
    html: renderIssue(issue),
    text: renderIssueText(issue),
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl(token)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    // The delivery webhook joins on these two tags (issue, subscriber_id).
    tags: [
      { name: 'project', value: 'portfolio' },
      { name: 'kind', value: 'issue' },
      { name: 'issue', value: file.slug },
      ...(subscriberId ? [{ name: 'subscriber_id', value: subscriberId }] : []),
    ],
  };
}

async function sendWithRetry(
  mailer: Mailer,
  email: OutgoingEmail,
  key: string,
  sleep: (ms: number) => Promise<void>,
  log: (l: string) => void
): Promise<MailResult> {
  let last: MailResult = {
    ok: false,
    kind: 'transient',
    message: 'not attempted',
  };
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    last = await mailer.send(email, key);
    if (last.ok || last.kind === 'conflict' || last.kind === 'rejected')
      return last;
    const wait = last.retryAfterMs ?? 1000 * 2 ** (attempt - 1);
    log(`  ${last.kind} (${last.message}), retrying in ${wait} ms`);
    await sleep(wait);
  }
  return last;
}

export async function sendIssue(o: SendOptions): Promise<SendReport> {
  const log = o.log ?? (() => {});
  const sleep = o.sleep ?? (ms => new Promise(r => setTimeout(r, ms)));
  const now = o.now ?? Date.now;
  const gap = o.minIntervalMs ?? 250;
  const { file } = o;

  const problems = validateIssueFile(file);
  if (problems.length) {
    throw new Error(
      `Issue ${file.slug} breaks its own rules:\n  ${problems.join('\n  ')}`
    );
  }

  const report: SendReport = {
    recipients: 0,
    alreadySent: 0,
    sent: 0,
    failed: [],
    stale: [],
  };

  // ---------------------------------------------------------------- test send
  // One copy to one address. No database writes, so it cannot mark anybody as
  // having received the issue, and the unsubscribe link in it is a dummy.
  if (o.mode.kind === 'test') {
    const email = buildEmail(
      file,
      o.mode.to,
      'test_send_token_not_real',
      o.from,
      o.replyTo
    );
    email.subject = `[TEST] ${email.subject}`;
    const res = await sendWithRetry(
      o.mailer,
      email,
      `issue-test/${file.slug}/${now()}`,
      sleep,
      log
    );
    if (!res.ok) throw new Error(`Test send failed: ${res.message}`);
    log(`Test copy sent to ${o.mode.to} (Resend id ${res.id}).`);
    report.sent = 1;
    return report;
  }

  // A dry run still works before the migration is applied, so a draft can be
  // checked against the real list. A real send never does.
  let tableMissing: IssueSendsMissing | null = null;
  try {
    await o.store.assertReady();
  } catch (err) {
    if (!(err instanceof IssueSendsMissing) || o.mode.kind !== 'dry-run')
      throw err;
    tableMissing = err;
  }
  const recipients = await o.store.confirmedRecipients();
  const rows = new Map(
    (tableMissing ? [] : await o.store.sendsFor(file.slug)).map(r => [
      r.subscriber_id,
      r,
    ])
  );
  report.recipients = recipients.length;
  const todo = recipients.filter(r => !rows.get(r.id)?.sent_at);
  report.alreadySent = recipients.length - todo.length;

  // ----------------------------------------------------------------- dry run
  if (o.mode.kind === 'dry-run') {
    const sample = toIssue(file, 'dry_run_token_not_real');
    if (o.writePreview) {
      report.previewPath = await o.writePreview(
        renderIssue(sample),
        renderIssueText(sample)
      );
    }
    log(`Issue     ${file.slug} (#${file.number}), status: ${file.status}`);
    log(`Subject   ${file.subject}`);
    log(
      `List      ${recipients.length} confirmed, ${report.alreadySent} already have it, ${todo.length} would get it now`
    );
    if (report.previewPath) log(`Preview   ${report.previewPath}`);
    if (tableMissing) {
      log(
        'WARNING   portfolio.issue_sends does not exist yet. A real send will refuse to start'
      );
      log(
        '          until supabase/migrations/20260925_0001_issue_sends.sql is applied.'
      );
    }
    log('Dry run. Nothing was sent and nothing was written.');
    return report;
  }

  // -------------------------------------------------------------- real send
  if (file.status !== 'approved') {
    throw new Error(
      `Issue ${file.slug} has status "${file.status}". Only an issue with status 'approved' can go to the list. ` +
        'Set it in src/content/newsletter/' +
        file.slug +
        '.ts once the preview is signed off.'
    );
  }
  if (!o.confirm)
    throw new Error(
      'A real send needs a typed confirmation, and none was wired in.'
    );
  const typed = await o.confirm(
    `About to send "${file.subject}" to ${todo.length} people (${report.alreadySent} already have it). Type the slug ${file.slug} to go: `
  );
  if (typed.trim() !== file.slug)
    throw new Error('Confirmation did not match the slug. Nothing was sent.');

  for (const r of todo) {
    const existing = rows.get(r.id);
    const token = newToken();
    const designsToken = newToken();
    const hashes: TokenHashes = {
      unsubscribe: sha256hex(token),
      designs: sha256hex(designsToken),
    };

    if (existing) {
      // Reserved on an earlier run and never marked sent: the run died between
      // the reservation and the confirmation. See the header of this file.
      if (now() - Date.parse(existing.created_at) > STALE_MS) {
        report.stale.push(r.id);
        log(
          `  ${r.id}: reserved over 23h ago and never confirmed, skipped. Check Resend logs.`
        );
        continue;
      }
    } else if (!(await o.store.reserve(file.slug, r.id, hashes))) {
      log(`  ${r.id}: another run reserved this one, skipped`);
      continue;
    }

    const email = buildEmail(
      file,
      r.email,
      token,
      o.from,
      o.replyTo,
      r.id,
      designsToken
    );
    const res = await sendWithRetry(
      o.mailer,
      email,
      idempotencyKey(file.slug, r.id),
      sleep,
      log
    );

    if (res.ok) {
      // For a retried row the email that went out carries the NEW token, so the
      // row takes its hash. For a fresh row the hash is already the right one.
      await o.store.markSent(
        file.slug,
        r,
        res.id,
        existing ? hashes : undefined
      );
      report.sent++;
    } else if (res.kind === 'conflict') {
      // The key already sent a different body: the earlier attempt went out,
      // with the token whose hash is on the row. Keep that hash.
      await o.store.markSent(file.slug, r, null);
      report.sent++;
      log(`  ${r.id}: already delivered by an earlier attempt`);
    } else if (res.kind === 'rejected') {
      await o.store.release(file.slug, r.id);
      report.failed.push({ subscriberId: r.id, reason: res.message });
    } else {
      // Still rate limited or erroring after every retry. Leave the reservation:
      // the next run retries it under the same key.
      report.failed.push({ subscriberId: r.id, reason: res.message });
    }
    await sleep(gap);
  }

  log(
    `Done. ${report.sent} sent, ${report.alreadySent} already had it, ${report.failed.length} failed, ${report.stale.length} need a manual check.`
  );
  return report;
}
