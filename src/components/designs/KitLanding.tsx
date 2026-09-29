'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import NewsletterSignup from '@/components/shell/NewsletterSignup';
import { BEZEL } from '@/lib/phone-demos';
import type { KitPage } from '@/lib/kits';
import { GiveawayButtons, rise, useGiveaway } from './useGiveaway';

/**
 * The page behind a kit's button in the emails, /kits/<id>. Same design and
 * same buttons as /designs/<slug>: a subscriber downloads and shares, anyone
 * else gets the newsletter form and the kit arrives after the double opt-in.
 * Everything it says comes from the kit's `page` in src/lib/kits.ts.
 */

const FORM_ID = 'get-the-kit';

export interface KitLandingProps {
  id: string;
  state: 'subscriber' | 'visitor';
  refCode: string | null;
  hasTokenInUrl: boolean;
  name: string;
  size: string;
  page: KitPage;
}

// Screen opening as a share of the bezel, so the phone can be any size.
const S = BEZEL.screen;
const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`;
const SCREEN_STYLE = {
  left: pct(S.x, BEZEL.width),
  top: pct(S.y, BEZEL.height),
  width: pct(S.width, BEZEL.width),
  height: pct(S.height, BEZEL.height),
  borderRadius: `${pct(S.radius, S.width)} / ${pct(S.radius, S.height)}`,
};

/** The demo, playing on its own in Apple's bezel. Still with reduced motion. */
function Phone({ demo }: { demo: KitPage['demo'] }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <div
      className='relative w-[210px] md:w-[250px]'
      style={{
        aspectRatio: `${BEZEL.width} / ${BEZEL.height}`,
        filter:
          'drop-shadow(0 28px 40px rgba(0,0,0,.18)) drop-shadow(0 4px 10px rgba(0,0,0,.08))',
      }}
    >
      <div
        className='absolute overflow-hidden bg-[#0b0b0c]'
        style={SCREEN_STYLE}
      >
        <video
          ref={video}
          src={demo.src}
          poster={demo.poster}
          width={demo.width}
          height={demo.height}
          muted
          playsInline
          loop
          preload='metadata'
          aria-label={demo.label}
          className='block h-full w-full object-cover'
        />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BEZEL.src}
        alt=''
        width={BEZEL.width}
        height={BEZEL.height}
        className='pointer-events-none absolute inset-0 h-full w-full'
      />
    </div>
  );
}

export default function KitLanding(props: KitLandingProps) {
  const { id, state, refCode, hasTokenInUrl, size, page } = props;
  const g = useGiveaway({
    slug: `kit:${id}`,
    page: 'kit',
    state,
    refCode,
    hasTokenInUrl,
    sharePath: `/kits/${id}`,
    shareTitle: page.title,
    shareText: `Free: ${page.title}`,
    formId: FORM_ID,
    analytics: { prefix: 'kit', props: { kit: id } },
  });

  const up = (delay: number) => rise(g.reduce, delay);

  const buttons = (at: 'hero' | 'end') => (
    <GiveawayButtons at={at} g={g} label='Download the kit' size={size} />
  );

  return (
    <div className='overflow-x-clip pb-20 pt-28 md:pt-32'>
      {/* Hero */}
      <section className='mx-auto flex max-w-[860px] flex-col items-center px-6 text-center'>
        <motion.p
          {...up(0)}
          className='flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] text-black/50'
        >
          <span>{page.kicker}</span>
          <span className='bg-gradient-primary rounded-full px-2.5 py-[3px] text-[10px] font-bold tracking-[0.14em] text-white'>
            Free
          </span>
        </motion.p>
        <motion.h1
          {...up(0.06)}
          className='mt-6 text-balance text-[42px] leading-[1.02] text-black md:text-7xl font-[family-name:var(--font-instrument-serif)]'
        >
          {page.title}
        </motion.h1>
        <motion.p
          {...up(0.12)}
          className='mt-6 max-w-[580px] text-pretty text-base leading-relaxed text-black/60 md:text-lg'
        >
          {page.line}
        </motion.p>
        <motion.div
          {...up(0.18)}
          className='mt-9 flex w-full flex-col items-center'
        >
          {state === 'subscriber' ? (
            <>
              {buttons('hero')}
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
                Get the kit
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

      {/* The kit: the demo it made, and what is in the zip */}
      <motion.section
        {...rise(g.reduce, 0.25, { y: 24, duration: 0.9 })}
        className='mx-auto mt-16 flex max-w-[920px] flex-col items-center gap-12 px-6 md:mt-20 md:flex-row md:items-center md:gap-16'
        aria-label='What is in the kit'
      >
        <figure className='m-0 flex shrink-0 flex-col items-center'>
          <Phone demo={page.demo} />
          <figcaption className='mt-5 max-w-[250px] text-center text-[13px] leading-snug text-black/45'>
            {page.demo.label}
          </figcaption>
        </figure>

        <div className='w-full min-w-0 md:flex-1'>
          <p className='text-[11px] uppercase tracking-[0.2em] text-black/50'>
            In the zip
          </p>
          <ul className='m-0 mt-4 list-none p-0'>
            {page.inside.map(row => (
              <li
                key={row.file}
                className='border-t border-black/10 py-4 first:border-t-2 first:border-black'
              >
                <p className='text-[15px] font-medium text-black font-[family-name:var(--font-jetbrains-mono)]'>
                  {row.file}
                </p>
                <p className='mt-1 text-pretty text-[15px] leading-relaxed text-black/60'>
                  {row.what}
                </p>
              </li>
            ))}
          </ul>
          <p className='border-t border-black/10 pt-4 text-[13px] text-black/45'>
            ZIP, {size}. Unzip it into your .claude/skills folder.
          </p>
          <p className='mt-8 text-[11px] uppercase tracking-[0.2em] text-black/50'>
            How it works
          </p>
          <Link
            href={page.post.href}
            className='group mt-2 block text-pretty text-lg leading-snug text-black'
          >
            <span className='underline decoration-black/20 underline-offset-4 transition-colors group-hover:decoration-black'>
              {page.post.title}
            </span>
            <ArrowRight
              className='ml-1.5 inline size-4 align-[-2px] transition-transform duration-200 group-hover:translate-x-0.5'
              strokeWidth={1.75}
              aria-hidden
            />
          </Link>
        </div>
      </motion.section>

      {/* Get the kit */}
      <section
        id={FORM_ID}
        className='mx-auto mt-20 max-w-[640px] scroll-mt-24 px-4 text-center sm:px-6 md:mt-28'
      >
        <h2 className='text-balance text-4xl leading-[1.05] text-black md:text-5xl font-[family-name:var(--font-instrument-serif)]'>
          {state === 'subscriber'
            ? 'The whole kit, in one zip'
            : 'The kit, in your inbox'}
        </h2>
        {state === 'subscriber' ? (
          <div className='mt-8 flex flex-col items-center'>
            {buttons('end')}
          </div>
        ) : (
          <>
            <p className='mx-auto mt-4 max-w-[460px] text-pretty text-base leading-relaxed text-black/60'>
              Put your email in and the kit comes straight to you. You also get
              the monthly email with what I built next.
            </p>
            <div
              className='mx-auto mt-8 max-w-[560px] text-left'
              onFocusCapture={g.formOpen}
            >
              <NewsletterSignup
                source={`kit:${id}:page`}
                refCode={refCode}
                track={{ page: 'kit', slug: `kit:${id}` }}
                variant='pill'
                headline=''
                blurb=''
                cta='Send me the kit'
                successTitle='Check your inbox.'
                successBody='One click to confirm and the kit is yours.'
                finePrint='Free. The only cost is my newsletter: one email a month, with a one-click unsubscribe in every one.'
                onSuccess={g.onSignup}
              />
            </div>
          </>
        )}
      </section>

      <footer className='mx-auto mt-24 max-w-[640px] border-t border-black/10 px-6 pt-6 text-center'>
        <Link
          href='/designs'
          className='group inline-flex items-center gap-1.5 text-sm text-black/70 transition-colors hover:text-black'
        >
          Free app designs, with the code
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
