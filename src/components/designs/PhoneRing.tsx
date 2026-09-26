'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * The designs of an issue as phones standing on a ring that turns.
 *
 * One number drives everything: `pos`, the ring's position in phones (1.5 is
 * halfway between the second and the third). A drag writes it directly, a
 * release springs it to the nearest whole phone, the arrows, dots, keys and
 * the slow auto-turn spring it to the next one. Every phone reads its place
 * from `pos`, so the ring can never disagree with the dots or the caption.
 *
 * Geometry lives in CSS variables (--w, the card width, and --r, the ring
 * radius), so the server render already has the right size and nothing jumps
 * when the script loads. Only transform and opacity animate.
 *
 * Three or four phones form a full ring that loops. Two on a ring would put
 * one straight behind the other, so two stand on a shallow arc instead and
 * the ring swings between them.
 */

export interface RingItem {
  src: string;
  alt: string;
  caption: string;
}

const AUTO_MS = 5200;
const SPRING = {
  type: 'spring',
  stiffness: 170,
  damping: 26,
  mass: 1,
} as const;

const mod = (a: number, n: number) => ((a % n) + n) % n;
/** An offset in phones, folded into [-n/2, n/2) so the ring loops. */
const fold = (d: number, n: number) => mod(d + n / 2, n) - n / 2;

export default function PhoneRing({ items }: { items: RingItem[] }) {
  const n = items.length;
  const loop = n >= 3;
  const reduce = useReducedMotion();
  const pos = useMotionValue(0);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  // A drag ends with a click on whatever phone is under the pointer. Ignore it.
  const justDragged = useRef(false);
  const drag = useRef<{
    x: number;
    start: number;
    moved: boolean;
    unit: number;
  } | null>(null);

  useMotionValueEvent(pos, 'change', v => {
    const i = mod(Math.round(v), n);
    setActive(prev => (prev === i ? prev : i));
  });

  const springTo = useCallback(
    (target: number, velocity = 0) => {
      controls.current?.stop();
      if (!loop) target = Math.max(0, Math.min(n - 1, target));
      if (reduce) {
        pos.set(target);
        return;
      }
      controls.current = animate(pos, target, { ...SPRING, velocity });
    },
    [loop, n, pos, reduce]
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const base = Math.round(pos.get());
      if (!loop) {
        // Two phones: the arrows swing to the other one either way.
        const next = base + dir;
        springTo(next < 0 || next > n - 1 ? base - dir : next);
        return;
      }
      springTo(base + dir);
    },
    [loop, n, pos, springTo]
  );

  const goTo = useCallback(
    (i: number) => {
      const base = Math.round(pos.get());
      springTo(loop ? base + fold(i - mod(base, n), n) : i);
    },
    [loop, n, pos, springTo]
  );

  // Only turn by itself while someone can see it and is not busy with it.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const paused = reduce || !inView || hover || focusWithin || dragging;
  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => {
      if (document.visibilityState === 'visible') step(1);
    }, AUTO_MS);
    return () => window.clearTimeout(id);
  }, [paused, active, step]);

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    controls.current?.stop();
    const card = stageRef.current?.querySelector<HTMLElement>('[data-card]');
    drag.current = {
      x: e.clientX,
      start: pos.get(),
      moved: false,
      unit: (card?.offsetWidth ?? 260) * 1.1,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      d.moved = true;
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    let next = d.start - dx / d.unit;
    if (!loop) {
      // Past either end the arc resists instead of stopping dead.
      if (next < 0) next = next * 0.3;
      if (next > n - 1) next = n - 1 + (next - (n - 1)) * 0.3;
    }
    pos.set(next);
  }

  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    setDragging(false);
    justDragged.current = true;
    window.setTimeout(() => (justDragged.current = false), 0);
    const v = pos.getVelocity();
    // A flick carries on a little, but never more than one phone past a drag.
    const projected = pos.get() + Math.max(-1.2, Math.min(1.2, v * 0.18));
    springTo(Math.round(projected), v);
  }

  return (
    <div
      className='relative'
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setFocusWithin(false);
      }}
    >
      <div
        ref={stageRef}
        role='region'
        aria-roledescription='carousel'
        aria-label='The designs'
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            step(1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            step(-1);
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`phone-ring relative mx-auto w-full touch-pan-y select-none overflow-x-clip outline-none focus-visible:ring-2 focus-visible:ring-[#ff7e35]/50 ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={
          {
            '--w':
              n === 2
                ? 'clamp(168px, 46vw, 320px)'
                : 'clamp(208px, 58vw, 320px)',
            '--r': `calc(var(--w) * ${n === 2 ? 0.5 : n === 3 ? 1.42 : 1.3})`,
            height: 'calc(var(--w) * 1.25 + 88px)',
            perspective: '1300px',
            perspectiveOrigin: '50% 40%',
          } as React.CSSProperties
        }
      >
        {/* The floor the phones stand on. */}
        <div
          aria-hidden
          className='pointer-events-none absolute left-1/2 top-[calc(50%+var(--w)*0.66)] h-16 w-[min(760px,120vw)] -translate-x-1/2 -translate-y-1/2 rounded-[50%]'
          style={{
            background:
              'radial-gradient(closest-side, rgba(0,0,0,0.11), rgba(0,0,0,0.04) 55%, transparent)',
          }}
        />
        {items.map((item, i) => (
          <RingCard
            key={item.src}
            item={item}
            index={i}
            n={n}
            loop={loop}
            pos={pos}
            front={i === active}
            playing={i === active && inView}
            onSelect={() => {
              if (!justDragged.current && i !== active) goTo(i);
            }}
          />
        ))}
      </div>

      <div className='mx-auto mt-2 flex max-w-[560px] flex-col items-center px-6 text-center'>
        <div className='relative grid min-h-[72px] w-full place-items-start justify-center'>
          <AnimatePresence mode='popLayout' initial={false}>
            <motion.p
              key={active}
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: 6, filter: 'blur(3px)' }
              }
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: -6, filter: 'blur(3px)' }
              }
              transition={{
                duration: reduce ? 0.01 : 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className='col-start-1 row-start-1 text-[15px] leading-relaxed text-black/70 md:text-base'
              aria-live='polite'
            >
              <span className='mr-2 font-mono text-[11px] tracking-[0.14em] text-black/35'>
                {String(active + 1).padStart(2, '0')}/
                {String(n).padStart(2, '0')}
              </span>
              {items[active].caption}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className='mt-5 flex items-center gap-5'>
          <RingButton label='Previous design' onClick={() => step(-1)}>
            <ChevronLeft className='size-[18px]' strokeWidth={1.75} />
          </RingButton>
          <div className='flex items-center gap-2'>
            {items.map((item, i) => (
              <button
                key={item.src}
                type='button'
                aria-label={`Show design ${i + 1} of ${n}`}
                aria-current={i === active}
                onClick={() => goTo(i)}
                className='group grid h-8 place-items-center px-0.5'
              >
                <span
                  className={`block h-1.5 rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    i === active
                      ? 'bg-gradient-primary w-7'
                      : 'w-1.5 bg-black/15 group-hover:bg-black/35'
                  }`}
                />
              </button>
            ))}
          </div>
          <RingButton label='Next design' onClick={() => step(1)}>
            <ChevronRight className='size-[18px]' strokeWidth={1.75} />
          </RingButton>
        </div>
      </div>
    </div>
  );
}

function RingButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      aria-label={label}
      onClick={onClick}
      className='grid size-11 place-items-center rounded-full border border-black/10 bg-white text-black shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-[border-color,transform] duration-200 hover:border-black/30 active:scale-95'
    >
      {children}
    </button>
  );
}

function RingCard({
  item,
  index,
  n,
  loop,
  pos,
  front,
  playing,
  onSelect,
}: {
  item: RingItem;
  index: number;
  n: number;
  loop: boolean;
  pos: MotionValue<number>;
  front: boolean;
  playing: boolean;
  onSelect: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [wanted, setWanted] = useState(front);

  // Where on the ring this phone stands, as an angle from the front. Two
  // phones do not make a ring: they keep their side and swap depth instead.
  const angle = useTransform(pos, p => {
    const d = loop ? fold(index - p, n) : index - p;
    return loop ? (d * 2 * Math.PI) / n : Math.abs(d) * Math.PI * 0.5;
  });
  const transform = useTransform(angle, a => {
    const s = Math.sin(a);
    const c = Math.cos(a);
    if (!loop) {
      // --r is the sideways offset here, the depth follows how far back it is.
      const side = index === 0 ? -1 : 1;
      return `translate(-50%, -50%) translate3d(calc(var(--r) * ${side}), 0, calc(var(--w) * ${(-0.55 * s).toFixed(4)})) rotateY(${(side * s * 18).toFixed(2)}deg)`;
    }
    // Turned partly toward the viewer, so a side phone still shows its screen.
    return `translate(-50%, -50%) translate3d(calc(var(--r) * ${s.toFixed(4)}), 0, calc(var(--r) * ${(c - 1).toFixed(4)})) rotateY(${(s * 32).toFixed(2)}deg)`;
  });
  const facing = useTransform(angle, a => (Math.cos(a) + 1) / 2);
  const zIndex = useTransform(facing, f => Math.round(f * 100));
  const veil = useTransform(facing, f => (1 - f) * 0.32);
  const opacity = useTransform(facing, f => Math.min(1, f * 4));

  // Once a phone has been at the front it keeps its fully loaded video.
  if (front && !wanted) setWanted(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing]);

  return (
    <motion.div
      data-card
      onClick={onSelect}
      style={{ transform, zIndex, opacity }}
      className='absolute left-1/2 top-[calc(50%-12px)] aspect-[4/5] w-[var(--w)] will-change-transform'
    >
      <div className='relative h-full w-full overflow-hidden rounded-[28px] bg-[#f4f4f2] shadow-[0_1px_0_rgba(0,0,0,0.04),0_40px_70px_-34px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06]'>
        <video
          ref={videoRef}
          className='pointer-events-none block h-full w-full object-cover'
          // #t shows the first frame on iOS before anything plays.
          src={`${item.src}#t=0.001`}
          muted
          loop
          playsInline
          preload={wanted ? 'auto' : 'metadata'}
          aria-label={item.alt}
          draggable={false}
        />
        <motion.div
          aria-hidden
          style={{ opacity: veil }}
          className='pointer-events-none absolute inset-0 bg-white'
        />
      </div>
    </motion.div>
  );
}
