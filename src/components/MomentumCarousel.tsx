'use client';

import { Fragment, useEffect, useRef, type ReactNode } from 'react';

/**
 * A looping row you can throw. It drifts on its own, follows the pointer
 * while dragged, and on release keeps the throw's velocity and loses it
 * gradually, easing back into the drift instead of snapping.
 *
 * Children are rendered twice so the loop has no seam.
 */
export default function MomentumCarousel({
  children,
  drift = -35,
  className = '',
  style,
}: {
  children: ReactNode;
  /** Idle speed in px/s. Negative moves left. */
  drift?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const track = useRef<HTMLDivElement>(null);
  const state = useRef({
    x: 0,
    v: drift,
    dragging: false,
    hovering: false,
    lastX: 0,
    lastT: 0,
    moved: 0,
  });

  useEffect(() => {
    let raf = 0;
    let prev = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const s = state.current;
      const el = track.current;
      if (el && !s.dragging) {
        const target = s.hovering ? 0 : drift;
        // Friction: a throw bleeds off over about two seconds, then the
        // row settles back into its own slow drift.
        s.v = target + (s.v - target) * Math.exp(-dt * 1.6);
        s.x += s.v * dt;
      }
      if (el) {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          if (s.x <= -half) s.x += half;
          if (s.x > 0) s.x -= half;
        }
        el.style.transform = `translate3d(${s.x}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [drift]);

  const onPointerDown = (e: React.PointerEvent) => {
    const s = state.current;
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastT = performance.now();
    s.moved = 0;
    s.v = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.dragging) return;
    const now = performance.now();
    const dx = e.clientX - s.lastX;
    const dt = Math.max(1, now - s.lastT) / 1000;
    s.x += dx;
    s.moved += Math.abs(dx);
    // Capture only once this is a real drag. Capturing on press would send
    // the click to the row instead of the card under the pointer.
    const el = e.currentTarget as HTMLElement;
    if (s.moved > 6 && !el.hasPointerCapture(e.pointerId)) {
      el.setPointerCapture(e.pointerId);
    }
    // Smoothed pointer velocity, so the throw uses the last few moves.
    s.v = s.v * 0.6 + (dx / dt) * 0.4;
    s.lastX = e.clientX;
    s.lastT = now;
  };

  const endDrag = () => {
    const s = state.current;
    if (!s.dragging) return;
    s.dragging = false;
    // A pause before letting go means no throw.
    if (performance.now() - s.lastT > 80) s.v = 0;
  };

  return (
    <div
      className={`touch-pan-y cursor-grab select-none active:cursor-grabbing ${className}`}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={e => {
        if (e.pointerType === 'mouse') state.current.hovering = true;
      }}
      onPointerLeave={e => {
        if (e.pointerType === 'mouse') state.current.hovering = false;
        endDrag();
      }}
      // A drag must not also open the card under the pointer.
      onClickCapture={e => {
        if (state.current.moved > 6) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      onDragStart={e => e.preventDefault()}
    >
      <div
        ref={track}
        className='flex w-max items-center will-change-transform'
      >
        <Fragment key='a'>{children}</Fragment>
        <Fragment key='b'>{children}</Fragment>
      </div>
    </div>
  );
}
