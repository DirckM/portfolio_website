'use client';

interface ScrollRevealCSSProps {
  children?: React.ReactNode;
  /** Opacity of a word before its reveal starts. */
  baseOpacity?: number;
  /** Blur in px at the start of the reveal. */
  blurStrength?: number;
  /** How far in px each word rises as it reveals. */
  lift?: number;
  /** Percent of the view range each word waits behind the one before it. */
  stagger?: number;
  /** Percent into the word's `cover` range where the first word starts. */
  rangeStart?: number;
  /** Percent into the word's `cover` range where the first word finishes. */
  rangeEnd?: number;
  containerClassName?: string;
  textClassName?: string;
}

export default function ScrollRevealCSS({
  children = 'Every word here is revealed by the scrollbar, not by JavaScript',
  baseOpacity = 0.08,
  blurStrength = 6,
  lift = 14,
  stagger = 3,
  rangeStart = 20,
  rangeEnd = 48,
  containerClassName = '',
  textClassName = '',
}: ScrollRevealCSSProps) {
  const text = typeof children === 'string' ? children : '';

  // Split on whitespace but keep the whitespace tokens, so the spacing between
  // words survives without reinserting it by hand.
  let wordIndex = -1;
  const tokens = text.split(/(\s+)/).map((token, i) => {
    if (/^\s+$/.test(token) || token === '') return token;
    wordIndex += 1;
    return (
      <span
        key={i}
        className='srcss-word'
        style={{ '--i': String(wordIndex) } as React.CSSProperties}
      >
        {token}
      </span>
    );
  });

  return (
    <div
      className={`my-5 ${containerClassName}`}
      style={
        {
          // Every knob is a custom property, so the stylesheet below is byte
          // identical for every instance on the page. Two demos with different
          // props then cannot overwrite each other's rules.
          '--srcss-base': String(baseOpacity),
          '--srcss-blur': `${blurStrength}px`,
          '--srcss-lift': `${lift}px`,
          '--srcss-stagger': `${stagger}%`,
          '--srcss-start': `${rangeStart}%`,
          '--srcss-end': `${rangeEnd}%`,
        } as React.CSSProperties
      }
    >
      <p
        className={`text-[clamp(1.4rem,3.5vw,2.4rem)] leading-[1.6] font-semibold ${textClassName}`}
      >
        {tokens}
      </p>

      <style>{`
        .srcss-word {
          display: inline-block;
          opacity: var(--srcss-base);
          /* Longhands, not the shorthand: \`animation\` resets
             animation-timeline back to auto and would kill the effect. */
          animation-name: srcss-reveal;
          animation-fill-mode: both;
          animation-timing-function: linear;
          /* Each word is its own subject, so each word gets a timeline from
             its own trip across the scrollport. */
          animation-timeline: view();
          /* ...and --i slides that word's slice of the trip later, which is
             the stagger. */
          animation-range: cover calc(var(--srcss-start) + var(--i) * var(--srcss-stagger))
                           cover calc(var(--srcss-end) + var(--i) * var(--srcss-stagger));
        }

        @keyframes srcss-reveal {
          from {
            opacity: var(--srcss-base);
            filter: blur(var(--srcss-blur));
            transform: translateY(var(--srcss-lift));
          }
          to {
            opacity: 1;
            filter: blur(0px);
            transform: translateY(0);
          }
        }

        /* No scroll-driven animations: the animation has no duration, so it
           lands on its end state immediately and the text is simply there. */
        @supports not (animation-timeline: view()) {
          .srcss-word {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .srcss-word {
            animation-name: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
