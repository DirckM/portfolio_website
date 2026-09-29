'use client';

import AccentTitle from '@/components/shell/AccentTitle';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Check, Copy, Download, Loader2, Share2 } from 'lucide-react';
import posthog from 'posthog-js';
import {
  requestDownload,
  sameOriginPath,
  ShareLink,
  shouldAutoDownload,
} from '@/lib/giveaway-client';

/**
 * The buttons behind every giveaway page (/designs/<slug> and /kits/<id>):
 * the email click, the download, the share and the form, each reported by a
 * POST after the click. The page's GET is also opened by mail scanners and
 * link previewers and must count nothing.
 *
 * A subscriber who arrives from the email gets the file at once (after load,
 * through the download POST) and a share link they can copy straight away.
 * The rules for both are in src/lib/giveaway-client.ts.
 *
 * `slug` is the giveaway key from src/lib/designs.ts: an issue slug or
 * 'kit:<id>'. The API routes take it as is.
 */

function post(path: string, body: object) {
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  });
}

/** Start a download from a same-origin link, without leaving the page. */
function saveFile(url: string) {
  const a = document.createElement('a');
  a.href = sameOriginPath(url);
  a.download = '';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

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

export type DownloadStatus = 'idle' | 'starting' | 'done' | 'failed';

export function useGiveaway(o: GiveawayOptions) {
  const { slug, page, state, refCode, hasTokenInUrl } = o;
  const reduce = useReducedMotion();
  const auto = shouldAutoDownload({ state, hasTokenInUrl });
  // Known on the server too, so the hero renders the right state first time.
  const [download, setDownload] = useState<DownloadStatus>(
    auto ? 'starting' : 'idle'
  );
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const formOpened = useRef(false);
  const copiedTimer = useRef<number | undefined>(undefined);
  const { prefix, props } = o.analytics;
  const capture = (name: string, extra: object = {}) => {
    if (posthog.__loaded)
      posthog.capture(`${prefix}_${name}`, { ...props, ...extra });
  };

  const track = (kind: string, shareId?: string) => {
    post('/api/designs/event', { page, slug, kind, shareId }).catch(() => {});
  };

  async function startDownload() {
    setDownload('starting');
    setError(null);
    const res = await requestDownload(post, slug);
    if (!res.ok) {
      setDownload('failed');
      setError(res.error);
      return;
    }
    capture('download');
    saveFile(res.url);
    setDownload('done');
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('t');
    if (token) {
      // The email click. Keep the access in an HttpOnly cookie, take the
      // personal token out of the address bar so it cannot be copied on, and
      // then, for a subscriber the server accepted, fetch the file.
      post('/api/designs/session', { slug, token })
        .catch(() => {})
        .finally(() => {
          url.searchParams.delete('t');
          window.history.replaceState(
            null,
            '',
            url.pathname + url.search + url.hash
          );
          if (auto) void startDownload();
        });
    } else if (refCode) {
      post('/api/designs/visit', { ref: refCode }).catch(() => {});
    }
    if (state === 'subscriber') {
      // Made now so the link shows at once. Registered only when used.
      setLink(
        new ShareLink({
          post,
          slug,
          origin: window.location.origin,
          path: o.sharePath,
          track,
        })
      );
      setCanNativeShare(
        typeof navigator.share === 'function' &&
          window.matchMedia('(pointer: coarse)').matches
      );
    }
    if (posthog.__loaded) {
      posthog.capture(`${prefix}_page_view`, {
        ...props,
        has_token: hasTokenInUrl || state === 'subscriber',
        has_ref: Boolean(refCode),
      });
    }
    // Runs once per page: props is a fresh object per render, and the
    // functions it calls only read values that do not change after load.
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

  async function copy() {
    if (!link) return;
    setShareNote(null);
    const ok = await link.copy(text => navigator.clipboard.writeText(text));
    if (!ok) {
      setShareNote('Copying did not work here. Select the link and copy it.');
      return;
    }
    capture('share', { method: 'copy' });
    setCopied(true);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 2600);
  }

  async function nativeShare() {
    if (!link) return;
    setShareNote(null);
    const result = await link.share(
      data => navigator.share(data),
      o.shareTitle,
      o.shareText
    );
    if (result === 'completed') capture('share', { method: 'native' });
    if (result === 'failed') await copy();
  }

  const onSignup = () => capture('signup', { has_ref: Boolean(refCode) });

  return {
    reduce,
    download,
    error,
    startDownload,
    link,
    copied,
    shareNote,
    canNativeShare,
    copy,
    nativeShare,
    formOpen,
    toForm,
    onSignup,
  };
}

export type Giveaway = ReturnType<typeof useGiveaway>;

/**
 * The subscriber's hero: the download (started for them when they came from
 * the email), then the share block right under it.
 */
export function SubscriberActions({
  g,
  label,
  size,
  downloading,
  shareHeading,
}: {
  g: Giveaway;
  /** The button when nothing has started: "Download the kit". */
  label: string;
  size: string;
  /** "Your kit is downloading". */
  downloading: string;
  shareHeading: string;
}) {
  const done = g.download === 'done';
  return (
    <div className='flex w-full flex-col items-center'>
      {done || g.download === 'starting' ? (
        <div className='flex flex-col items-center'>
          <p
            role='status'
            className={`inline-flex h-14 items-center gap-3 rounded-full pl-2 pr-6 text-[15px] font-medium transition-colors duration-300 ${
              done
                ? 'bg-[#e8f5ec] text-[#17603a]'
                : 'bg-black/[0.04] text-black/70'
            }`}
          >
            <span
              className={`grid size-10 place-items-center rounded-full transition-colors duration-300 ${
                done ? 'bg-[#1f8a4c] text-white' : 'bg-white text-black/60'
              }`}
            >
              {done ? (
                <Check className='size-5' strokeWidth={2.5} aria-hidden />
              ) : (
                <Loader2
                  className='size-5 animate-spin'
                  strokeWidth={2}
                  aria-hidden
                />
              )}
            </span>
            {done ? downloading : 'Starting your download'}
          </p>
          <p className='mt-4 text-sm text-black/50'>
            Nothing happened?{' '}
            <button
              type='button'
              onClick={() => g.startDownload()}
              disabled={!done}
              className='font-medium text-black/75 underline decoration-black/25 underline-offset-4 transition-colors hover:text-black hover:decoration-black disabled:opacity-50'
            >
              Download again
            </button>
            <span className='whitespace-nowrap text-black/35'> · ZIP, {size}</span>
          </p>
        </div>
      ) : (
        <div className='flex w-full flex-col items-center'>
          <button
            type='button'
            onClick={() => g.startDownload()}
            className='bg-gradient-primary inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full px-8 text-[15px] font-medium text-white shadow-[0_14px_30px_-14px_rgba(196,75,16,0.7)] transition-[opacity,transform] active:scale-[0.98] sm:w-auto'
          >
            <Download className='size-[18px]' strokeWidth={2} aria-hidden />
            {label}
            <span className='text-white/70'>{size}</span>
          </button>
          <p role='status' className='mt-4 text-sm text-black/50'>
            {g.error ?? 'Free, and you are already on the list.'}
          </p>
        </div>
      )}

      <ShareBlock g={g} heading={shareHeading} />
    </div>
  );
}

/** A read-only link with a Copy button, and the share sheet on a phone. */
function ShareBlock({ g, heading }: { g: Giveaway; heading: string }) {
  // A phone cannot fit the whole link, and its end (the ref) is the part that
  // makes it yours. So the page part shortens and the ref always shows.
  const shown = g.link?.url.replace(/^https?:\/\//, '') ?? '';
  const cut = shown.indexOf('?');
  const [base, ref] =
    cut < 0 ? [shown, ''] : [shown.slice(0, cut), shown.slice(cut)];
  return (
    <section
      aria-label={heading}
      className='mt-12 w-full max-w-[560px] rounded-[28px] border border-black/10 bg-[#faf8f6] p-5 text-left sm:p-7'
    >
      <h2 className='text-balance text-[26px] leading-[1.08] text-black md:text-[32px] font-semibold tracking-[-0.035em]'>
        <AccentTitle text={heading} />
      </h2>
      <p className='mt-2 text-pretty text-[15px] leading-relaxed text-black/60'>
        Anyone who opens your link gets it free, with just their email.
      </p>
      <div className='mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-1.5 sm:rounded-full sm:border sm:border-black/10 sm:bg-white sm:p-1.5'>
        <p
          id='share-link'
          aria-label='Your share link'
          className='flex h-12 min-w-0 select-all sm:flex-1 items-center rounded-full border border-black/10 bg-white px-4 text-[14px] text-black/75 sm:h-auto sm:border-0 sm:bg-transparent sm:pl-3.5 sm:pr-2 font-[family-name:var(--font-jetbrains-mono)]'
        >
          {g.link ? (
            <>
              <span className='truncate'>{base}</span>
              <span className='shrink-0 text-black'>{ref}</span>
            </>
          ) : (
            <span className='text-black/40'>Making your link</span>
          )}
        </p>
        <button
          type='button'
          onClick={() => g.copy()}
          disabled={!g.link}
          aria-live='polite'
          className={`inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-5 sm:h-11 text-[14px] font-medium text-white transition-[background-color,transform] duration-200 active:scale-[0.97] disabled:opacity-50 ${
            g.copied ? 'bg-[#1f8a4c]' : 'bg-black hover:bg-black/85'
          }`}
        >
          {g.copied ? (
            <Check className='size-4' strokeWidth={2.5} aria-hidden />
          ) : (
            <Copy className='size-4' strokeWidth={2} aria-hidden />
          )}
          {g.copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {g.canNativeShare && (
        <button
          type='button'
          onClick={() => g.nativeShare()}
          disabled={!g.link}
          className='mt-3 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-black/15 bg-white text-[15px] font-medium text-black transition-[border-color,transform] hover:border-black/40 active:scale-[0.98] disabled:opacity-50'
        >
          <Share2 className='size-[18px]' strokeWidth={1.75} aria-hidden />
          Share
        </button>
      )}
      {g.shareNote && (
        <p role='status' className='mt-3 text-sm text-black/60'>
          {g.shareNote}
        </p>
      )}
    </section>
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
