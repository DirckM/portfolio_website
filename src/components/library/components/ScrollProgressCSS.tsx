'use client';

import type { ReactNode } from 'react';

interface ScrollProgressCSSProps {
  /** Content of the scroll container the bar reports on. */
  children?: ReactNode;
  /** `bar` fills a line across the top, `ring` sweeps a circle. */
  variant?: 'bar' | 'ring';
  /** Thickness of the bar, or stroke width of the ring, in px. */
  thickness?: number;
  /** Colour of the filled part. */
  color?: string;
  /** Colour of the unfilled track behind it. */
  trackColor?: string;
  /** Height of the demo scroll container in px. */
  height?: number;
  /** Outer diameter of the ring in px. Ignored by the bar variant. */
  ringSize?: number;
  /** Pin the indicator to the top of the scroller. Off, it scrolls away. */
  sticky?: boolean;
  className?: string;
  contentClassName?: string;
}

const SAMPLE = (
  <>
    <h3 className='text-lg font-semibold text-black'>Reading position</h3>
    <p className='mt-3 text-sm leading-relaxed text-black/70'>
      The indicator above is driven by this box, not by a listener. Its
      animation is attached to a scroll progress timeline, so the browser maps
      the scroll offset of the nearest scroll container onto the animation and
      keeps the two in step itself.
    </p>
    <p className='mt-3 text-sm leading-relaxed text-black/70'>
      Nothing here runs on the main thread. There is no scroll handler, no
      requestAnimationFrame loop and no throttle, which is the usual reason a
      progress bar on a heavy page lags a frame or two behind the content it is
      supposed to be measuring.
    </p>
    <p className='mt-3 text-sm leading-relaxed text-black/70'>
      Because the timeline is the scrollbar itself, the indicator is exact at
      both ends by construction. It reads zero at the top and one at the bottom,
      and it cannot drift out of sync when the content resizes under it.
    </p>
    <p className='mt-3 text-sm leading-relaxed text-black/70'>
      Scroll back up and the fill runs backwards at the same rate. A timeline is
      a mapping rather than a playback, so reversing the input reverses the
      output with no extra code.
    </p>
    <p className='mt-3 text-sm leading-relaxed text-black/70'>
      That is the whole component. Two keyframes, one timeline and a sticky
      wrapper to keep the thing on screen while you read.
    </p>
  </>
);

export default function ScrollProgressCSS({
  children,
  variant = 'bar',
  thickness = 6,
  color = '#000000',
  trackColor = 'rgba(0, 0, 0, 0.08)',
  height = 280,
  ringSize = 44,
  sticky = true,
  className = '',
  contentClassName = '',
}: ScrollProgressCSSProps) {
  // Ring geometry in px, so the viewBox is 1:1 with the rendered size and the
  // stroke width can be the same number the bar variant uses.
  const radius = Math.max((ringSize - thickness) / 2, 1);

  return (
    <div
      className={`spcss-root ${className}`}
      style={
        {
          // Every knob is a custom property, so the stylesheet below is byte
          // identical for every instance. Two demos with different props on
          // one page then cannot overwrite each other's rules.
          '--spcss-thickness': `${thickness}px`,
          '--spcss-color': color,
          '--spcss-track': trackColor,
          '--spcss-height': `${height}px`,
          '--spcss-position': sticky ? 'sticky' : 'static',
        } as React.CSSProperties
      }
    >
      <div className='spcss-scroller'>
        <div className={variant === 'ring' ? 'spcss-head-ring' : 'spcss-head'}>
          {variant === 'bar' ? (
            <div className='spcss-track'>
              <div className='spcss-fill' />
            </div>
          ) : (
            <svg
              className='spcss-ring'
              width={ringSize}
              height={ringSize}
              viewBox={`0 0 ${ringSize} ${ringSize}`}
              aria-hidden
            >
              <circle
                className='spcss-ring-track'
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
              />
              {/* pathLength normalises the circumference to 1, so the dash
                  keyframes are 1 to 0 whatever the radius is. */}
              <circle
                className='spcss-ring-fill'
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                pathLength={1}
              />
            </svg>
          )}
        </div>

        <div className={`spcss-content ${contentClassName}`}>
          {children ?? SAMPLE}
        </div>
      </div>

      <style>{`
        .spcss-scroller {
          height: var(--spcss-height);
          overflow-y: auto;
          position: relative;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #ffffff;
        }

        .spcss-head {
          position: var(--spcss-position);
          top: 0;
          z-index: 2;
          /* Opaque, so the text passes behind the track rather than through
             it. No overflow property here on purpose, see .spcss-track. */
          background: #ffffff;
        }

        /* Zero height so the ring floats over the text instead of pushing it
           down, and the sticky box still tracks the top of the scroller. */
        .spcss-head-ring {
          position: var(--spcss-position);
          top: 0;
          z-index: 2;
          height: 0;
          display: flex;
          justify-content: flex-end;
          padding-right: 12px;
        }

        .spcss-track {
          height: var(--spcss-thickness);
          background: var(--spcss-track);
          /* clip, not hidden: \`overflow: hidden\` would make this a scroll
             container, and scroll(nearest) would then resolve to this 6px box
             instead of the scroller, leaving the fill dead at zero. */
          overflow: clip;
        }

        .spcss-fill {
          height: 100%;
          background: var(--spcss-color);
          /* Base state is empty, which is also what a browser without
             scroll-driven animations and a scroller with nothing to scroll
             both fall back to. */
          transform: scaleX(0);
          transform-origin: 0 50%;
          will-change: transform;
          /* Longhands, not the shorthand: \`animation\` resets
             animation-timeline back to auto and silently kills the effect. */
          animation-name: spcss-fill;
          animation-fill-mode: both;
          animation-timing-function: linear;
          /* scroll() is scroll(nearest block), so this reads the scroller
             above rather than the page. */
          animation-timeline: scroll();
        }

        @keyframes spcss-fill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        .spcss-ring {
          margin-top: 12px;
          padding: 5px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.12);
          /* Start the sweep at twelve o'clock. A circle is rotation
             invariant, so the chip behind it does not care. */
          transform: rotate(-90deg);
        }

        .spcss-ring circle {
          fill: none;
          stroke-width: var(--spcss-thickness);
        }

        .spcss-ring-track {
          stroke: var(--spcss-track);
        }

        .spcss-ring-fill {
          stroke: var(--spcss-color);
          stroke-linecap: round;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation-name: spcss-ring;
          animation-fill-mode: both;
          animation-timing-function: linear;
          animation-timeline: scroll();
        }

        @keyframes spcss-ring {
          from { stroke-dashoffset: 1; }
          to { stroke-dashoffset: 0; }
        }

        .spcss-content {
          padding: 18px 20px 28px;
        }

        /* No prefers-reduced-motion rule on purpose. This only moves while
           the reader is already scrolling, exactly like the scrollbar. */

        /* Without scroll-driven animations the indicator would sit at zero for
           ever, which reads as a broken bar. Better to have no bar. */
        @supports not (animation-timeline: scroll()) {
          .spcss-track,
          .spcss-ring {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
