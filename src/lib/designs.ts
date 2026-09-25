/**
 * The /designs/<slug> page behind each issue's "Get the code" button.
 *
 * Two readers arrive there:
 *  - A subscriber, from the email, with their own designs token in `?t=`. The
 *    token is checked against issue_sends (hashed, like every token here) and
 *    must belong to a CONFIRMED subscriber. They download the zip directly and
 *    can share a public link.
 *  - Anyone else, usually via a shared link with `?ref=<share id>`. Same page,
 *    same designs, and the download button opens the newsletter form. The zip
 *    arrives in the welcome email after the double opt-in.
 *
 * TRACKING. Every button press is a row in button_events, every share action
 * gets its own share_links row (so a copied link that is never opened shows up
 * as exactly that), and a visit through a link is a share_visits row per
 * browser. Nothing on a page's GET writes anything: mail scanners and link
 * prefetchers (Outlook Safe Links, Gmail's proxies) open links in emails by
 * themselves, so every write here comes from a POST a click in the browser
 * makes.
 *
 * The logic takes its database as an argument so scripts/designs.test.ts runs
 * it without a network. src/lib/designs-db.ts is the real one.
 */

import { sha256hex } from '@/lib/tokens';
import { SITE } from '@/lib/email/theme';
import { issueBySlug } from '@/content/newsletter';
import type { IssueFile } from '@/lib/email/issue-file';

export type ButtonKind =
  | 'page_view_token'
  | 'download'
  | 'share_click'
  | 'copy_success'
  | 'copy_failed'
  | 'native_opened'
  | 'native_completed'
  | 'native_cancelled'
  | 'form_open'
  | 'form_submit';

export type ButtonPage = 'designs' | 'blog-kit';

export interface ButtonEvent {
  page: ButtonPage;
  slug: string | null;
  kind: ButtonKind;
  subscriberId: string | null;
  shareId: string | null;
  visitorHash: string | null;
  ipHash: string | null;
}

export type ShareMethod = 'copy' | 'native' | 'native_cancelled';

export interface DesignsStore {
  /** The subscriber a designs token was minted for, for this issue. */
  subscriberForDesignsToken(
    slug: string,
    tokenHash: string
  ): Promise<{ id: string; status: string } | null>;
  buttonEventsFromIpSince(ipHash: string, sinceIso: string): Promise<number>;
  recordButton(e: ButtonEvent): Promise<void>;
  /** False when the id is taken or the insert failed. */
  createShareLink(link: {
    id: string;
    slug: string;
    subscriberId: string;
    method: ShareMethod;
  }): Promise<boolean>;
  setShareMethod(
    id: string,
    subscriberId: string,
    method: ShareMethod
  ): Promise<void>;
  shareLink(id: string): Promise<{ slug: string; subscriberId: string } | null>;
  /** Idempotent per (share, browser). */
  recordVisit(shareId: string, visitorHash: string): Promise<void>;
  markVisitSignedUp(shareId: string, visitorHash: string): Promise<void>;
}

export const MAX_EVENTS_PER_IP_PER_HOUR = 60;

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

/** A share id: 10 letters and digits, made in the browser per share action. */
export const SHARE_ID_RE = /^[A-Za-z0-9]{10}$/;

export function shareUrl(slug: string, shareId: string): string {
  return `${SITE}/designs/${slug}?ref=${encodeURIComponent(shareId)}`;
}

/** The cookie that keeps a subscriber's access after the token leaves the URL. */
export const cookieName = (slug: string) =>
  `dm_designs_${slug.replace(/[^0-9-]/g, '')}`;

/** A random first-party id per browser, stored only as a salted hash. */
export const VISITOR_COOKIE = 'dm_vid';

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
  return { kind: 'visitor', ref: ref && SHARE_ID_RE.test(ref) ? ref : null };
}

type Result<T = object> =
  | ({ ok: true } & T)
  | { ok: false; status: number; error: string };

export interface Who {
  slug: string;
  token: string | null;
  visitorHash: string | null;
  ipHash: string | null;
  now?: number;
}

async function rateLimited(
  store: DesignsStore,
  ipHash: string | null,
  now: number
) {
  if (!ipHash) return false;
  const since = new Date(now - 3600_000).toISOString();
  return (
    (await store.buttonEventsFromIpSince(ipHash, since)) >=
    MAX_EVENTS_PER_IP_PER_HOUR
  );
}

const event = (
  w: Who,
  kind: ButtonKind,
  subscriberId: string | null,
  shareId: string | null = null
): ButtonEvent => ({
  page: 'designs',
  slug: w.slug,
  kind,
  subscriberId,
  shareId,
  visitorHash: w.visitorHash,
  ipHash: w.ipHash,
});

/** The session POST after a subscriber lands with ?t=: that visit is the email click. */
export async function recordTokenVisit(
  store: DesignsStore,
  w: Who
): Promise<Result> {
  const access = await resolveAccess(store, w.slug, w.token);
  if (!access) return { ok: false, status: 403, error: 'Not a valid link' };
  if (!(await rateLimited(store, w.ipHash, w.now ?? Date.now()))) {
    await store.recordButton(event(w, 'page_view_token', access.subscriberId));
  }
  return { ok: true };
}

/** The download click. Records it, then hands back the zip's URL. */
export async function download(
  store: DesignsStore,
  w: Who
): Promise<Result<{ url: string }>> {
  const f = designsIssue(w.slug);
  if (!f) return { ok: false, status: 404, error: 'No designs for that issue' };
  const access = await resolveAccess(store, w.slug, w.token);
  if (!access)
    return { ok: false, status: 403, error: 'Sign up to get the code' };
  if (await rateLimited(store, w.ipHash, w.now ?? Date.now())) {
    return {
      ok: false,
      status: 429,
      error: 'Too many downloads, try again in an hour',
    };
  }
  await store.recordButton(event(w, 'download', access.subscriberId));
  return { ok: true, url: zipUrl(f) };
}

/**
 * A share action. The browser made the id (so the share sheet can open inside
 * the click, before any network round trip) and this registers it: one
 * share_links row per action, tied to the subscriber, never carrying their
 * token.
 */
export async function registerShare(
  store: DesignsStore,
  w: Who & { id: string; method: 'copy' | 'native' }
): Promise<Result<{ url: string }>> {
  if (!designsIssue(w.slug))
    return { ok: false, status: 404, error: 'No designs for that issue' };
  if (!SHARE_ID_RE.test(w.id))
    return { ok: false, status: 400, error: 'Bad share id' };
  const access = await resolveAccess(store, w.slug, w.token);
  if (!access)
    return {
      ok: false,
      status: 403,
      error: 'Only subscribers get a share link',
    };
  if (await rateLimited(store, w.ipHash, w.now ?? Date.now())) {
    return {
      ok: false,
      status: 429,
      error: 'Too many requests, try again in an hour',
    };
  }
  const created = await store.createShareLink({
    id: w.id,
    slug: w.slug,
    subscriberId: access.subscriberId,
    method: w.method,
  });
  if (!created)
    return { ok: false, status: 409, error: 'Could not register that link' };
  await store.recordButton(event(w, 'share_click', access.subscriberId, w.id));
  return { ok: true, url: shareUrl(w.slug, w.id) };
}

/** Kinds the page may report on its own, after a click. */
export const CLIENT_KINDS: ReadonlySet<ButtonKind> = new Set<ButtonKind>([
  'copy_success',
  'copy_failed',
  'native_opened',
  'native_completed',
  'native_cancelled',
  'form_open',
  'form_submit',
]);

/**
 * Any other button press. A dismissed share sheet also marks its link as
 * 'native_cancelled', since that link most likely went nowhere.
 */
export async function recordButtonPress(
  store: DesignsStore,
  w: Who & { page: ButtonPage; kind: ButtonKind; shareId?: string | null }
): Promise<Result> {
  if (!CLIENT_KINDS.has(w.kind))
    return { ok: false, status: 400, error: 'Unknown button' };
  if (w.page === 'designs' && !designsIssue(w.slug)) {
    return { ok: false, status: 404, error: 'No such page' };
  }
  if (await rateLimited(store, w.ipHash, w.now ?? Date.now())) {
    return { ok: false, status: 429, error: 'Too many requests' };
  }
  const access =
    w.page === 'designs' ? await resolveAccess(store, w.slug, w.token) : null;
  const shareId = w.shareId && SHARE_ID_RE.test(w.shareId) ? w.shareId : null;
  if (w.kind === 'native_cancelled' && shareId && access) {
    await store.setShareMethod(
      shareId,
      access.subscriberId,
      'native_cancelled'
    );
  }
  await store.recordButton({
    ...event(w, w.kind, access?.subscriberId ?? null, shareId),
    page: w.page,
    slug: /^\d{4}-\d{2}$/.test(w.slug) ? w.slug : null,
  });
  return { ok: true };
}

/** A visit through a share link, reported by the page after it loaded. */
export async function recordShareVisit(
  store: DesignsStore,
  input: { ref: string; visitorHash: string | null }
): Promise<Result> {
  if (!SHARE_ID_RE.test(input.ref) || !input.visitorHash) {
    return { ok: false, status: 400, error: 'Bad visit' };
  }
  if (!(await store.shareLink(input.ref)))
    return { ok: false, status: 404, error: 'Unknown link' };
  await store.recordVisit(input.ref, input.visitorHash);
  return { ok: true };
}
