/**
 * The send script's logic, with no network: a fake database and a fake Resend.
 *
 *   pnpm test:send-issue
 *
 * Every path that decides whether a real person gets an email is pinned here,
 * because the only other way to test them is to send one.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sha256hex } from '@/lib/tokens';
import { ISSUES, issueBySlug } from '@/content/newsletter';
import {
  toIssue,
  validateIssueFile,
  type IssueFile,
} from '@/lib/email/issue-file';
import { renderIssue } from '@/lib/email/issue';
import {
  IssueSendsMissing,
  sendIssue,
  idempotencyKey,
  type MailResult,
  type Mailer,
  type OutgoingEmail,
  type Recipient,
  type SendRow,
  type SendStore,
} from '@/lib/newsletter-send';

const draft = issueBySlug('2026-09')!;
const approved: IssueFile = { ...draft, status: 'approved' };

const people: Recipient[] = [
  { id: '00000000-0000-4000-8000-000000000001', email: 'a@example.com' },
  { id: '00000000-0000-4000-8000-000000000002', email: 'b@example.com' },
  { id: '00000000-0000-4000-8000-000000000003', email: 'c@example.com' },
];

interface Row extends SendRow {
  hash: string;
  designsHash?: string;
}

function fakeStore(opts: { rows?: Row[]; missing?: boolean } = {}) {
  const rows = new Map<string, Row>(
    (opts.rows ?? []).map(r => [r.subscriber_id, { ...r }])
  );
  const calls: string[] = [];
  const store: SendStore = {
    async assertReady() {
      calls.push('assertReady');
      if (opts.missing) throw new IssueSendsMissing('404 PGRST205');
    },
    async confirmedRecipients() {
      return people;
    },
    async sendsFor() {
      return [...rows.values()];
    },
    async reserve(_slug, id, hashes) {
      calls.push(`reserve ${id}`);
      if (rows.has(id)) return false;
      rows.set(id, {
        subscriber_id: id,
        resend_id: null,
        sent_at: null,
        created_at: new Date().toISOString(),
        hash: hashes.unsubscribe,
        designsHash: hashes.designs,
      });
      return true;
    },
    async markSent(_slug, r, resendId, hashes) {
      calls.push(`markSent ${r.id}`);
      const row = rows.get(r.id)!;
      row.sent_at = new Date().toISOString();
      if (resendId) row.resend_id = resendId;
      if (hashes) {
        row.hash = hashes.unsubscribe;
        row.designsHash = hashes.designs;
      }
    },
    async release(_slug, id) {
      calls.push(`release ${id}`);
      rows.delete(id);
    },
  };
  return { store, rows, calls };
}

function fakeMailer(
  script: (
    email: OutgoingEmail,
    key: string,
    n: number
  ) => MailResult = () => ({ ok: true, id: 'x' })
) {
  const sent: { email: OutgoingEmail; key: string }[] = [];
  const mailer: Mailer = {
    async send(email, key) {
      sent.push({ email, key });
      return script(email, key, sent.length);
    },
  };
  return { mailer, sent };
}

const base = {
  from: 'news@mail.dirckmulder.com',
  replyTo: 'dirck@dirckmulder.com',
  sleep: async () => {},
};
const tokenIn = (e: OutgoingEmail) =>
  decodeURIComponent(/\?t=([^>]+)>/.exec(e.headers['List-Unsubscribe'])![1]);

test('every issue file passes its own rules', () => {
  for (const f of ISSUES) assert.deepEqual(validateIssueFile(f), [], f.slug);
});

test('the rules catch a semicolon, an em dash and a thin showcase', () => {
  const bad: IssueFile = {
    ...draft,
    standfirst: 'One thing; another',
    signoff: 'Bye — Dirck',
    showcase: { ...draft.showcase, items: draft.showcase.items.slice(0, 1) },
  };
  const errors = validateIssueFile(bad).join('\n');
  assert.match(errors, /semicolon/);
  assert.match(errors, /em or en dash/);
  assert.match(errors, /showcase needs 2 to 4/);
});

test('layout: no two neighbouring sections share a shape, showcase sits last before the sign-off', () => {
  const issue = toIssue(draft, 't');
  for (let i = 1; i < issue.sections.length; i++) {
    const a = issue.sections[i - 1];
    const b = issue.sections[i];
    const shape = (s: typeof a) =>
      s.kind === 'device' ? `device-${s.side}` : s.kind;
    assert.notEqual(shape(a), shape(b), `sections ${i - 1} and ${i}`);
  }
  assert.equal(
    issue.sections[1].kind,
    'download',
    'the kit sits under the lead'
  );
  const html = renderIssue(issue);
  const showcase = html.indexOf('Made this month');
  assert.ok(
    showcase > html.indexOf(draft.items.at(-1)!.title),
    'showcase after the last item'
  );
  assert.ok(
    showcase < html.indexOf(draft.signoff.slice(0, 20)),
    'showcase before the sign-off'
  );
});

test('UTM goes on our own links only, never on the unsubscribe link', () => {
  const html = renderIssue(toIssue(draft, 'tok'));
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(m =>
    m[1].replace(/&amp;/g, '&')
  );
  const own = hrefs.filter(h => /^https:\/\/dirckmulder\.com\//.test(h));
  const outside = hrefs.filter(
    h =>
      /^https?:/.test(h) &&
      !/dirckmulder\.com/.test(h) &&
      !h.includes('fonts.googleapis')
  );
  for (const h of own) {
    if (h.includes('/api/newsletter/unsubscribe') || h.includes('/kits/')) {
      assert.ok(!h.includes('utm_'), `untagged: ${h}`);
    } else {
      assert.ok(h.includes('utm_campaign=2026-09'), `tagged: ${h}`);
    }
  }
  assert.ok(outside.length > 0);
  for (const h of outside)
    assert.ok(!h.includes('utm_'), `third party left alone: ${h}`);
});

test('dry run sends nothing, writes nothing and still works before the migration', async () => {
  const { store, calls } = fakeStore({ missing: true });
  const { mailer, sent } = fakeMailer();
  let preview = '';
  const lines: string[] = [];
  const report = await sendIssue({
    ...base,
    file: draft,
    mode: { kind: 'dry-run' },
    store,
    mailer,
    log: l => lines.push(l),
    writePreview: async html => ((preview = html), '/tmp/x.html'),
  });
  assert.equal(sent.length, 0);
  assert.deepEqual(calls, ['assertReady']);
  assert.equal(report.recipients, 3);
  assert.match(preview, /The demo that played/);
  assert.match(
    lines.join('\n'),
    /WARNING\s+portfolio\.issue_sends does not exist/
  );
});

test('--test sends exactly one marked copy and touches no table', async () => {
  const { store, calls } = fakeStore();
  const { mailer, sent } = fakeMailer();
  await sendIssue({
    ...base,
    file: draft,
    mode: { kind: 'test', to: 'me@example.com' },
    store,
    mailer,
  });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].email.to, 'me@example.com');
  assert.match(sent[0].email.subject, /^\[TEST\] /);
  assert.deepEqual(calls, []);
});

test('--send refuses a draft', async () => {
  const { store } = fakeStore();
  const { mailer, sent } = fakeMailer();
  await assert.rejects(
    sendIssue({
      ...base,
      file: draft,
      mode: { kind: 'send' },
      store,
      mailer,
      confirm: async () => '2026-09',
    }),
    /status "draft"/
  );
  assert.equal(sent.length, 0);
});

test('--send refuses when the typed slug does not match', async () => {
  const { store } = fakeStore();
  const { mailer, sent } = fakeMailer();
  await assert.rejects(
    sendIssue({
      ...base,
      file: approved,
      mode: { kind: 'send' },
      store,
      mailer,
      confirm: async () => 'yes',
    }),
    /did not match/
  );
  assert.equal(sent.length, 0);
});

test('--send fails clearly when issue_sends is missing', async () => {
  const { store } = fakeStore({ missing: true });
  const { mailer, sent } = fakeMailer();
  await assert.rejects(
    sendIssue({
      ...base,
      file: approved,
      mode: { kind: 'send' },
      store,
      mailer,
      confirm: async () => '2026-09',
    }),
    /portfolio\.issue_sends does not exist.*\n.*20260925_0001_issue_sends\.sql/
  );
  assert.equal(sent.length, 0);
});

test('--send: reserves first, one-click headers, per-person token whose hash is stored, skips who already has it', async () => {
  const { store, rows, calls } = fakeStore({
    rows: [
      {
        subscriber_id: people[0].id,
        resend_id: 'old',
        sent_at: '2026-09-30T10:00:00Z',
        created_at: '2026-09-30T10:00:00Z',
        hash: 'h',
      },
    ],
  });
  const { mailer, sent } = fakeMailer((_e, _k, n) => ({
    ok: true,
    id: `re_${n}`,
  }));
  const report = await sendIssue({
    ...base,
    file: approved,
    mode: { kind: 'send' },
    store,
    mailer,
    confirm: async () => ' 2026-09\n',
  });

  assert.equal(report.alreadySent, 1);
  assert.equal(report.sent, 2);
  assert.deepEqual(
    sent.map(s => s.email.to),
    ['b@example.com', 'c@example.com']
  );
  assert.ok(
    calls.indexOf(`reserve ${people[1].id}`) <
      calls.indexOf(`markSent ${people[1].id}`)
  );

  for (const [i, s] of sent.entries()) {
    const r = people[i + 1];
    const e = s.email;
    assert.equal(s.key, idempotencyKey('2026-09', r.id));
    assert.equal(
      e.headers['List-Unsubscribe-Post'],
      'List-Unsubscribe=One-Click'
    );
    assert.match(
      e.headers['List-Unsubscribe'],
      /^<https:\/\/dirckmulder\.com\/api\/newsletter\/unsubscribe\?t=[^>]+>$/
    );
    const token = tokenIn(e);
    assert.equal(
      rows.get(r.id)!.hash,
      sha256hex(token),
      'stored hash matches the token in the email'
    );
    assert.ok(
      e.html.includes(encodeURIComponent(token)),
      'footer link carries the same token'
    );
    const designsToken = decodeURIComponent(
      /\/designs\/2026-09\?t=([^&"]+)/.exec(e.html)![1]
    );
    assert.equal(
      rows.get(r.id)!.designsHash,
      sha256hex(designsToken),
      'stored designs hash matches the button'
    );
    assert.notEqual(
      designsToken,
      token,
      'designs token is not the unsubscribe token'
    );
    assert.ok(e.text.includes(token), 'text part carries it too');
    assert.ok(e.text.length > 500, 'text part is a real alternative');
    assert.deepEqual(
      e.tags.filter(t => t.name === 'issue' || t.name === 'subscriber_id'),
      [
        { name: 'issue', value: '2026-09' },
        { name: 'subscriber_id', value: r.id },
      ]
    );
  }
  assert.notEqual(
    tokenIn(sent[0].email),
    tokenIn(sent[1].email),
    'tokens are per person'
  );
});

test('rate limits are waited out and retried with the same key and body', async () => {
  const { store } = fakeStore();
  const waits: number[] = [];
  const { mailer, sent } = fakeMailer((_e, _k, n) =>
    n === 1
      ? { ok: false, kind: 'rate_limited', message: '429', retryAfterMs: 1000 }
      : { ok: true, id: `re_${n}` }
  );
  const report = await sendIssue({
    ...base,
    file: approved,
    mode: { kind: 'send' },
    store,
    mailer,
    confirm: async () => '2026-09',
    sleep: async ms => void waits.push(ms),
    minIntervalMs: 250,
  });
  assert.equal(report.sent, 3);
  assert.equal(sent[0].key, sent[1].key);
  assert.equal(sent[0].email.html, sent[1].email.html);
  assert.equal(waits[0], 1000);
  assert.ok(
    waits.filter(w => w === 250).length === 3,
    'paced between recipients'
  );
});

test('a reservation from a crashed run: 409 means it went out (keep the old hash), 200 means it did not (take the new one)', async () => {
  const fresh = new Date().toISOString();
  const { store, rows } = fakeStore({
    rows: [
      {
        subscriber_id: people[0].id,
        resend_id: null,
        sent_at: null,
        created_at: fresh,
        hash: 'went-out',
      },
      {
        subscriber_id: people[1].id,
        resend_id: null,
        sent_at: null,
        created_at: fresh,
        hash: 'never-sent',
      },
    ],
  });
  const { mailer, sent } = fakeMailer(e =>
    e.to === 'a@example.com'
      ? { ok: false, kind: 'conflict', message: 'invalid_idempotent_request' }
      : { ok: true, id: 're_new' }
  );
  const report = await sendIssue({
    ...base,
    file: approved,
    mode: { kind: 'send' },
    store,
    mailer,
    confirm: async () => '2026-09',
  });
  assert.equal(report.sent, 3);
  assert.equal(rows.get(people[0].id)!.hash, 'went-out');
  assert.ok(rows.get(people[0].id)!.sent_at);
  const b = sent.find(s => s.email.to === 'b@example.com')!;
  assert.equal(rows.get(people[1].id)!.hash, sha256hex(tokenIn(b.email)));
});

test("a reservation older than Resend's 24h key window is listed, not resent", async () => {
  const { store } = fakeStore({
    rows: [
      {
        subscriber_id: people[0].id,
        resend_id: null,
        sent_at: null,
        created_at: '2026-09-01T00:00:00Z',
        hash: 'h',
      },
    ],
  });
  const { mailer, sent } = fakeMailer();
  const report = await sendIssue({
    ...base,
    file: approved,
    mode: { kind: 'send' },
    store,
    mailer,
    confirm: async () => '2026-09',
    now: () => Date.parse('2026-09-03T00:00:00Z'),
  });
  assert.deepEqual(report.stale, [people[0].id]);
  assert.ok(!sent.some(s => s.email.to === 'a@example.com'));
});

test('a refused email releases its reservation so the next run can retry it', async () => {
  const { store, rows, calls } = fakeStore();
  const { mailer } = fakeMailer(e =>
    e.to === 'b@example.com'
      ? { ok: false, kind: 'rejected', message: 'validation_error' }
      : { ok: true, id: 'ok' }
  );
  const report = await sendIssue({
    ...base,
    file: approved,
    mode: { kind: 'send' },
    store,
    mailer,
    confirm: async () => '2026-09',
  });
  assert.equal(report.failed.length, 1);
  assert.ok(calls.includes(`release ${people[1].id}`));
  assert.ok(!rows.has(people[1].id));
  assert.equal(report.sent, 2);
});
