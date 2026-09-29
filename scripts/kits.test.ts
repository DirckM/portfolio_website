/**
 * The /kits/<id> page: access from an issue's designs token or a welcome-email
 * token, the share link, the referral, and every email's kit button pointing
 * at the page. No network.
 *
 *   pnpm test:send-issue   (runs this file too)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sha256hex } from '@/lib/tokens';
import {
  cookieName,
  download,
  giveaway,
  pageState,
  recordButtonPress,
  recordTokenVisit,
  registerShare,
  shareUrl,
  type ButtonEvent,
  type DesignsStore,
} from '@/lib/designs';
import { KITS, kitWithPage } from '@/lib/kits';
import { issueBySlug } from '@/content/newsletter';
import { toIssue } from '@/lib/email/issue-file';
import { renderIssue, renderIssueText } from '@/lib/email/issue';
import { renderWelcome, renderWelcomeText } from '@/lib/email/welcome';
import { renderAlreadySubscribedEmail } from '@/lib/email/confirm';
import { giveawayForSource } from '@/lib/giveaways';
import { kitEmailLink, type KitTokenStore } from '@/lib/kit-access';
import { startSignup } from '@/lib/newsletter';

const KEY = 'kit:app-demo';
const ISSUE_TOKEN = 'designs-token-from-issue-2026-09';
const WELCOME_TOKEN = 'token-from-a-welcome-email';
const kit = KITS.find(k => k.sourcePrefix === KEY)!;
const who = {
  slug: KEY,
  token: ISSUE_TOKEN,
  visitorHash: 'browser-tom',
  ipHash: 'ip',
};

function fakeStore(opts: { status?: string } = {}) {
  const events: ButtonEvent[] = [];
  const links = new Map<string, { slug: string; subscriberId: string }>();
  const writes: string[] = [];
  const store: DesignsStore = {
    async subscriberForDesignsToken(slug, hash) {
      return slug === '2026-09' && hash === sha256hex(ISSUE_TOKEN)
        ? { id: 'tom', status: opts.status ?? 'confirmed' }
        : null;
    },
    async subscriberForKitToken(g, hash) {
      return g === KEY && hash === sha256hex(WELCOME_TOKEN)
        ? { id: 'ann', status: opts.status ?? 'confirmed' }
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
      links.set(l.id, { slug: l.slug, subscriberId: l.subscriberId });
      return true;
    },
    async setShareMethod() {},
    async shareLink(id) {
      return links.get(id) ?? null;
    },
    async recordVisit() {
      writes.push('visit');
    },
    async markVisitSignedUp() {},
  };
  return { store, events, links, writes };
}

test('the kit page exists for kits with a page, and nothing else', () => {
  assert.equal(kitWithPage('app-demo')?.name, 'App demo kit');
  for (const bad of [
    'nope',
    'App-Demo',
    '../app-demo',
    '',
    'app-demo-kit-17c4cf6527.zip',
  ])
    assert.equal(kitWithPage(bad), null, bad);
  assert.equal(giveaway('kit:nope'), null);
  assert.equal(giveaway(KEY)?.kind, 'kit');
  const g = giveaway(KEY);
  assert.deepEqual(
    g?.kind === 'kit' ? g.issueSlugs : null,
    ['2026-09'],
    'the September issue hands out this kit'
  );
  assert.equal(cookieName(KEY), 'dm_kit_app-demo');
  assert.equal(cookieName('2026-09'), 'dm_designs_2026-09');
});

test("the issue's kit button opens the kit page with the designs token, never the zip", () => {
  const issue = toIssue(
    issueBySlug('2026-09')!,
    'UNSUB-TOKEN',
    'DESIGNS-TOKEN'
  );
  const html = renderIssue(issue);
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(m =>
    m[1].replace(/&amp;/g, '&')
  );
  const kitButton = hrefs.find(h =>
    h.startsWith('https://dirckmulder.com/kits/app-demo?')
  );
  assert.ok(kitButton, 'no link to /kits/app-demo in the issue');
  assert.ok(kitButton!.includes('t=DESIGNS-TOKEN'));
  assert.ok(!kitButton!.includes('UNSUB-TOKEN'));
  assert.ok(
    !hrefs.some(h => h.includes(kit.fileName)),
    'the issue still links the zip directly'
  );
  const text = renderIssueText(issue);
  assert.ok(!text.includes(kit.fileName), 'the text part still links the zip');
  assert.match(text, /\/kits\/app-demo\?t=DESIGNS-TOKEN/);
});

test('an issue designs token opens the kit page and downloads directly', async () => {
  const { store, events } = fakeStore();
  assert.deepEqual(await pageState(store, KEY, ISSUE_TOKEN, null), {
    kind: 'subscriber',
  });
  const res = await download(store, who);
  assert.equal(res.ok, true);
  if (res.ok) assert.equal(res.url, kit.href);
  assert.deepEqual(
    events.map(e => [e.page, e.slug, e.kind, e.subscriberId]),
    [['kit', KEY, 'download', 'tom']]
  );
  assert.equal((await recordTokenVisit(store, who)).ok, true);
  assert.equal(events[1].kind, 'page_view_token');
  assert.equal(events[1].page, 'kit');
});

test('a welcome-email token opens the kit page too', async () => {
  const { store, events } = fakeStore();
  const res = await download(store, { ...who, token: WELCOME_TOKEN });
  assert.equal(res.ok, true);
  assert.equal(events[0].subscriberId, 'ann');
});

test('no token, a wrong token or an unconfirmed subscriber gets the form, not the file', async () => {
  for (const [token, status] of [
    [null, 'confirmed'],
    ['guess', 'confirmed'],
    [ISSUE_TOKEN, 'unsubscribed'],
    [WELCOME_TOKEN, 'pending'],
  ] as const) {
    const { store, events, writes } = fakeStore({ status });
    assert.deepEqual(await pageState(store, KEY, token, 'Abcdefgh23'), {
      kind: 'visitor',
      ref: 'Abcdefgh23',
    });
    const res = await download(store, { ...who, token });
    assert.equal(res.ok, false);
    if (!res.ok) assert.equal(res.status, 403);
    assert.equal(events.length, 0);
    assert.deepEqual(writes, []);
  }
});

test('a share link from the kit page carries only the ref', async () => {
  const { store, links } = fakeStore();
  const res = await registerShare(store, {
    ...who,
    id: 'Kit4ReC0de',
    method: 'copy',
  });
  assert.ok(res.ok);
  if (res.ok) {
    assert.equal(
      res.url,
      'https://dirckmulder.com/kits/app-demo?ref=Kit4ReC0de'
    );
    const u = new URL(res.url);
    assert.deepEqual([...u.searchParams.keys()], ['ref']);
    assert.ok(!res.url.includes(ISSUE_TOKEN));
    assert.ok(!res.url.includes(sha256hex(ISSUE_TOKEN)));
  }
  assert.deepEqual(links.get('Kit4ReC0de'), { slug: KEY, subscriberId: 'tom' });
  assert.equal(
    shareUrl(KEY, 'X'),
    'https://dirckmulder.com/kits/app-demo?ref=X'
  );
  assert.equal(
    (
      await registerShare(store, {
        ...who,
        token: null,
        id: 'Nobody000X',
        method: 'copy',
      })
    ).ok,
    false,
    'nobody without a token gets a link'
  );
});

test('kit page button presses are recorded under page kit, and only for a real kit', async () => {
  const { store, events } = fakeStore();
  await recordButtonPress(store, {
    ...who,
    token: null,
    page: 'kit',
    kind: 'form_open',
  });
  await recordButtonPress(store, { ...who, page: 'kit', kind: 'copy_success' });
  const bad = await recordButtonPress(store, {
    ...who,
    slug: 'kit:nope',
    page: 'kit',
    kind: 'form_open',
  });
  assert.equal(bad.ok, false);
  assert.deepEqual(
    events.map(e => [e.page, e.slug, e.kind, e.subscriberId]),
    [
      ['kit', KEY, 'form_open', null],
      ['kit', KEY, 'copy_success', 'tom'],
    ]
  );
});

test('a friend who signs up through a kit share link is credited to it', async () => {
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
      source: 'kit:app-demo:page',
      referredByShare: 'Kit4ReC0de',
    });
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(inserts[0].referred_by_share, 'Kit4ReC0de');
  assert.equal(
    giveawayForSource(String(inserts[0].source))?.name,
    'App demo kit'
  );
});

test('an already confirmed address gets its id back for the kit link, and the response shape is unchanged', async () => {
  process.env.PORTFOLIO_SUPABASE_URL = 'https://db.test';
  process.env.PORTFOLIO_SUPABASE_SERVICE_KEY = 'service';
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    if (!init?.method || init.method === 'GET') {
      return new Response(
        JSON.stringify([
          { id: 'sub-1', email: 'tom@example.com', status: 'confirmed' },
        ]),
        { status: 200 }
      );
    }
    return new Response('', { status: 201 });
  }) as typeof fetch;
  try {
    const res = await startSignup('tom@example.com', {
      source: 'kit:app-demo:page',
    });
    assert.ok(res.ok);
    if (res.ok) {
      assert.equal(res.data.action, 'send_already_confirmed');
      assert.equal(res.data.subscriberId, 'sub-1');
    }
  } finally {
    globalThis.fetch = realFetch;
  }
});

function tokenStore(ok = true) {
  const saved: Parameters<KitTokenStore['saveKitToken']>[0][] = [];
  const store: KitTokenStore = {
    async saveKitToken(r) {
      saved.push(r);
      return ok;
    },
  };
  return { store, saved };
}

test('the welcome email for a kit: signup links the kit page, unlocked with a stored hashed token', async () => {
  const { store, saved } = tokenStore();
  const href = await kitEmailLink(store, kit, 'sub-1', 'welcome');
  const url = new URL(href);
  assert.equal(
    url.origin + url.pathname,
    'https://dirckmulder.com/kits/app-demo'
  );
  const token = url.searchParams.get('t')!;
  assert.ok(token.length >= 32);
  assert.deepEqual(saved, [
    {
      tokenHash: sha256hex(token),
      giveaway: KEY,
      subscriberId: 'sub-1',
      emailKind: 'welcome',
    },
  ]);
  assert.ok(!JSON.stringify(saved).includes(token), 'the raw token was stored');

  const payload = {
    unsubscribeToken: 'UNSUB',
    postCount: 3,
    kit: giveawayForSource('kit:app-demo:page'),
    kitHref: href,
  };
  const html = renderWelcome(payload).replace(/&amp;/g, '&');
  assert.ok(html.includes(href), 'the welcome email does not link the page');
  assert.ok(html.includes('Get the kit'));
  assert.ok(
    !html.includes(kit.fileName),
    'the welcome email still links the zip'
  );
  assert.ok(renderWelcomeText(payload).includes(href));

  const already = renderAlreadySubscribedEmail({ kit, kitHref: href });
  assert.ok(already.html.replace(/&amp;/g, '&').includes(href));
  assert.ok(already.text.includes(href));
  assert.ok(!already.html.includes(kit.fileName));
});

test('the kit email falls back to the zip when the token cannot be stored, and designs zips are unchanged', async () => {
  const failing = tokenStore(false);
  assert.equal(
    await kitEmailLink(failing.store, kit, 'sub-1', 'welcome'),
    kit.href,
    'before the migration the email must still deliver the kit'
  );
  const none = tokenStore();
  assert.equal(await kitEmailLink(none.store, kit, null, 'welcome'), kit.href);
  const designs = giveawayForSource('designs:2026-09')!;
  assert.equal(
    await kitEmailLink(none.store, designs, 'sub-1', 'welcome'),
    designs.href
  );
  assert.equal(none.saved.length, 0);
});

test('the kit page never writes on GET', () => {
  const page = readFileSync('src/app/(library)/kits/[id]/page.tsx', 'utf8');
  assert.ok(!/designsDb\.(record|create|set|mark)/.test(page));
  assert.ok(page.includes('notFound()'), 'an unknown kit must 404');
});
