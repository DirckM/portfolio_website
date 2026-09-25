/**
 * Send a newsletter issue. Dirck runs this on his own machine. Claude never
 * runs it with --send.
 *
 *   pnpm send-issue 2026-09                      dry run: count, subject, preview file
 *   pnpm send-issue 2026-09 --test you@example   one copy to one address, [TEST] subject
 *   pnpm send-issue 2026-09 --send               the list: status must be 'approved',
 *                                                and you type the slug to confirm
 *
 * Env, read from .env.local in the current directory and then from
 * projects-hub/.env for anything still missing: RESEND_API_KEY, the Supabase
 * URL and service key (any name src/lib/db.ts accepts), and optionally
 * NEWSLETTER_FROM_EMAIL / NEWSLETTER_REPLY_TO.
 *
 * All the logic is in src/lib/newsletter-send.ts. This file only wires the
 * real database, the real Resend client and the terminal into it.
 */

import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { Resend } from 'resend';
import { issueBySlug, ISSUES } from '@/content/newsletter';
import { dbConfigured, pgDelete, pgInsert, pgPatch, pgSelect } from '@/lib/db';
import { sha256hex } from '@/lib/tokens';
import {
  IssueSendsMissing,
  sendIssue,
  type Mailer,
  type Mode,
  type SendStore as Store,
} from '@/lib/newsletter-send';

// The database and Resend helpers read process.env when called, not when
// imported, so loading the env files here is early enough.
for (const f of [
  '.env.local',
  join(homedir(), 'Documents/Project Hub/projects-hub/.env'),
]) {
  // loadEnvFile never overrides a variable that is already set, so the first
  // file wins and the shell environment beats both.
  if (existsSync(f)) process.loadEnvFile(f);
}

function usage(msg?: string): never {
  if (msg) console.error(msg);
  console.error(
    'usage: pnpm send-issue <slug> [--test <email> | --send]\n' +
      `issues: ${ISSUES.map(i => `${i.slug} (${i.status})`).join(', ')}`
  );
  process.exit(2);
}

const argv = process.argv.slice(2);
const slug = argv[0];
const file = issueBySlug(slug);
if (!file) usage(slug ? `No issue with slug "${slug}".` : undefined);

let mode: Mode = { kind: 'dry-run' };
if (argv[1] === '--test') {
  const to = argv[2];
  if (!to || !to.includes('@')) usage('--test needs an email address');
  mode = { kind: 'test', to };
} else if (argv[1] === '--send') {
  mode = { kind: 'send' };
} else if (argv[1]) {
  usage(`Unknown option ${argv[1]}`);
}

const missingTable = (error: string, status?: number) =>
  status === 404 || /PGRST205|42P01|issue_sends/.test(error);

const store: Store = {
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

function resendMailer(apiKey: string): Mailer {
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

const apiKey = process.env.RESEND_API_KEY;
const needsResend = mode.kind !== 'dry-run';
if (needsResend && !apiKey) usage('RESEND_API_KEY is not set.');

const noMailer: Mailer = {
  async send() {
    throw new Error('The dry run tried to send an email. That is a bug.');
  },
};

async function ask(q: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await rl.question(q);
  } finally {
    rl.close();
  }
}

async function main() {
  const report = await sendIssue({
    file: file!,
    mode,
    store,
    mailer: needsResend ? resendMailer(apiKey!) : noMailer,
    from: process.env.NEWSLETTER_FROM_EMAIL || 'news@mail.dirckmulder.com',
    replyTo: process.env.NEWSLETTER_REPLY_TO || 'dirck@dirckmulder.com',
    confirm: ask,
    log: l => console.log(l),
    writePreview: async (html, text) => {
      const dir = mkdtempSync(join(tmpdir(), `issue-${file!.slug}-`));
      writeFileSync(join(dir, 'issue.txt'), text);
      const p = join(dir, 'issue.html');
      writeFileSync(p, html);
      return p;
    },
  });
  if (report.failed.length) {
    console.error('Failed:');
    for (const f of report.failed)
      console.error(`  ${f.subscriberId}: ${f.reason}`);
    process.exitCode = 1;
  }
  if (report.stale.length) process.exitCode = 1;
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
