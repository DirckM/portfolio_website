'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import NewsletterSignup from '@/components/shell/NewsletterSignup';
import PhoneRing, { type RingItem } from './PhoneRing';
import { GiveawayButtons, rise, useGiveaway } from './useGiveaway';

/**
 * The page behind each issue's "Get the code" button, driven entirely by the
 * issue file: the page passes the kicker, title, designs, credit and zip size.
 *
 * A subscriber (valid token or cookie) downloads directly and can share a
 * public link. Anyone else gets the newsletter form, and the zip arrives in
 * the welcome email. The buttons and their tracking live in useGiveaway.tsx,
 * shared with the kit pages.
 */

const FORM_ID = 'get-the-code';

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
  const g = useGiveaway({
    slug,
    page: 'designs',
    state,
    refCode,
    hasTokenInUrl,
    sharePath: `/designs/${slug}`,
    shareTitle: title,
    shareText: 'Free code for these app screens',
    formId: FORM_ID,
    analytics: { prefix: 'designs', props: { issue: slug } },
  });
  // "all two" is not English.
  const all = countWord === 'two' ? 'both' : `all ${countWord}`;
  const All = all[0].toUpperCase() + all.slice(1);

  const up = (delay: number) => rise(g.reduce, delay);

  const subscriberButtons = (at: 'hero' | 'end') => (
    <GiveawayButtons at={at} g={g} label='Download the code' size={size} />
  );

  return (
    <div className='overflow-x-clip pb-20 pt-28 md:pt-32'>
      {/* Hero */}
      <section className='mx-auto flex max-w-[860px] flex-col items-center px-6 text-center'>
        <motion.p
          {...up(0)}
          className='flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] text-black/50'
        >
          <span>{props.kicker}</span>
          <span className='bg-gradient-primary rounded-full px-2.5 py-[3px] text-[10px] font-bold tracking-[0.14em] text-white'>
            Free
          </span>
        </motion.p>
        <motion.h1
          {...up(0.06)}
          className='mt-6 text-balance text-[42px] leading-[1.02] text-black md:text-7xl font-[family-name:var(--font-instrument-serif)]'
        >
          {title}
        </motion.h1>
        <motion.p
          {...up(0.12)}
          className='mt-6 max-w-[560px] text-pretty text-base leading-relaxed text-black/60 md:text-lg'
        >
          The code for {all}, one folder each. Plain HTML and CSS you can open
          in a browser, pull apart and reuse.
        </motion.p>
        <motion.div
          {...up(0.18)}
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
                onClick={g.toForm}
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
        {...rise(g.reduce, 0.25, { y: 24, duration: 0.9 })}
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
              onFocusCapture={g.formOpen}
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
                onSuccess={g.onSignup}
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
