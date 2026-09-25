'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { BEZEL, phoneDemos } from '@/lib/phone-demos';

/**
 * A pre-recorded app demo in Apple's iPhone bezel, with a chapter list that
 * follows the video. The web version of the demo slides in the Dishy deck.
 *
 * The chapter logic is ported from that deck's script: the chapter playing is
 * lit, the ones before it read as done, and a line under the current one fills
 * as that part of the video runs. It is painted straight onto the DOM from a
 * frame loop rather than through React state, because `timeupdate` only fires
 * about four times a second, which steps the line, and a state update per frame
 * would re-render the whole list sixty times a second for one CSS variable.
 *
 * Lazy by design: `preload="none"` until the phone scrolls into view, then it
 * plays muted and loops, and it pauses again when it leaves. A reader who
 * presses pause stays paused. With reduced motion requested it never starts
 * on its own.
 */

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

export default function PhoneDemo({ demo }: { demo: string }) {
  const data = phoneDemos[demo];
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = video.current;
    const box = wrap.current;
    if (!v || !box || !data) return;

    const chapters = data.chapters;
    let raf = 0;

    const paint = () => {
      const t = v.currentTime;
      let current = 0;
      chapters.forEach((c, i) => {
        if (t >= c.at) current = i;
      });
      const from = chapters[current].at;
      const to = chapters[current + 1]?.at ?? (v.duration || from + 1);
      items.current.forEach((li, i) => {
        if (!li) return;
        li.dataset.current = String(i === current);
        li.dataset.done = String(i < current);
        li.style.setProperty(
          '--p',
          i === current
            ? String(Math.min(1, Math.max(0, (t - from) / (to - from))))
            : '0'
        );
      });
    };

    const loop = () => {
      paint();
      if (!v.paused) raf = requestAnimationFrame(loop);
    };
    const onPlay = () => {
      setPlaying(true);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };
    const onPause = () => setPlaying(false);

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    ['seeked', 'loadedmetadata', 'timeupdate'].forEach(e =>
      v.addEventListener(e, paint)
    );
    paint();

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!reduced && !userPaused.current) v.play().catch(() => {});
          else if (v.preload === 'none') v.preload = 'metadata';
        } else if (!v.paused) {
          v.pause();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(box);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      ['seeked', 'loadedmetadata', 'timeupdate'].forEach(e =>
        v.removeEventListener(e, paint)
      );
    };
  }, [data]);

  if (!data) return null;

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  };

  const seek = (at: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = at;
    userPaused.current = false;
    v.play().catch(() => {});
  };

  const videoEl = (
    <video
      ref={video}
      src={data.src}
      poster={data.poster}
      width={data.width}
      height={data.height}
      muted
      playsInline
      loop
      preload='none'
      aria-label={data.label}
      onClick={toggle}
      className={
        data.framed
          ? 'block w-full h-auto bg-white cursor-pointer'
          : 'block w-full h-full object-cover cursor-pointer'
      }
    />
  );

  return (
    <figure
      ref={wrap}
      data-phone-demo={demo}
      className='not-prose my-10 flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-10'
    >
      <div className='flex shrink-0 flex-col items-center'>
        {data.framed ? (
          // The phone and its shadow are already in the footage.
          <div className='w-[270px] md:w-[300px]'>{videoEl}</div>
        ) : (
          <div
            className='relative w-[220px] md:w-[244px]'
            style={{
              aspectRatio: `${BEZEL.width} / ${BEZEL.height}`,
              filter:
                'drop-shadow(0 22px 32px rgba(0,0,0,.18)) drop-shadow(0 4px 10px rgba(0,0,0,.08))',
            }}
          >
            <div
              className='absolute overflow-hidden bg-[#0b0b0c]'
              style={SCREEN_STYLE}
            >
              {videoEl}
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
        )}

        <button
          type='button'
          onClick={toggle}
          className={`${data.framed ? 'mt-1' : 'mt-6'} inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-1.5 text-xs uppercase tracking-wider text-black/70 transition-colors hover:border-black/40 hover:text-black`}
        >
          {playing ? (
            <Pause size={13} aria-hidden />
          ) : (
            <Play size={13} aria-hidden />
          )}
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>

      <figcaption className='w-full min-w-0 md:flex-1'>
        <ol className='m-0 list-none p-0'>
          {data.chapters.map((c, i) => (
            <li
              key={c.at}
              ref={el => {
                items.current[i] = el;
              }}
              data-chapter
              data-current={i === 0 ? 'true' : 'false'}
              data-done='false'
              className='phone-demo-chapter relative border-t border-black/10 first:border-t-2 first:border-black'
            >
              <button
                type='button'
                onClick={() => seek(c.at)}
                className='block w-full py-3 text-left text-[15px] leading-snug'
              >
                {c.label}
              </button>
            </li>
          ))}
        </ol>
      </figcaption>

      <style>{`
        .phone-demo-chapter { color: rgba(0,0,0,.38); transition: color .4s ease; }
        .phone-demo-chapter[data-done='true'] { color: rgba(0,0,0,.55); }
        .phone-demo-chapter[data-current='true'] { color: #000; font-weight: 600; }
        .phone-demo-chapter::after {
          content: '';
          position: absolute; left: 0; right: 0; bottom: -1px;
          height: 2px;
          background: var(--primary, #ff7e35);
          transform-origin: left center;
          transform: scaleX(var(--p, 0));
          opacity: 0;
          transition: opacity .3s ease;
        }
        .phone-demo-chapter[data-current='true']::after { opacity: 1; }
      `}</style>
    </figure>
  );
}
