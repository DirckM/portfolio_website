'use client';

import type { ReactNode } from 'react';

interface GradientBorderCSSProps {
  /** Card content. Falls back to a small sample card. */
  children?: ReactNode;
  /** Colours of the sweep, in order. The first is repeated at the end so the loop has no seam. */
  colors?: string[];
  /** Thickness of the ring in px. */
  borderWidth?: number;
  /** Corner radius of the card in px. */
  borderRadius?: number;
  /** Seconds for one full turn. */
  duration?: number;
  /** Blur radius in px of the halo behind the card. 0 turns it off. */
  glow?: number;
  /** Fill behind the content. */
  background?: string;
  /** Hold the sweep still until the card is hovered. */
  spinOnHover?: boolean;
  /**
   * Animate the registered `<angle>` property. Set to false to animate an
   * unregistered custom property of the same value instead, which is the
   * version that does not work and is here to show why.
   */
  typed?: boolean;
  className?: string;
  contentClassName?: string;
}

const SAMPLE = (
  <>
    <p className='text-xs uppercase tracking-[0.18em] text-white/40'>
      Registered
    </p>
    <p className='mt-2 text-lg font-semibold text-white'>One typed angle</p>
    <p className='mt-1 text-sm leading-relaxed text-white/55'>
      The ring is a single conic gradient. Only its start angle moves.
    </p>
  </>
);

export default function GradientBorderCSS({
  children,
  colors = ['#5227FF', '#FF9FFC', '#38bdf8'],
  borderWidth = 2,
  borderRadius = 18,
  duration = 6,
  glow = 18,
  background = '#0b0b0f',
  spinOnHover = false,
  typed = true,
  className = '',
  contentClassName = '',
}: GradientBorderCSSProps) {
  // Repeat the first colour at the end, otherwise the last stop meets the
  // first one at 0deg and the sweep has a visible seam running through it.
  const stops = [...colors, colors[0]].join(', ');
  const angle = typed ? 'var(--gbcss-angle)' : 'var(--gbcss-raw)';
  const sweep = `conic-gradient(from ${angle}, ${stops})`;

  return (
    <div
      className={`gbcss-root ${className}`}
      data-typed={typed ? 'true' : 'false'}
      data-hover={spinOnHover ? 'true' : 'false'}
      style={
        {
          // Every knob is a custom property, so the stylesheet below is byte
          // identical for every instance. Two cards with different props on
          // one page then cannot overwrite each other's rules.
          '--gbcss-radius': `${borderRadius}px`,
          '--gbcss-width': `${borderWidth}px`,
          '--gbcss-duration': `${duration}s`,
          '--gbcss-blur': `${glow}px`,
          '--gbcss-bg': background,
        } as React.CSSProperties
      }
    >
      {glow > 0 && (
        <div
          aria-hidden
          className='gbcss-glow'
          style={{ backgroundImage: sweep }}
        />
      )}

      {/* backgroundColor is the fallback, not decoration. Without @property
          the conic gradient references an undefined custom property, the whole
          background-image is thrown away, and this solid colour is what keeps
          a real border on the card. */}
      <div
        aria-hidden
        className='gbcss-ring'
        style={{ backgroundImage: sweep, backgroundColor: colors[0] }}
      />

      <div className={`gbcss-content ${contentClassName}`}>
        {children ?? SAMPLE}
      </div>

      <style>{`
        /* The whole post in five lines. An unregistered custom property is a
           string, and there is no halfway point between two strings, so an
           animation on one flips rather than sweeps. Give it a type and the
           browser interpolates it like any other angle. */
        @property --gbcss-angle {
          syntax: '<angle>';
          inherits: true;
          initial-value: 0deg;
        }

        .gbcss-root {
          /* The untyped twin, declared here so the broken version has
             somewhere to start. Deliberately never registered. */
          --gbcss-raw: 0deg;
          position: relative;
          box-sizing: border-box;
          /* A stacking context, so the glow's negative z-index stays inside
             the card instead of sliding behind whatever is on the page. */
          isolation: isolate;
          border-radius: var(--gbcss-radius);
          padding: var(--gbcss-width);
          animation-name: gbcss-spin;
          animation-duration: var(--gbcss-duration);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .gbcss-root[data-typed='false'] {
          animation-name: gbcss-spin-raw;
        }

        /* Pausing an animation costs nothing and needs no state, so hover is
           a play state rather than a second animation. */
        .gbcss-root[data-hover='true'] {
          animation-play-state: paused;
        }

        .gbcss-root[data-hover='true']:hover {
          animation-play-state: running;
        }

        @keyframes gbcss-spin {
          to { --gbcss-angle: 360deg; }
        }

        @keyframes gbcss-spin-raw {
          to { --gbcss-raw: 360deg; }
        }

        .gbcss-glow,
        .gbcss-ring {
          position: absolute;
          inset: 0;
          box-sizing: border-box;
          border-radius: inherit;
          pointer-events: none;
        }

        .gbcss-ring {
          padding: var(--gbcss-width);
          /* Two copies of the same mask, one clipped to the content box, and
             the inner one subtracted from the outer. What survives is exactly
             the padding ring, corners included. */
          -webkit-mask: linear-gradient(#000 0 0) content-box,
                        linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box,
                linear-gradient(#000 0 0);
          mask-composite: exclude;
        }

        .gbcss-glow {
          z-index: -1;
          filter: blur(var(--gbcss-blur));
          opacity: 0.5;
        }

        .gbcss-content {
          position: relative;
          height: 100%;
          box-sizing: border-box;
          background: var(--gbcss-bg);
          /* Inner radius is the outer one minus the ring, or the corners of
             the fill sit proud of the corners of the border. */
          border-radius: calc(var(--gbcss-radius) - var(--gbcss-width));
        }

        @media (prefers-reduced-motion: reduce) {
          /* The gradient is the point, the rotation is the flourish. Keep the
             first and drop the second. */
          .gbcss-root {
            animation-name: none;
          }
        }
      `}</style>
    </div>
  );
}
