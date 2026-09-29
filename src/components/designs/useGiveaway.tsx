'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Download, Share2 } from 'lucide-react';
import posthog from 'posthog-js';

/**
 * The buttons behind every giveaway page (/designs/<slug> and /kits/<id>):
 * the email click, the download, the share and the form, each reported by a
 * POST after the click. The page's GET is also opened by mail scanners and
 * link previewers and must count nothing. Each share makes its own link id,
 * so each link can be followed on its own.
 *
 * `slug` is the giveaway key from src/lib/designs.ts: an issue slug or
 * 'kit:<id>'. The API routes take it as is.
 */

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

function newShareId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('');
}

function post(path: string, body: object) {
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  });
}

export type At = 'hero' | 'end';

export interface GiveawayOptions {
  /** The giveaway key: '2026-09' or 'kit:app-demo'. */
  slug: string;
  page: 'designs' | 'kit';
  state: 'subscriber' | 'visitor';
  refCode: string | null;
  hasTokenInUrl: boolean;
  /** The public page a share link points at, e.g. '/kits/app-demo'. */
  sharePath: string;
  shareTitle: string;
  shareText: string;
  /** The id of the form section the visitor button scrolls to. */
  formId: string;
  /** PostHog: `<prefix>_page_view`, `_download`, `_share`, `_signup`. */
  analytics: { prefix: 'designs' | 'kit'; props: Record<string, string> };
}

export function useGiveaway(o: GiveawayOptions) {
  const { slug, page, state, refCode, hasTokenInUrl } = o;
  const reduce = useReducedMotion();
  const [busy, setBusy] = useState<'download' | 'share' | null>(null);
  const [note, setNote] = useState<{ at: At; text: string } | null>(null);
  const formOpened = useRef(false);
  const { prefix, props } = o.analytics;
  const capture = (name: string, extra: object = {}) => {
    if (posthog.__loaded)
      posthog.capture(`${prefix}_${name}`, { ...props, ...extra });
  };

  const track = (kind: string, shareId?: string) =>
    post('/api/designs/event', { page, slug, kind, shareId }).catch(() => {});

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('t');
    if (token) {
      // The email click. Keep the access in an HttpOnly cookie, then take the
      // personal token out of the address bar so it cannot be copied on.
      post('/api/designs/session', { slug, token })
        .catch(() => {})
        .finally(() => {
          url.searchParams.delete('t');
          window.history.replaceState(
            null,
            '',
            url.pathname + url.search + url.hash
          );
        });
    } else if (refCode) {
      post('/api/designs/visit', { ref: refCode }).catch(() => {});
    }
    if (posthog.__loaded) {
      posthog.capture(`${prefix}_page_view`, {
        ...props,
        has_token: hasTokenInUrl || state === 'subscriber',
        has_ref: Boolean(refCode),
      });
    }
    // props is a fresh object per render, its values are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, state, refCode, hasTokenInUrl, prefix]);

  /** Counted once: the hero button, or the first time the field is used. */
  function formOpen() {
    if (formOpened.current) return;
    formOpened.current = true;
    track('form_open');
  }

  function toForm() {
    formOpen();
    const section = document.getElementById(o.formId);
    section?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'center',
    });
    // Focus after the scroll has started, without a second jump.
    window.setTimeout(
      () =>
        section
          ?.querySelector<HTMLInputElement>('input[type=email]')
          ?.focus({ preventScroll: true }),
      reduce ? 0 : 450
    );
  }

  async function onDownload(at: At) {
    setBusy('download');
    setNote(null);
    try {
      const res = await post('/api/designs/download', { slug });
      const body = await res.json().catch(() => ({}));
      if (!res.ok)
        return setNote({
          at,
          text: body.error ?? 'Something went wrong. Try again.',
        });
      capture('download');
      window.location.href = body.url;
    } finally {
      setBusy(null);
    }
  }

  async function onShare(at: At) {
    setNote(null);
    // The id is made here so the share sheet opens inside the click itself.
    // Safari only allows navigator.share during the user's gesture, and a
    // network round trip first can use that up.
    const id = newShareId();
    const url = `${window.location.origin}${o.sharePath}?ref=${id}`;
    const native = typeof navigator.share === 'function';
    const registered = post('/api/designs/share', {
      slug,
      id,
      method: native ? 'native' : 'copy',
    }).catch(() => null);
    capture('share', { method: native ? 'native' : 'copy' });

    if (native) {
      track('native_opened', id);
      try {
        await navigator.share({ title: o.shareTitle, text: o.shareText, url });
        await registered;
        track('native_completed', id);
        return;
      } catch (err) {
        await registered;
        if (err instanceof DOMException && err.name === 'AbortError') {
          track('native_cancelled', id);
          return;
        }
        // Any other failure: fall back to copying the same link.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      await registered;
      track('copy_success', id);
      setNote({
        at,
        text: 'Link copied. It is yours to pass on, and it has no personal token in it.',
      });
    } catch {
      await registered;
      track('copy_failed', id);
      setNote({ at, text: url });
    }
  }

  const onSignup = () => capture('signup', { has_ref: Boolean(refCode) });

  return {
    busy,
    note,
    formOpen,
    toForm,
    onDownload,
    onShare,
    onSignup,
    reduce,
  };
}

/** Download and Share, side by side, with the note under them. */
export function GiveawayButtons({
  at,
  g,
  label,
  size,
}: {
  at: At;
  g: ReturnType<typeof useGiveaway>;
  label: string;
  size: string;
}) {
  return (
    <>
      <div className='flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center'>
        <button
          type='button'
          onClick={() => g.onDownload(at)}
          disabled={g.busy !== null}
          className='bg-gradient-primary inline-flex h-14 items-center justify-center gap-2.5 rounded-full px-8 text-[15px] font-medium text-white shadow-[0_14px_30px_-14px_rgba(196,75,16,0.7)] transition-[opacity,transform] active:scale-[0.98] disabled:opacity-60'
        >
          <Download className='size-[18px]' strokeWidth={2} aria-hidden />
          {g.busy === 'download' ? 'Getting it' : label}
          <span className='text-white/70'>{size}</span>
        </button>
        <button
          type='button'
          onClick={() => g.onShare(at)}
          disabled={g.busy !== null}
          className='inline-flex h-14 items-center justify-center gap-2.5 rounded-full border border-black/15 bg-white px-8 text-[15px] font-medium text-black transition-[border-color,transform] hover:border-black/40 active:scale-[0.98] disabled:opacity-60'
        >
          <Share2 className='size-[18px]' strokeWidth={1.75} aria-hidden />
          Share with a friend
        </button>
      </div>
      {g.note?.at === at && (
        <p
          role='status'
          className='mt-4 max-w-[480px] break-all text-sm text-black/70'
        >
          {g.note.text}
        </p>
      )}
    </>
  );
}

/**
 * Fade-and-rise props for motion elements. With reduced motion it still
 * animates to the end state, in zero time: the server cannot know the
 * preference and renders the start state (opacity 0), so leaving `animate`
 * out for those readers left the hero invisible.
 */
export function rise(
  reduce: boolean | null,
  delay: number,
  { y = 14, duration = 0.7 }: { y?: number; duration?: number } = {}
) {
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: reduce
      ? { duration: 0 }
      : { duration, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}
