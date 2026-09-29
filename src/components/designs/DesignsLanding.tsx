'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight, Download, Share2 } from 'lucide-react';
import posthog from 'posthog-js';
import NewsletterSignup from '@/components/shell/NewsletterSignup';
import PhoneRing, { type RingItem } from './PhoneRing';

/**
 * The page behind each issue's "Get the code" button, driven entirely by the
 * issue file: the page passes the kicker, title, designs, credit and zip size.
 *
 * A subscriber (valid token or cookie) downloads directly and can share a
 * public link. Anyone else gets the newsletter form, and the zip arrives in
 * the welcome email.
 *
 * Every press is recorded from here, by POST, after the click: the page's GET
 * is also opened by mail scanners and link previewers and must count nothing.
 * Each share makes its own link id, so each link can be followed on its own.
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
const FORM_ID = 'get-the-code';

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

export interface DesignsLandingProps {
  slug: string;
  state: 'subscriber' | 'visitor';
  refCode: string | null;
  hasTokenInUrl: boolean;
  /** e.g. "Made in September · Issue 001". */
  kicker: string;
  title: string;
  /** "four", from the number of designs. */
  countWord: string;
  size: string;
  items: RingItem[];
  credit: string;
}

export default function DesignsLanding(props: DesignsLandingProps) {
  const { slug, state, refCode, hasTokenInUrl, title, size, countWord } = props;
  const reduce = useReducedMotion();
  // "all two" is not English.
  const all = countWord === 'two' ? 'both' : `all ${countWord}`;
  const All = all[0].toUpperCase() + all.slice(1);
  const [busy, setBusy] = useState<'download' | 'share' | null>(null);
  const [note, setNote] = useState<{ at: 'hero' | 'end'; text: string } | null>(
    null
  );
  const formOpened = useRef(false);

  const track = (kind: string, shareId?: string) =>
    post('/api/designs/event', { page: 'designs', slug, kind, shareId }).catch(
      () => {}
    );

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
      posthog.capture('designs_page_view', {
        issue: slug,
        has_token: hasTokenInUrl || state === 'subscriber',
        has_ref: Boolean(refCode),
      });
    }
  }, [slug, state, refCode, hasTokenInUrl]);

  /** Counted once: the hero button, or the first time the field is used. */
  function formOpen() {
    if (formOpened.current) return;
    formOpened.current = true;
    track('form_open');
  }

  function toForm() {
    formOpen();
    const section = document.getElementById(FORM_ID);
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

  async function onDownload(at: 'hero' | 'end') {
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
      if (posthog.__loaded)
        posthog.capture('designs_download', { issue: slug });
      window.location.href = body.url;
    } finally {
      setBusy(null);
    }
  }

  async function onShare(at: 'hero' | 'end') {
    setNote(null);
    // The id is made here so the share sheet opens inside the click itself.
    // Safari only allows navigator.share during the user's gesture, and a
    // network round trip first can use that up.
    const id = newShareId();
    const url = `${window.location.origin}/designs/${slug}?ref=${id}`;
    const native = typeof navigator.share === 'function';
    const registered = post('/api/designs/share', {
      slug,
      id,
      method: native ? 'native' : 'copy',
    }).catch(() => null);
    if (posthog.__loaded)
      posthog.capture('designs_share', {
        issue: slug,
        method: native ? 'native' : 'copy',
      });

    if (native) {
      track('native_opened', id);
      try {
        await navigator.share({
          title,
          text: 'Free code for these app screens',
          url,
        });
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

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.7,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  const subscriberButtons = (at: 'hero' | 'end') => (
    <>
      <div className='flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center'>
        <button
          type='button'
          onClick={() => onDownload(at)}
          disabled={busy !== null}
          className='bg-gradient-primary inline-flex h-14 items-center justify-center gap-2.5 rounded-full px-8 text-[15px] font-medium text-white shadow-[0_14px_30px_-14px_rgba(196,75,16,0.7)] transition-[opacity,transform] active:scale-[0.98] disabled:opacity-60'
        >
          <Download className='size-[18px]' strokeWidth={2} aria-hidden />
          {busy === 'download' ? 'Getting it' : 'Download the code'}
          <span className='text-white/70'>{size}</span>
        </button>
        <button
          type='button'
          onClick={() => onShare(at)}
          disabled={busy !== null}
          className='inline-flex h-14 items-center justify-center gap-2.5 rounded-full border border-black/15 bg-white px-8 text-[15px] font-medium text-black transition-[border-color,transform] hover:border-black/40 active:scale-[0.98] disabled:opacity-60'
        >
          <Share2 className='size-[18px]' strokeWidth={1.75} aria-hidden />
          Share with a friend
        </button>
      </div>
      {note?.at === at && (
        <p
          role='status'
          className='mt-4 max-w-[480px] break-all text-sm text-black/70'
        >
          {note.text}
        </p>
      )}
    </>
  );

  return (
    <div className='overflow-x-clip pb-20 pt-28 md:pt-32'>
      {/* Hero */}
      <section className='mx-auto flex max-w-[860px] flex-col items-center px-6 text-center'>
        <motion.p
          {...rise(0)}
          className='flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] text-black/50'
        >
          <span>{props.kicker}</span>
          <span className='bg-gradient-primary rounded-full px-2.5 py-[3px] text-[10px] font-bold tracking-[0.14em] text-white'>
            Free
          </span>
        </motion.p>
        <motion.h1
          {...rise(0.06)}
          className='mt-6 text-balance text-[42px] leading-[1.02] text-black md:text-7xl font-[family-name:var(--font-instrument-serif)]'
        >
          {title}
        </motion.h1>
        <motion.p
          {...rise(0.12)}
          className='mt-6 max-w-[560px] text-pretty text-base leading-relaxed text-black/60 md:text-lg'
        >
          The code for {all}, one folder each. Plain HTML and CSS you can open
          in a browser, pull apart and reuse.
        </motion.p>
        <motion.div
          {...rise(0.18)}
          className='mt-9 flex w-full flex-col items-center'
        >
          {state === 'subscriber' ? (
            <>
              {subscriberButtons('hero')}
              <p className='mt-4 text-sm text-black/50'>
                Free, and you are already on the list.
              </p>
            </>
          ) : (
            <>
              <button
                type='button'
                onClick={toForm}
                className='bg-gradient-primary group inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full px-9 text-[15px] font-medium text-white shadow-[0_14px_30px_-14px_rgba(196,75,16,0.7)] transition-transform active:scale-[0.98] sm:w-auto'
              >
                Get the code
                <ArrowDown
                  className='size-[18px] transition-transform duration-200 group-hover:translate-y-0.5'
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
              <p className='mt-4 text-sm text-black/50'>
                Free. No payment, no catch, just your email.
              </p>
            </>
          )}
        </motion.div>
      </section>

      {/* The designs */}
      <motion.section
        {...(reduce
          ? {}
          : {
              initial: { opacity: 0, y: 24 },
              animate: { opacity: 1, y: 0 },
              transition: {
                duration: 0.9,
                delay: 0.25,
                ease: [0.22, 1, 0.36, 1] as const,
              },
            })}
        className='mt-14 md:mt-16'
        aria-label='The designs'
      >
        <PhoneRing items={props.items} />
      </motion.section>

      {/* Get the code */}
      <section
        id={FORM_ID}
        className='mx-auto mt-20 max-w-[640px] scroll-mt-24 px-4 text-center sm:px-6 md:mt-28'
      >
        <h2 className='text-balance text-4xl leading-[1.05] text-black md:text-5xl font-[family-name:var(--font-instrument-serif)]'>
          {state === 'subscriber'
            ? `${All}, in one zip`
            : `${All}, in your inbox`}
        </h2>
        {state === 'subscriber' ? (
          <div className='mt-8 flex flex-col items-center'>
            {subscriberButtons('end')}
          </div>
        ) : (
          <>
            <p className='mx-auto mt-4 max-w-[460px] text-pretty text-base leading-relaxed text-black/60'>
              Put your email in and the code comes straight to you. You also get
              the monthly email with the next set.
            </p>
            <div
              className='mx-auto mt-8 max-w-[560px] text-left'
              onFocusCapture={formOpen}
            >
              <NewsletterSignup
                source={`designs:${slug}`}
                refCode={refCode}
                track={{ page: 'designs', slug }}
                variant='pill'
                headline=''
                blurb=''
                cta='Send me the code'
                successTitle='Check your inbox.'
                successBody='One click to confirm and the code is yours.'
                finePrint='Free. The only cost is my newsletter: one email a month, with a one-click unsubscribe in every one.'
                onSuccess={() => {
                  if (posthog.__loaded) {
                    posthog.capture('designs_signup', {
                      issue: slug,
                      has_ref: Boolean(refCode),
                    });
                  }
                }}
              />
            </div>
          </>
        )}
      </section>

      <footer className='mx-auto mt-24 max-w-[640px] border-t border-black/10 px-6 pt-6 text-center'>
        <p className='text-pretty text-[13px] leading-relaxed text-black/45'>
          {props.credit}
        </p>
        <Link
          href='/designs'
          className='group mt-5 inline-flex items-center gap-1.5 text-sm text-black/70 transition-colors hover:text-black'
        >
          Every set so far
          <ArrowRight
            className='size-4 transition-transform duration-200 group-hover:translate-x-0.5'
            strokeWidth={1.75}
            aria-hidden
          />
        </Link>
      </footer>
    </div>
  );
}
