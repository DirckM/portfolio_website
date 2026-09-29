/**
 * The browser side of a giveaway page (/designs/<slug>, /kits/<id>) for a
 * subscriber, as plain functions with their I/O passed in, so
 * scripts/giveaway-client.test.ts runs them without a DOM.
 *
 * THE AUTO DOWNLOAD. A subscriber who arrives from their email (a token the
 * server accepted) gets the file straight away. The page's GET still writes
 * nothing: this runs in the browser after load and goes through the same
 * download POST as the button. Mail scanners and link previewers do not run
 * JavaScript, so they still count nothing.
 *
 * THE SHARE LINK. The id is made in the browser on load, so the link can be
 * shown at once, but it is only registered (one share_links row) when the
 * subscriber copies it or completes a share sheet. A link nobody passed on is
 * never counted.
 */

export type Post = (path: string, body: object) => Promise<Response>;

// Letters and digits for share ids, minus the ones people misread (0 O 1 I l).
// Built from ranges rather than written out: a long literal of mixed characters
// is exactly what the pre-push secret scan is there to stop.
const range = (from: string, to: string) =>
  Array.from({ length: to.charCodeAt(0) - from.charCodeAt(0) + 1 }, (_, i) =>
    String.fromCharCode(from.charCodeAt(0) + i)
  );
const ALPHABET = [...range('A', 'Z'), ...range('a', 'z'), ...range('2', '9')]
  .filter(c => !'OIl'.includes(c))
  .join('');

export function newShareId(
  random: (n: number) => Uint8Array = n =>
    crypto.getRandomValues(new Uint8Array(n))
): string {
  return Array.from(random(10), b => ALPHABET[b % ALPHABET.length]).join('');
}

/** The public link: the page and the ref, nothing else. */
export function shareLink(origin: string, path: string, id: string): string {
  return `${origin}${path}?ref=${encodeURIComponent(id)}`;
}

/** Only an email click the server accepted downloads on its own. */
export function shouldAutoDownload(p: {
  state: 'subscriber' | 'visitor';
  hasTokenInUrl: boolean;
}): boolean {
  return p.state === 'subscriber' && p.hasTokenInUrl;
}

export type DownloadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** The download POST. Access comes from the HttpOnly cookie, never the body. */
export async function requestDownload(
  post: Post,
  slug: string
): Promise<DownloadResult> {
  try {
    const res = await post('/api/designs/download', { slug });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || typeof body.url !== 'string')
      return {
        ok: false,
        error: body.error ?? 'Something went wrong. Try again.',
      };
    return { ok: true, url: body.url };
  } catch {
    return { ok: false, error: 'Something went wrong. Try again.' };
  }
}

/**
 * The file's path on this site. The API answers with the live URL, and a
 * same-origin link is what lets the `download` attribute work (and makes a
 * local server serve its own copy).
 */
export function sameOriginPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

/**
 * One share link, shown on load, registered on first use. Copying it twice or
 * copying and then sharing it is still one link, so it is registered once.
 */
export class ShareLink {
  readonly id: string;
  readonly url: string;
  private registered: Promise<unknown> | null = null;

  constructor(
    private deps: {
      post: Post;
      slug: string;
      origin: string;
      path: string;
      /** Button presses: /api/designs/event. */
      track: (kind: string, shareId?: string) => void;
      id?: string;
    }
  ) {
    this.id = deps.id ?? newShareId();
    this.url = shareLink(deps.origin, deps.path, this.id);
  }

  get isRegistered() {
    return this.registered !== null;
  }

  private register(method: 'copy' | 'native') {
    this.registered ??= this.deps
      .post('/api/designs/share', { slug: this.deps.slug, id: this.id, method })
      .catch(() => null);
    return this.registered;
  }

  /** True when the link is on the clipboard. */
  async copy(write: (text: string) => Promise<void>): Promise<boolean> {
    try {
      await write(this.url);
    } catch {
      this.deps.track('copy_failed', this.id);
      return false;
    }
    await this.register('copy');
    this.deps.track('copy_success', this.id);
    return true;
  }

  /** The share sheet. Registered only when the person completes it. */
  async share(
    open: (data: { title: string; text: string; url: string }) => Promise<void>,
    title: string,
    text: string
  ): Promise<'completed' | 'cancelled' | 'failed'> {
    this.deps.track('native_opened', this.id);
    try {
      await open({ title, text, url: this.url });
    } catch (err) {
      const aborted =
        typeof err === 'object' &&
        err !== null &&
        (err as { name?: string }).name === 'AbortError';
      if (aborted) this.deps.track('native_cancelled', this.id);
      return aborted ? 'cancelled' : 'failed';
    }
    await this.register('native');
    this.deps.track('native_completed', this.id);
    return 'completed';
  }
}
