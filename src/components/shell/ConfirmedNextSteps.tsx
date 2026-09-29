'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cardPreviews } from '@/lib/component-previews';
import { INSTAGRAM_PROFILE, REELS } from '@/lib/reels';

export interface NextPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  readingTime: string;
  componentSlug: string | null;
  poster: string | null;
}

type ClickProps =
  | { kind: 'post'; slug: string; position: number }
  | { kind: 'reel'; reel: string; position: number }
  | { kind: 'all_posts' }
  | { kind: 'instagram_profile' };

/** Which way out people take. Never carries the address. */
function track(props: ClickProps) {
  if (posthog.__loaded) posthog.capture('confirmed_next_click', props);
}

function PostThumb({ post }: { post: NextPost }) {
  if (post.poster) {
    return (
      <div className='bg-gradient-primary h-full w-full flex items-start justify-center pt-7 overflow-hidden'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.poster}
          alt=''
          loading='lazy'
          className='w-[40%] rounded-[20px] shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition-transform duration-500 group-hover:-translate-y-2'
        />
      </div>
    );
  }
  return <ComponentThumb post={post} />;
}

/**
 * The component's own card preview, the same one /components shows.
 *
 * Several previews are scroll-driven and sit at scroll position zero, which
 * for a reveal means an empty box. Nobody can scroll a thumbnail inside a link,
 * so this parks every scrollable box in the preview halfway, where the effect
 * is mid-flight and visible.
 */
function ComponentThumb({ post }: { post: NextPost }) {
  const ref = useRef<HTMLDivElement>(null);
  const preview = post.componentSlug ? cardPreviews[post.componentSlug] : null;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const park = () => {
      root.querySelectorAll<HTMLElement>('*').forEach(el => {
        const room = el.scrollHeight - el.clientHeight;
        if (room > 4 && /auto|scroll/.test(getComputedStyle(el).overflowY)) {
          el.scrollTop = room / 2;
        }
      });
    };
    park();
    const t = window.setTimeout(park, 400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      ref={ref}
      className='h-full w-full flex items-center justify-center pointer-events-none'
    >
      {preview ?? (
        <span className='font-[family-name:var(--font-instrument-serif)] text-2xl text-black/40'>
          {post.category}
        </span>
      )}
    </div>
  );
}

export default function ConfirmedNextSteps({ posts }: { posts: NextPost[] }) {
  return (
    <>
      <section className='mt-20' aria-labelledby='next-posts'>
        <div className='flex items-baseline justify-between gap-4'>
          <h2
            id='next-posts'
            className='text-3xl font-[family-name:var(--font-instrument-serif)] text-black'
          >
            Latest on the blog
          </h2>
          <Link
            href='/blog'
            onClick={() => track({ kind: 'all_posts' })}
            className='group inline-flex items-center gap-1 text-sm text-black underline underline-offset-4 hover:no-underline shrink-0'
          >
            All posts
            <ArrowRight
              size={14}
              className='transition-transform duration-200 group-hover:translate-x-0.5'
            />
          </Link>
        </div>

        <ul className='mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 sm:gap-y-10'>
          {posts.map((post, i) => (
            <li
              key={post.slug}
              className={
                i === 0
                  ? ''
                  : 'border-t border-library-border pt-6 sm:border-0 sm:pt-0'
              }
            >
              <Link
                href={`/blog/${post.slug}`}
                onClick={() =>
                  track({ kind: 'post', slug: post.slug, position: i + 1 })
                }
                className='group block no-underline'
              >
                <div
                  className={`${i === 0 ? '' : 'hidden sm:block '}aspect-[16/10] rounded-2xl overflow-hidden border border-library-border bg-library-cream transition-[border-color,box-shadow] duration-300 group-hover:border-black/25 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]`}
                >
                  <PostThumb post={post} />
                </div>
                <p
                  className={`${i === 0 ? 'mt-4' : 'mt-0 sm:mt-4'} text-[11px] uppercase tracking-wider text-library-gray`}
                >
                  {post.category} · {post.readingTime}
                </p>
                <h3 className='mt-1.5 text-lg leading-snug font-medium text-black decoration-black/30 underline-offset-4 group-hover:underline'>
                  {post.title}
                </h3>
                <p className='mt-1.5 text-sm leading-relaxed text-black/60 line-clamp-2'>
                  {post.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        className='mt-16 sm:mt-24 pt-12 border-t border-library-border grid gap-10 lg:grid-cols-[1fr_minmax(0,560px)] lg:items-start'
        aria-labelledby='next-reels'
      >
        <div>
          <h2
            id='next-reels'
            className='text-3xl font-[family-name:var(--font-instrument-serif)] text-black'
          >
            Or watch it first
          </h2>
          <p className='mt-4 max-w-[380px] text-black/70 leading-relaxed'>
            Most things show up on Instagram before they get a proper write-up,
            usually while they are still a bit messy.
          </p>
          <a
            href={INSTAGRAM_PROFILE}
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => track({ kind: 'instagram_profile' })}
            className='mt-6 inline-flex items-center gap-2.5 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-black/80'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/email/icon-instagram.png'
              alt=''
              width={16}
              height={16}
              className='invert'
            />
            Follow on Instagram
          </a>
        </div>

        <ul className='grid grid-cols-3 gap-3 sm:gap-4'>
          {REELS.slice(0, 3).map((reel, i) => (
            <li key={reel.id}>
              <a
                href={reel.href}
                target='_blank'
                rel='noopener noreferrer'
                onClick={() =>
                  track({ kind: 'reel', reel: reel.id, position: i + 1 })
                }
                className='group block no-underline'
              >
                <div className='relative aspect-[9/16] rounded-xl overflow-hidden bg-black'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={reel.image}
                    alt={reel.alt}
                    loading='lazy'
                    className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]'
                  />
                  <div className='absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl' />
                </div>
                <p className='mt-2.5 text-xs sm:text-sm leading-snug text-black group-hover:underline underline-offset-4 decoration-black/30'>
                  {reel.caption}
                  <ArrowUpRight
                    size={13}
                    className='inline ml-0.5 -mt-0.5 text-black/40 transition-colors group-hover:text-black'
                  />
                </p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
