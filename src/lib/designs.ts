/**
 * The /designs/<slug> page behind each issue's "Get the code" button.
 *
 * Two readers arrive there:
 *  - A subscriber, from the email, with their own designs token in `?t=`. The
 *    token is checked against issue_sends (hashed, like every token here) and
 *    must belong to a CONFIRMED subscriber. They download the zip directly and
 *    can share a public link.
 *  - Anyone else, usually via that shared link with `?ref=<code>`. Same page,
 *    same designs, and the download button opens the newsletter form. The zip
 *    arrives in the welcome email after the double opt-in.
 *
 * Nothing on the page's GET writes anything. Mail scanners and link
 * prefetchers (Outlook Safe Links, Gmail's image and link proxies) open links
 * in emails by themselves, so a download or a share is only counted from a
 * POST that a click in the browser makes.
 *
 * The logic takes its database as an argument so scripts/designs.test.ts runs
 * it without a network. src/lib/designs-db.ts is the real one.
 */

import { randomBytes } from 'node:crypto';
import { sha256hex } from '@/lib/tokens';
import { SITE } from '@/lib/email/theme';
import { issueBySlug } from '@/content/newsletter';
import type { IssueFile } from '@/lib/email/issue-file';

export type DesignEventKind = 'download' | 'share';

export interface DesignsStore {
  /** The subscriber a designs token was minted for, for this issue. */
  subscriberForDesignsToken(
    slug: string,
    tokenHash: string
  ): Promise<{ id: string; status: string } | null>;
  eventsFromIpSince(ipHash: string, sinceIso: string): Promise<number>;
  recordEvent(
    slug: string,
    subscriberId: string,
    kind: DesignEventKind,
    ipHash: string | null
  ): Promise<void>;
  referralCodeFor(subscriberId: string): Promise<string | null>;
  /** False when the code is already taken. */
  createReferralCode(subscriberId: string, code: string): Promise<boolean>;
  referralCodeExists(code: string): Promise<boolean>;
}

export const MAX_EVENTS_PER_IP_PER_HOUR = 30;

/** Only issues that ship a code zip have a designs page. */
export function designsIssue(
  slug: string | null | undefined
): IssueFile | null {
  const f = issueBySlug(slug);
  return f?.showcase.designs ? f : null;
}

export function zipUrl(f: IssueFile): string {
  return `${SITE}/kits/${f.showcase.designs!.zip}`;
}

export const REF_RE = /^[A-Za-z0-9]{8,16}$/;

export function shareUrl(slug: string, code: string): string {
  return `${SITE}/designs/${slug}?ref=${encodeURIComponent(code)}`;
}

/** 10 characters from a 62-letter alphabet: about 59 bits, and short to paste. */
export function newReferralCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = randomBytes(10);
  return [...bytes].map(b => alphabet[b % alphabet.length]).join('');
}

/** The cookie that keeps a subscriber's access after the token leaves the URL. */
export const cookieName = (slug: string) =>
  `dm_designs_${slug.replace(/[^0-9-]/g, '')}`;

/**
 * Who is looking. Read-only on purpose: the page calls this on every GET, and
 * a GET must never count as anything.
 */
export async function resolveAccess(
  store: DesignsStore,
  slug: string,
  token: string | null | undefined
): Promise<{ subscriberId: string } | null> {
  if (!token || token.length > 200 || !designsIssue(slug)) return null;
  const sub = await store.subscriberForDesignsToken(slug, sha256hex(token));
  if (!sub || sub.status !== 'confirmed') return null;
  return { subscriberId: sub.id };
}

export type PageState =
  | { kind: 'subscriber' }
  | { kind: 'visitor'; ref: string | null };

export async function pageState(
  store: DesignsStore,
  slug: string,
  token: string | null | undefined,
  ref: string | null | undefined
): Promise<PageState> {
  const access = await resolveAccess(store, slug, token);
  if (access) return { kind: 'subscriber' };
  return { kind: 'visitor', ref: ref && REF_RE.test(ref) ? ref : null };
}

type ActionResult =
  | { ok: true; url: string }
  | { ok: false; status: number; error: string };

async function rateLimited(
  store: DesignsStore,
  ipHash: string | null,
  now: number
) {
  if (!ipHash) return false;
  const since = new Date(now - 3600_000).toISOString();
  return (
    (await store.eventsFromIpSince(ipHash, since)) >= MAX_EVENTS_PER_IP_PER_HOUR
  );
}

/** The download click. Records it, then hands back the zip's URL. */
export async function download(
  store: DesignsStore,
  input: {
    slug: string;
    token: string | null;
    ipHash: string | null;
    now?: number;
  }
): Promise<ActionResult> {
  const f = designsIssue(input.slug);
  if (!f) return { ok: false, status: 404, error: 'No designs for that issue' };
  const access = await resolveAccess(store, input.slug, input.token);
  if (!access)
    return { ok: false, status: 403, error: 'Sign up to get the code' };
  if (await rateLimited(store, input.ipHash, input.now ?? Date.now())) {
    return {
      ok: false,
      status: 429,
      error: 'Too many downloads, try again in an hour',
    };
  }
  await store.recordEvent(
    input.slug,
    access.subscriberId,
    'download',
    input.ipHash
  );
  return { ok: true, url: zipUrl(f) };
}

/**
 * The share click. Returns the public link, carrying the subscriber's
 * referral code and never their token.
 */
export async function share(
  store: DesignsStore,
  input: {
    slug: string;
    token: string | null;
    ipHash: string | null;
    now?: number;
    newCode?: () => string;
  }
): Promise<ActionResult> {
  if (!designsIssue(input.slug))
    return { ok: false, status: 404, error: 'No designs for that issue' };
  const access = await resolveAccess(store, input.slug, input.token);
  if (!access)
    return {
      ok: false,
      status: 403,
      error: 'Only subscribers get a share link',
    };
  if (await rateLimited(store, input.ipHash, input.now ?? Date.now())) {
    return {
      ok: false,
      status: 429,
      error: 'Too many requests, try again in an hour',
    };
  }
  let code = await store.referralCodeFor(access.subscriberId);
  for (let i = 0; !code && i < 5; i++) {
    const candidate = (input.newCode ?? newReferralCode)();
    if (await store.createReferralCode(access.subscriberId, candidate))
      code = candidate;
    // A race with a second tab can have created one meanwhile.
    else code = await store.referralCodeFor(access.subscriberId);
  }
  if (!code)
    return { ok: false, status: 500, error: 'Could not make a share link' };
  await store.recordEvent(
    input.slug,
    access.subscriberId,
    'share',
    input.ipHash
  );
  return { ok: true, url: shareUrl(input.slug, code) };
}
