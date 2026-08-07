'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { favouriteSites, favouriteUrl } from './favourites-data';

/**
 * Hover-expand accordion of horizontal bars, one per favourite rebuild.
 * The bars trade space inside a fixed-height block (the LATE SHIFT flavour
 * panel concept, turned into rows): hovering a bar grows it, clicking the
 * grown bar opens the live site in a new tab.
 */

const GROW_ACTIVE = 5;
const GROW_IDLE = 1;
const EASE = [0.22, 1, 0.36, 1] as const;

export default function FavouriteBars() {
  const [active, setActive] = useState(0);
  // Touch taps fire emulated mouseenter/focus before click, which would
  // activate the bar and make the very first tap navigate. Track the real
  // pointer type so only mouse hover and keyboard focus expand a bar.
  const lastPointerType = useRef('');

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    index: number
  ) => {
    // On touch there is no hover: the first tap only expands the bar.
    if (active !== index) {
      e.preventDefault();
      setActive(index);
    }
  };

  return (
    <div
      className='flex h-[560px] flex-col overflow-hidden rounded-2xl sm:h-[680px] lg:h-[760px]'
      onMouseLeave={() => setActive(0)}
    >
      {favouriteSites.map((site, i) => {
        const isActive = i === active;
        return (
          <motion.a
            key={site.slug}
            href={favouriteUrl(site)}
            target='_blank'
            rel='noopener noreferrer'
            onPointerEnter={e => {
              if (e.pointerType === 'mouse') setActive(i);
            }}
            onPointerDown={e => {
              lastPointerType.current = e.pointerType;
            }}
            onFocus={() => {
              if (lastPointerType.current !== 'touch') setActive(i);
            }}
            onClick={e => handleClick(e, i)}
            animate={{ flexGrow: isActive ? GROW_ACTIVE : GROW_IDLE }}
            transition={{ duration: 0.8, ease: EASE }}
            className='relative block min-h-0 basis-0 cursor-pointer overflow-hidden no-underline'
            style={{ background: site.bg, color: site.ink }}
            aria-label={`${site.name}, ${site.kind}, open the live site in a new tab`}
          >
            {/* giant watermark name, active only */}
            <AnimatePresence>
              {isActive && (
                <motion.span
                  key='watermark'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.08 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className='pointer-events-none absolute -right-2 -top-3 select-none whitespace-nowrap text-[clamp(4rem,11vw,9rem)] font-black uppercase leading-none tracking-tight'
                  aria-hidden='true'
                >
                  {site.name}
                </motion.span>
              )}
            </AnimatePresence>

            {/* header strip, always visible */}
            <div className='absolute inset-x-0 top-0 flex h-10 items-center gap-3 px-5 sm:h-12 md:gap-4 md:px-8'>
              <span className='text-[11px] font-semibold tabular-nums opacity-50'>
                {String(i + 1).padStart(2, '0')}
              </span>
              <motion.span
                animate={{ opacity: isActive ? 0 : 1 }}
                transition={{ duration: 0.35 }}
                className='truncate text-sm font-bold tracking-tight md:text-base'
              >
                {site.name}
              </motion.span>
              <span className='ml-auto hidden text-[11px] uppercase tracking-[0.18em] opacity-55 sm:block'>
                {site.kind}
              </span>
              <svg
                className='h-3.5 w-3.5 shrink-0 opacity-60'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth={2}
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M7 17L17 7M9 7h8v8'
                />
              </svg>
            </div>

            {/* expanded detail, active only */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  key='detail'
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className='absolute inset-x-0 bottom-0 flex flex-col items-start gap-2.5 px-5 pb-5 md:gap-3 md:px-8 md:pb-7'
                >
                  <span className='text-[clamp(1.7rem,4vw,3.2rem)] font-black leading-none tracking-tight'>
                    {site.name}
                  </span>
                  <p className='max-w-[52ch] text-[13px] font-medium leading-relaxed opacity-80 md:text-sm'>
                    {site.blurb}
                  </p>
                  <span
                    className='mt-0.5 inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-bold transition-transform hover:-translate-y-0.5'
                    style={{ background: site.accent, color: site.accentInk }}
                  >
                    Visit site
                    <svg
                      className='h-3.5 w-3.5'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth={2.5}
                      aria-hidden='true'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M7 17L17 7M9 7h8v8'
                      />
                    </svg>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.a>
        );
      })}
    </div>
  );
}
