/**
 * The /designs page logic and the signup referral, with no network.
 *
 *   pnpm test:send-issue   (runs this file too)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sha256hex } from '@/lib/tokens';
import {
  download,
  pageState,
  share,
  type DesignEventKind,
  type DesignsStore,
} from '@/lib/designs';
import { giveawayForSource } from '@/lib/giveaways';
import { issueBySlug } from '@/content/newsletter';
import { toIssue } from '@/lib/email/issue-file';
import { renderIssue } from '@/lib/email/issue';
import { startSignup } from '@/lib/newsletter';

const SLUG = '2026-09';
const TOKEN = 'designs-token-of-tom';

function fakeStore(opts: { status?: string } = {}) {
  const events: { kind: DesignEventKind; subscriberId: string }[] = [];
  const codes = new Map<string, string>();
  const writes: string[] = [];
  const store: DesignsStore = {
    async subscriberForDesignsToken(slug, hash) {
      return slug === SLUG && hash === sha256hex(TOKEN)
        ? { id: 'tom', status: opts.status ?? 'confirmed' }
        : null;
    },
    async eventsFromIpSince() {
      return 0;
    },
    async recordEvent(_slug, subscriberId, kind) {
      writes.push(`event ${kind}`);
      events.push({ kind, subscriberId });
    },
    async referralCodeFor(id) {
      return [...codes.entries()].find(([, sub]) => sub === id)?.[0] ?? null;
    },
    async createReferralCode(id, code) {
      writes.push('referral');
      if (codes.has(code)) return false;
      codes.set(code, id);
      return true;
    },
    async referralCodeExists(code) {
      return codes.has(code);
    },
  };
  return { store, events, writes };
}

test('a valid token of a confirmed subscriber downloads directly and is counted once', async () => {
  const { store, events } = fakeStore();
  const res = await download(store, { slug: SLUG, token: TOKEN, ipHash: 'ip' });
  assert.equal(res.ok, true);
  if (res.ok)
    assert.match(
      res.url,
      /^https:\/\/dirckmulder\.com\/kits\/showcase-2026-09-[0-9a-f]{10}\.zip$/
    );
  assert.deepEqual(events, [{ kind: 'download', subscriberId: 'tom' }]);
});

test('no token, a wrong token or an unconfirmed subscriber gets the form, not the file', async () => {
  for (const [token, status] of [
    [null, 'confirmed'],
    ['guess', 'confirmed'],
    [TOKEN, 'unsubscribed'],
    [TOKEN, 'pending'],
  ] as const) {
    const { store, events } = fakeStore({ status });
    assert.deepEqual(await pageState(store, SLUG, token, null), {
      kind: 'visitor',
      ref: null,
    });
    const res = await download(store, { slug: SLUG, token, ipHash: null });
    assert.equal(res.ok, false);
    assert.equal(events.length, 0);
  }
});

test('the bare page GET never counts anything', async () => {
  const { store, writes } = fakeStore();
  assert.deepEqual(await pageState(store, SLUG, TOKEN, null), {
    kind: 'subscriber',
  });
  assert.deepEqual(await pageState(store, SLUG, null, 'Abcdefgh23'), {
    kind: 'visitor',
    ref: 'Abcdefgh23',
  });
  assert.deepEqual(writes, [], 'rendering the page wrote to the database');
  // And the counting routes cannot be reached by a GET at all.
  for (const route of ['download', 'share', 'session']) {
    const src = readFileSync(`src/app/api/designs/${route}/route.ts`, 'utf8');
    assert.ok(
      !/export (async )?function GET/.test(src),
      `${route} must not export GET`
    );
  }
});

test('the share link carries a referral code and never the personal token', async () => {
  const { store, events } = fakeStore();
  const res = await share(store, {
    slug: SLUG,
    token: TOKEN,
    ipHash: null,
    newCode: () => 'Shr4ReC0de',
  });
  assert.equal(res.ok, true);
  if (!res.ok) return;
  assert.equal(
    res.url,
    'https://dirckmulder.com/designs/2026-09?ref=Shr4ReC0de'
  );
  assert.ok(!res.url.includes(TOKEN) && !res.url.includes(sha256hex(TOKEN)));
  // Same code the second time: one code per subscriber.
  const again = await share(store, {
    slug: SLUG,
    token: TOKEN,
    ipHash: null,
    newCode: () => 'Other00000',
  });
  assert.ok(again.ok && again.url.endsWith('Shr4ReC0de'));
  assert.deepEqual(
    events.map(e => e.kind),
    ['share', 'share']
  );
});

test('a malformed ref never reaches the form', async () => {
  const { store } = fakeStore();
  assert.deepEqual(await pageState(store, SLUG, null, "x' or 1=1"), {
    kind: 'visitor',
    ref: null,
  });
});

test('the ref is stored on a new signup, and only when given', async () => {
  process.env.PORTFOLIO_SUPABASE_URL = 'https://db.test';
  process.env.PORTFOLIO_SUPABASE_SERVICE_KEY = 'service';
  const inserts: Record<string, unknown>[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    const u = String(url);
    if (init?.method === 'POST' && u.includes('/subscribers')) {
      const row = JSON.parse(String(init.body));
      inserts.push(row);
      return new Response(JSON.stringify([{ id: 'new', ...row }]), {
        status: 201,
      });
    }
    if (init?.method === 'POST') return new Response('', { status: 201 });
    return new Response('[]', { status: 200 }); // findByEmail: nobody yet
  }) as typeof fetch;
  try {
    await startSignup('friend@example.com', {
      source: 'designs:2026-09',
      referredBy: 'Shr4ReC0de',
    });
    await startSignup('other@example.com', { source: 'newsletter-page' });
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(inserts[0].referred_by, 'Shr4ReC0de');
  assert.equal(inserts[0].source, 'designs:2026-09');
  assert.ok(
    !('referred_by' in inserts[1]),
    'no column named when there is no ref'
  );
});

test("a designs:<slug> signup gets that issue's zip in the welcome email", () => {
  const kit = giveawayForSource('designs:2026-09');
  assert.ok(kit);
  assert.equal(kit!.name, 'September designs');
  assert.match(kit!.href, /\/kits\/showcase-2026-09-/);
  assert.equal(giveawayForSource('designs:1999-01'), null);
  assert.equal(giveawayForSource('kit:app-demo')?.name, 'App demo kit');
});

test("the email's Get the code button carries the designs token, not the unsubscribe token", () => {
  const html = renderIssue(
    toIssue(issueBySlug(SLUG)!, 'UNSUB-TOKEN', 'DESIGNS-TOKEN')
  );
  const button = /href="(https:\/\/dirckmulder\.com\/designs\/2026-09[^"]+)"/
    .exec(html)?.[1]
    .replace(/&amp;/g, '&');
  assert.ok(button, 'button present');
  assert.ok(button!.includes('t=DESIGNS-TOKEN'));
  assert.ok(!button!.includes('UNSUB-TOKEN'));
  assert.ok(button!.includes('utm_campaign=2026-09'));
});
