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
 * All the logic is in src/lib/newsletter-send.ts, the real database and Resend
 * client in src/lib/issue-store.ts. This file only adds the terminal.
 */

import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { issueBySlug, ISSUES } from '@/content/newsletter';
import { issueSendStore as store, resendMailer } from '@/lib/issue-store';
import { sendIssue, type Mailer, type Mode } from '@/lib/newsletter-send';

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
    'usage: pnpm send-issue <slug> [--test <email> | --send [--only <email>]]\n' +
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
  if (argv[2] === '--only') {
    if (!argv[3] || !argv[3].includes('@'))
      usage('--only needs an email address');
    mode = { kind: 'send', only: argv[3] };
  } else {
    mode = { kind: 'send' };
  }
} else if (argv[1]) {
  usage(`Unknown option ${argv[1]}`);
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
