/**
 * The browser side of a giveaway page for a subscriber: the automatic
 * download and the share link. No DOM, fake POSTs.
 *
 *   pnpm test:send-issue   (runs this file too)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  requestDownload,
  sameOriginPath,
  ShareLink,
  shouldAutoDownload,
  type Post,
} from '@/lib/giveaway-client';

function fakePost(
  reply: (path: string) => Response = () => new Response('{}')
) {
  const calls: { path: string; body: Record<string, unknown> }[] = [];
  const post: Post = async (path, body) => {
    calls.push({ path, body: body as Record<string, unknown> });
    return reply(path);
  };
  return { post, calls };
}

test('the download starts on its own only for a subscriber the server accepted from an email token', () => {
  assert.equal(
    shouldAutoDownload({ state: 'subscriber', hasTokenInUrl: true }),
    true
  );
  // A reload after the token left the URL: the cookie still works, no second file.
  assert.equal(
    shouldAutoDownload({ state: 'subscriber', hasTokenInUrl: false }),
    false
  );
  // A token the server refused, or a friend: never.
  assert.equal(
    shouldAutoDownload({ state: 'visitor', hasTokenInUrl: true }),
    false
  );
  assert.equal(
    shouldAutoDownload({ state: 'visitor', hasTokenInUrl: false }),
    false
  );
});

test('the automatic download goes through the download POST, with no token or email in the body', async () => {
  const { post, calls } = fakePost(
    () =>
      new Response(
        JSON.stringify({
          url: 'https://dirckmulder.com/kits/app-demo-kit-17c4cf6527.zip',
        })
      )
  );
  const res = await requestDownload(post, 'kit:app-demo');
  assert.deepEqual(res, {
    ok: true,
    url: 'https://dirckmulder.com/kits/app-demo-kit-17c4cf6527.zip',
  });
  assert.deepEqual(calls, [
    { path: '/api/designs/download', body: { slug: 'kit:app-demo' } },
  ]);
  assert.equal(
    sameOriginPath(res.ok ? res.url : ''),
    '/kits/app-demo-kit-17c4cf6527.zip'
  );

  const refused = fakePost(
    () =>
      new Response(JSON.stringify({ error: 'Sign up to get the kit' }), {
        status: 403,
      })
  );
  assert.deepEqual(await requestDownload(refused.post, 'kit:app-demo'), {
    ok: false,
    error: 'Sign up to get the kit',
  });
});

test('the page posts, it never fetches the file behind a GET of its own', () => {
  const src = readFileSync('src/components/designs/useGiveaway.tsx', 'utf8');
  assert.ok(src.includes("method: 'POST'"));
  assert.ok(
    !/fetch\(\s*['"`]\/api\/designs\/download/.test(src),
    'download must go through post()'
  );
  assert.ok(/requestDownload\(post, slug\)/.test(src));
});

function link(post: Post, tracked: string[] = []) {
  return new ShareLink({
    post,
    slug: 'kit:app-demo',
    origin: 'https://dirckmulder.com',
    path: '/kits/app-demo',
    track: kind => tracked.push(kind),
    id: 'Kit4ReC0de',
  });
}

test('the shown share link holds only the ref, and showing it registers nothing', () => {
  const { post, calls } = fakePost();
  const l = link(post);
  assert.equal(l.url, 'https://dirckmulder.com/kits/app-demo?ref=Kit4ReC0de');
  assert.deepEqual([...new URL(l.url).searchParams.keys()], ['ref']);
  assert.equal(calls.length, 0);
  assert.equal(l.isRegistered, false);
  // A generated id has the shape the server accepts.
  const fresh = new ShareLink({
    post,
    slug: 'x',
    origin: 'o',
    path: '/p',
    track: () => {},
  });
  assert.match(fresh.id, /^[A-Za-z0-9]{10}$/);
});

test('Copy registers the link once, however often it is pressed', async () => {
  const { post, calls } = fakePost();
  const tracked: string[] = [];
  const l = link(post, tracked);
  let clipboard = '';
  assert.equal(await l.copy(async t => void (clipboard = t)), true);
  assert.equal(await l.copy(async t => void (clipboard = t)), true);
  assert.equal(clipboard, l.url);
  assert.deepEqual(calls, [
    {
      path: '/api/designs/share',
      body: { slug: 'kit:app-demo', id: 'Kit4ReC0de', method: 'copy' },
    },
  ]);
  assert.deepEqual(tracked, ['copy_success', 'copy_success']);
});

test('a failed copy registers nothing', async () => {
  const { post, calls } = fakePost();
  const tracked: string[] = [];
  const l = link(post, tracked);
  assert.equal(
    await l.copy(async () => {
      throw new Error('denied');
    }),
    false
  );
  assert.equal(calls.length, 0);
  assert.deepEqual(tracked, ['copy_failed']);
});

test('the share sheet registers the link only when it is completed', async () => {
  const cancelled = fakePost();
  const tracked: string[] = [];
  const abort = Object.assign(new Error('cancelled'), { name: 'AbortError' });
  assert.equal(
    await link(cancelled.post, tracked).share(
      async () => {
        throw abort;
      },
      't',
      'x'
    ),
    'cancelled'
  );
  assert.equal(cancelled.calls.length, 0);
  assert.deepEqual(tracked, ['native_opened', 'native_cancelled']);

  const done = fakePost();
  let shared: { url: string } | null = null;
  assert.equal(
    await link(done.post).share(async d => void (shared = d), 'Title', 'Text'),
    'completed'
  );
  assert.equal(
    shared!.url,
    'https://dirckmulder.com/kits/app-demo?ref=Kit4ReC0de'
  );
  assert.deepEqual(
    done.calls.map(c => c.body.method),
    ['native']
  );
});
