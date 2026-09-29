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
 * KIT PAGES. /kits/<id> (src/lib/kits.ts) runs on exactly this logic. Every
 * function here takes a giveaway KEY: an issue slug ('2026-09') for a designs
 * page, or 'kit:<id>' ('kit:app-demo') for a kit page. The key is what goes in
 * button_events.issue_slug and share_links.issue_slug. A kit page opens for:
 *  - the designs token of any issue that hands out that kit (one token per
 *    send unlocks every giveaway page of that issue), and
 *  - the token minted for a subscriber's welcome or "already subscribed"
 *    email, stored hashed in giveaway_tokens (src/lib/kit-access.ts).
 *
 * The logic takes its database as an argument so scripts/designs.test.ts runs
 * it without a network. src/lib/designs-db.ts is the real one.
 */

import { sha256hex } from '@/lib/tokens';
import { SITE } from '@/lib/email/theme';
import { issueBySlug, ISSUES } from '@/content/newsletter';
import type { IssueFile } from '@/lib/email/issue-file';
import { kitId, kitWithPage, type Kit } from '@/lib/kits';

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

export type ButtonPage = 'designs' | 'blog-kit' | 'kit';

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
  /** The subscriber a welcome-email kit token was minted for. */
  subscriberForKitToken(
    giveaway: string,
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

/** 'kit:app-demo' and the like: the key of a kit page. */
export const KIT_KEY_RE = /^kit:([a-z0-9-]{1,40})$/;

export const kitKey = (kit: Kit) => `kit:${kitId(kit)}`;

export type Giveaway =
  | { kind: 'designs'; key: string; file: IssueFile; zip: string }
  | {
      kind: 'kit';
      key: string;
      kit: Kit;
      zip: string;
      /** Issues that hand this kit to the list: their designs tokens open it. */
      issueSlugs: string[];
    };

/** What a giveaway key points at, or null for anything unknown. */
export function giveaway(key: string | null | undefined): Giveaway | null {
  if (!key) return null;
  const k = KIT_KEY_RE.exec(key);
  if (k) {
    const kit = kitWithPage(k[1]);
    if (!kit) return null;
    return {
      kind: 'kit',
      key,
      kit,
      zip: kit.href,
      issueSlugs: ISSUES.filter(
        f => f.kit?.kit.sourcePrefix === kit.sourcePrefix
      ).map(f => f.slug),
    };
  }
  const f = designsIssue(key);
  return f ? { kind: 'designs', key, file: f, zip: zipUrl(f) } : null;
}

/** The page a giveaway key lives on, without a token. */
export function giveawayPath(key: string): string {
  const k = KIT_KEY_RE.exec(key);
  return k ? `/kits/${k[1]}` : `/designs/${key}`;
}

/** A share id: 10 letters and digits, made in the browser per share action. */
export const SHARE_ID_RE = /^[A-Za-z0-9]{10}$/;

export function shareUrl(slug: string, shareId: string): string {
  return `${SITE}${giveawayPath(slug)}?ref=${encodeURIComponent(shareId)}`;
}

/** The cookie that keeps a subscriber's access after the token leaves the URL. */
export const cookieName = (slug: string) => {
  const k = KIT_KEY_RE.exec(slug);
  return k ? `dm_kit_${k[1]}` : `dm_designs_${slug.replace(/[^0-9-]/g, '')}`;
};

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
  const g = giveaway(slug);
  if (!token || token.length > 200 || !g) return null;
  const hash = sha256hex(token);
  let sub: { id: string; status: string } | null = null;
  if (g.kind === 'designs') {
    sub = await store.subscriberForDesignsToken(slug, hash);
  } else {
    for (const issue of g.issueSlugs) {
      sub = await store.subscriberForDesignsToken(issue, hash);
      if (sub) break;
    }
    sub ??= await store.subscriberForKitToken(g.key, hash);
  }
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
  page: KIT_KEY_RE.test(w.slug) ? 'kit' : 'designs',
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
  const g = giveaway(w.slug);
  if (!g) return { ok: false, status: 404, error: 'Nothing to download here' };
  const access = await resolveAccess(store, w.slug, w.token);
  if (!access)
    return {
      ok: false,
      status: 403,
      error:
        g.kind === 'kit' ? 'Sign up to get the kit' : 'Sign up to get the code',
    };
  if (await rateLimited(store, w.ipHash, w.now ?? Date.now())) {
    return {
      ok: false,
      status: 429,
      error: 'Too many downloads, try again in an hour',
    };
  }
  await store.recordButton(event(w, 'download', access.subscriberId));
  return { ok: true, url: g.zip };
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
  if (!giveaway(w.slug))
    return { ok: false, status: 404, error: 'Nothing to share here' };
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
  if (w.page === 'kit' && giveaway(w.slug)?.kind !== 'kit') {
    return { ok: false, status: 404, error: 'No such page' };
  }
  if (await rateLimited(store, w.ipHash, w.now ?? Date.now())) {
    return { ok: false, status: 429, error: 'Too many requests' };
  }
  const access =
    w.page === 'blog-kit' ? null : await resolveAccess(store, w.slug, w.token);
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
    slug: w.page === 'kit' || /^\d{4}-\d{2}$/.test(w.slug) ? w.slug : null,
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
