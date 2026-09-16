'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import NewsletterSignup from './NewsletterSignup';

/**
 * Site-wide newsletter modal.
 *
 * Two triggers race each other and the first one wins: a 45 second dwell and
 * 50% scroll depth. Both are proxies for "this person is actually reading
 * something" rather than "this person just arrived", which is what keeps it
 * out of intrusive-interstitial territory.
 *
 * It fires once. A dismissal is remembered for 30 days, a signup forever.
 * Both live in localStorage, which is per-browser and good enough: the cost of
 * being wrong is one extra modal, not a broken account.
 *
 * Deliberately NOT shown on the newsletter routes themselves. Asking someone
 * to subscribe on the page where they are already subscribing, or worse on the
 * page that just confirmed their unsubscribe, is a bug and not a reach win.
 */

const DELAY_MS = 45_000;
const SCROLL_FRACTION = 0.5;
const DISMISS_DAYS = 30;

const STORAGE_KEY = 'nl-modal';

/** Routes where the ask is redundant or actively wrong. */
const EXCLUDED = ['/newsletter', '/privacy', '/terms'];

type Stored = { until: number | null };

function shouldSuppress(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Stored;
    // null = forever (they signed up). A number is a timestamp to wait out.
    if (parsed.until === null) return true;
    return Date.now() < parsed.until;
  } catch {
    // Private mode, blocked storage, corrupt value. Failing open here means at
    // worst one modal per session, which beats never showing it at all.
    return false;
  }
}

function remember(until: number | null) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ until }));
  } catch {
    /* nothing to do, and nothing worth breaking the page over */
  }
}

export default function NewsletterModal() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // ?preview-modal opens it on demand, ignoring the triggers and the cooldown.
  // Previewing a thing that by design only appears once every 30 days is
  // otherwise a matter of clearing localStorage by hand every time.
  const preview = searchParams.get('preview-modal') !== null;
  const [open, setOpen] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const firedRef = useRef(false);

  const excluded = EXCLUDED.some(
    p => pathname === p || pathname.startsWith(`${p}/`)
  );

  const close = useCallback(
    (reason: 'dismiss' | 'escape' | 'backdrop') => {
      setOpen(false);
      if (!preview) {
        remember(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000);
      }
      if (posthog.__loaded) {
        posthog.capture('newsletter_modal_dismissed', { reason, pathname });
      }
    },
    [pathname, preview]
  );

  // Arm the triggers. Both are torn down as soon as either one fires, so the
  // scroll listener does not outlive its usefulness.
  useEffect(() => {
    if (preview) {
      setOpen(true);
      return;
    }
    if (excluded || firedRef.current || shouldSuppress()) return;

    let timer: ReturnType<typeof setTimeout>;

    const fire = (trigger: 'time' | 'scroll') => {
      if (firedRef.current) return;
      firedRef.current = true;
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      setOpen(true);
      if (posthog.__loaded) {
        posthog.capture('newsletter_modal_shown', { trigger, pathname });
      }
    };

    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      // A page too short to scroll can never reach 50%. The timer covers it.
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= SCROLL_FRACTION) fire('scroll');
    }

    timer = setTimeout(() => fire('time'), DELAY_MS);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [excluded, pathname, preview]);

  // Focus handling and the escape key. Moving focus into the panel is what
  // makes this usable with a keyboard or a screen reader instead of a trap.
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter(el => el.offsetParent !== null);

    panel?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close('escape');
      if (e.key !== 'Tab') return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
      previouslyFocused.current?.focus();
    };
  }, [open, close]);

  // A signup suppresses the modal permanently. Not for 30 days: there is no
  // version of "already subscribed" where asking again next month is right.
  const handleSuccess = useCallback(() => {
    setSignedUp(true);
    remember(null);
  }, []);

  if (excluded && !preview) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className='fixed inset-0 z-[100] flex items-end justify-center sm:items-center'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => close('backdrop')}
            className='absolute inset-0 bg-black/40 backdrop-blur-[2px]'
          />

          <motion.div
            ref={panelRef}
            role='dialog'
            aria-modal='true'
            tabIndex={-1}
            aria-labelledby='nl-modal-title'
            aria-describedby='nl-modal-blurb'
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className='relative flex w-full max-w-[720px] flex-col overflow-hidden bg-white shadow-2xl outline-none sm:flex-row'
          >
            <button
              type='button'
              onClick={() => close('dismiss')}
              aria-label='Close'
              className='absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-black/50 backdrop-blur-sm transition-colors hover:text-black sm:bg-transparent sm:backdrop-blur-none'
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 14 14'
                fill='none'
                aria-hidden='true'
              >
                <path
                  d='M1 1L13 13M13 1L1 13'
                  stroke='currentColor'
                  strokeWidth='1.5'
                />
              </svg>
            </button>

            {/* A full-bleed column on desktop, a banner on mobile. object-position
                keeps the face in frame when the banner crops the portrait. */}
            <div className='relative h-[190px] w-full shrink-0 sm:h-auto sm:w-[268px]'>
              <Image
                src='/dirck-newsletter-tall.jpg'
                alt='Dirck Mulder'
                fill
                sizes='(max-width: 640px) 100vw, 268px'
                priority
                className='object-cover object-[center_26%] sm:object-center'
              />
            </div>

            <div className='flex-1 px-7 pt-8 pb-7 sm:px-9 sm:py-10'>
              <h2
                id='nl-modal-title'
                className='font-[family-name:var(--font-instrument-serif)] text-[30px] leading-tight text-black'
              >
                What I am building
              </h2>
              <p id='nl-modal-blurb' className='mt-2 mb-7 text-sm text-black/60'>
                One email a month from me. New components, what shipped, what
                broke.
              </p>

              <NewsletterSignup
                source={`modal:${pathname}`}
                headline=''
                blurb=''
                onSuccess={handleSuccess}
              />

              {!signedUp && (
                <button
                  type='button'
                  onClick={() => close('dismiss')}
                  className='mt-5 w-full text-center text-xs text-black/40 underline underline-offset-2 transition-colors hover:text-black/70'
                >
                  No thanks
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
