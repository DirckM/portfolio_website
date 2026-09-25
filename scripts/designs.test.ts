/**
 * The /designs page logic, its tracking and the signup referral, with no
 * network.
 *
 *   pnpm test:send-issue   (runs this file too)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { sha256hex } from '@/lib/tokens';
import {
  download,
  pageState,
  recordButtonPress,
  recordShareVisit,
  recordTokenVisit,
  registerShare,
  type ButtonEvent,
  type DesignsStore,
  type ShareMethod,
} from '@/lib/designs';
import { summarise } from '@/lib/designs-stats';
import { giveawayForSource } from '@/lib/giveaways';
import { issueBySlug } from '@/content/newsletter';
import { toIssue } from '@/lib/email/issue-file';
import { renderIssue } from '@/lib/email/issue';
import { startSignup } from '@/lib/newsletter';

const SLUG = '2026-09';
const TOKEN = 'designs-token-of-tom';
const who = {
  slug: SLUG,
  token: TOKEN,
  visitorHash: 'browser-tom',
  ipHash: 'ip',
};

function fakeStore(opts: { status?: string } = {}) {
  const events: ButtonEvent[] = [];
  const links = new Map<
    string,
    { slug: string; subscriberId: string; method: ShareMethod }
  >();
  const visits = new Map<
    string,
    { share_id: string; has_signed_up: boolean }
  >();
  const writes: string[] = [];
  const store: DesignsStore = {
    async subscriberForDesignsToken(slug, hash) {
      return slug === SLUG && hash === sha256hex(TOKEN)
        ? { id: 'tom', status: opts.status ?? 'confirmed' }
        : null;
    },
    async buttonEventsFromIpSince() {
      return 0;
    },
    async recordButton(e) {
      writes.push(`button ${e.kind}`);
      events.push(e);
    },
    async createShareLink(l) {
      writes.push('share link');
      if (links.has(l.id)) return false;
      links.set(l.id, {
        slug: l.slug,
        subscriberId: l.subscriberId,
        method: l.method,
      });
      return true;
    },
    async setShareMethod(id, subscriberId, method) {
      const l = links.get(id);
      if (l && l.subscriberId === subscriberId) l.method = method;
    },
    async shareLink(id) {
      const l = links.get(id);
      return l ? { slug: l.slug, subscriberId: l.subscriberId } : null;
    },
    async recordVisit(shareId, visitorHash) {
      writes.push('visit');
      const key = `${shareId}/${visitorHash}`;
      if (!visits.has(key))
        visits.set(key, { share_id: shareId, has_signed_up: false });
    },
    async markVisitSignedUp(shareId, visitorHash) {
      visits.set(`${shareId}/${visitorHash}`, {
        share_id: shareId,
        has_signed_up: true,
      });
    },
  };
  return { store, events, links, visits, writes };
}

test('a valid token of a confirmed subscriber downloads directly, and the click is recorded to them', async () => {
  const { store, events } = fakeStore();
  const res = await download(store, who);
  assert.equal(res.ok, true);
  if (res.ok)
    assert.match(
      res.url,
      /^https:\/\/dirckmulder\.com\/kits\/showcase-2026-09-[0-9a-f]{10}\.zip$/
    );
  assert.deepEqual(
    events.map(e => [e.kind, e.subscriberId, e.page]),
    [['download', 'tom', 'designs']]
  );
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
    const res = await download(store, { ...who, token });
    assert.equal(res.ok, false);
    assert.equal(events.length, 0);
  }
});

test('the email click is the token visit, recorded from the POST', async () => {
  const { store, events } = fakeStore();
  assert.equal((await recordTokenVisit(store, who)).ok, true);
  assert.deepEqual(
    events.map(e => [e.kind, e.subscriberId]),
    [['page_view_token', 'tom']]
  );
});

test('a bare page GET never writes, and no designs route answers GET', async () => {
  const { store, writes } = fakeStore();
  assert.deepEqual(await pageState(store, SLUG, TOKEN, null), {
    kind: 'subscriber',
  });
  assert.deepEqual(await pageState(store, SLUG, null, 'Abcdefgh23'), {
    kind: 'visitor',
    ref: 'Abcdefgh23',
  });
  assert.deepEqual(writes, [], 'rendering the page wrote to the database');
  for (const route of readdirSync('src/app/api/designs')) {
    const src = readFileSync(`src/app/api/designs/${route}/route.ts`, 'utf8');
    assert.ok(
      !/export (async )?function GET/.test(src),
      `${route} must not export GET`
    );
  }
  const page = readFileSync(
    'src/app/(library)/designs/[slug]/page.tsx',
    'utf8'
  );
  assert.ok(
    !/designsDb\.(record|create|set|mark)/.test(page),
    'the page itself must not write'
  );
});

test('one share link per share action, never carrying the personal token', async () => {
  const { store, links, events } = fakeStore();
  const a = await registerShare(store, {
    ...who,
    id: 'Shr4ReC0de',
    method: 'copy',
  });
  const b = await registerShare(store, {
    ...who,
    id: 'Other0000X',
    method: 'native',
  });
  assert.ok(a.ok && b.ok);
  assert.equal(links.size, 2, 'two actions, two links');
  if (a.ok) {
    assert.equal(
      a.url,
      'https://dirckmulder.com/designs/2026-09?ref=Shr4ReC0de'
    );
    assert.ok(!a.url.includes(TOKEN) && !a.url.includes(sha256hex(TOKEN)));
  }
  assert.deepEqual(
    events.map(e => [e.kind, e.shareId]),
    [
      ['share_click', 'Shr4ReC0de'],
      ['share_click', 'Other0000X'],
    ]
  );
  // Reusing an id is refused, and nobody without a token gets a link.
  assert.equal(
    (await registerShare(store, { ...who, id: 'Shr4ReC0de', method: 'copy' }))
      .ok,
    false
  );
  assert.equal(
    (
      await registerShare(store, {
        ...who,
        token: null,
        id: 'Third0000X',
        method: 'copy',
      })
    ).ok,
    false
  );
  assert.equal(
    (await registerShare(store, { ...who, id: 'short', method: 'copy' })).ok,
    false
  );
});

test('a dismissed share sheet marks its link native_cancelled', async () => {
  const { store, links } = fakeStore();
  await registerShare(store, { ...who, id: 'Sheet0000X', method: 'native' });
  await recordButtonPress(store, {
    ...who,
    page: 'designs',
    kind: 'native_cancelled',
    shareId: 'Sheet0000X',
  });
  assert.equal(links.get('Sheet0000X')!.method, 'native_cancelled');
});

test('button presses: known kinds only, anonymous without a token, blog kit panel too', async () => {
  const { store, events } = fakeStore();
  await recordButtonPress(store, {
    ...who,
    token: null,
    page: 'designs',
    kind: 'form_open',
  });
  await recordButtonPress(store, {
    ...who,
    slug: '',
    token: null,
    page: 'blog-kit',
    kind: 'form_submit',
  });
  const bad = await recordButtonPress(store, {
    ...who,
    page: 'designs',
    kind: 'download',
  });
  assert.equal(bad.ok, false, 'download is only counted by the download route');
  assert.deepEqual(
    events.map(e => [e.page, e.slug, e.kind, e.subscriberId]),
    [
      ['designs', '2026-09', 'form_open', null],
      ['blog-kit', null, 'form_submit', null],
    ]
  );
});

test('a visit through a share link is recorded once per browser, and only for real links', async () => {
  const { store, visits } = fakeStore();
  await registerShare(store, { ...who, id: 'Shr4ReC0de', method: 'copy' });
  await recordShareVisit(store, { ref: 'Shr4ReC0de', visitorHash: 'friend-1' });
  await recordShareVisit(store, { ref: 'Shr4ReC0de', visitorHash: 'friend-1' });
  await recordShareVisit(store, { ref: 'Shr4ReC0de', visitorHash: 'friend-2' });
  assert.equal(visits.size, 2);
  assert.equal(
    (
      await recordShareVisit(store, {
        ref: 'Nope00000X',
        visitorHash: 'friend-1',
      })
    ).ok,
    false
  );
});

test('stats: a link nobody opened is listed with its sharer, opened-but-no-signup separately', () => {
  const s = summarise({
    events: [
      { kind: 'page_view_token', subscriber_id: 'tom' },
      { kind: 'page_view_token', subscriber_id: 'tom' },
      { kind: 'download', subscriber_id: 'tom' },
    ],
    links: [
      {
        id: 'Unused000X',
        subscriber_id: 'tom',
        method: 'copy',
        created_at: '2026-10-01',
      },
      {
        id: 'Opened000X',
        subscriber_id: 'tom',
        method: 'native',
        created_at: '2026-10-01',
      },
      {
        id: 'Signed000X',
        subscriber_id: 'ann',
        method: 'copy',
        created_at: '2026-10-02',
      },
    ],
    visits: [
      { share_id: 'Opened000X', has_signed_up: false },
      { share_id: 'Signed000X', has_signed_up: true },
    ],
    referred: [
      { id: 'friend', status: 'confirmed', referred_by_share: 'Signed000X' },
    ],
    emails: new Map([
      ['tom', 'tom@example.com'],
      ['ann', 'ann@example.com'],
    ]),
  });
  assert.deepEqual(s.tokenVisits, { total: 2, people: 1 });
  assert.deepEqual(s.sharesByMethod, { copy: 2, native: 1 });
  assert.deepEqual(
    s.unusedLinks.map(l => [l.id, l.email]),
    [['Unused000X', 'tom@example.com']]
  );
  assert.deepEqual(
    s.visitedNoSignup.map(l => l.id),
    ['Opened000X']
  );
  assert.deepEqual(s.referrers[0], {
    email: 'ann@example.com',
    links: 1,
    visits: 1,
    signups: 1,
    confirmed: 1,
  });
});

test('a referred signup stores the share id, and nothing when there is none', async () => {
  process.env.PORTFOLIO_SUPABASE_URL = 'https://db.test';
  process.env.PORTFOLIO_SUPABASE_SERVICE_KEY = 'service';
  const inserts: Record<string, unknown>[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    if (init?.method === 'POST' && String(url).includes('/subscribers')) {
      const row = JSON.parse(String(init.body));
      inserts.push(row);
      return new Response(JSON.stringify([{ id: 'new', ...row }]), {
        status: 201,
      });
    }
    if (init?.method === 'POST') return new Response('', { status: 201 });
    return new Response('[]', { status: 200 });
  }) as typeof fetch;
  try {
    await startSignup('friend@example.com', {
      source: 'designs:2026-09',
      referredByShare: 'Shr4ReC0de',
    });
    await startSignup('other@example.com', { source: 'newsletter-page' });
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(inserts[0].referred_by_share, 'Shr4ReC0de');
  assert.equal(inserts[0].source, 'designs:2026-09');
  assert.ok(
    !('referred_by_share' in inserts[1]),
    'no column named when there is no ref'
  );
});

test("a designs:<slug> signup gets that issue's zip in the welcome email", () => {
  const kit = giveawayForSource('designs:2026-09');
  assert.equal(kit?.name, 'September designs');
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
  assert.ok(button?.includes('t=DESIGNS-TOKEN'));
  assert.ok(!button!.includes('UNSUB-TOKEN'));
  assert.ok(button!.includes('utm_campaign=2026-09'));
});
