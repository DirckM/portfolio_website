'use client';

import { useState, Suspense, lazy } from 'react';
import Link from 'next/link';
import type { ComponentCategory } from '@/lib/components-registry';
import LineWaves from '@/components/library/backgrounds/LineWaves';
import GlitchText from '@/components/library/text-animations/GlitchText';
import BlurText from '@/components/library/text-animations/BlurText';
import ElectricBorder from '@/components/library/animations/ElectricBorder';

// Lazy load heavy WebGL backgrounds
const SoftAurora = lazy(
  () => import('@/components/library/backgrounds/SoftAurora')
);
const ColorBends = lazy(
  () => import('@/components/library/backgrounds/ColorBends')
);
const DarkVeil = lazy(
  () => import('@/components/library/backgrounds/DarkVeil')
);
const LightPillar = lazy(
  () => import('@/components/library/backgrounds/LightPillar')
);
const EvilEye = lazy(() => import('@/components/library/backgrounds/EvilEye'));
const Radar = lazy(() => import('@/components/library/backgrounds/Radar'));

interface HeroCard {
  slug: string;
  name: string;
  category: ComponentCategory;
  fallbackBg: string;
  content: React.ReactNode;
}

function BgWrap({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: string;
}) {
  return (
    <Suspense
      fallback={
        <div className='w-full h-full' style={{ background: fallback }} />
      }
    >
      <div className='w-full h-full'>{children}</div>
    </Suspense>
  );
}

const heroCards: HeroCard[] = [
  {
    slug: 'soft-aurora',
    name: 'Soft Aurora',
    category: 'backgrounds',
    fallbackBg:
      'linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #0a1628 100%)',
    content: (
      <BgWrap fallback='linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #0a1628 100%)'>
        <SoftAurora />
      </BgWrap>
    ),
  },
  {
    slug: 'color-bends',
    name: 'Color Bends',
    category: 'backgrounds',
    fallbackBg:
      'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #ffe66d 100%)',
    content: (
      <BgWrap fallback='linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #ffe66d 100%)'>
        <ColorBends />
      </BgWrap>
    ),
  },
  {
    slug: 'glitch-text',
    name: 'Glitch Text',
    category: 'text',
    fallbackBg: '#000000',
    content: (
      <div className='w-full h-full bg-black flex items-center justify-center'>
        <GlitchText
          text='GLITCH'
          className='text-3xl font-bold text-white'
          speed={400}
        />
      </div>
    ),
  },
  {
    slug: 'dark-veil',
    name: 'Dark Veil',
    category: 'backgrounds',
    fallbackBg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
    content: (
      <BgWrap fallback='linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)'>
        <DarkVeil />
      </BgWrap>
    ),
  },
  {
    slug: 'light-pillar',
    name: 'Light Pillar',
    category: 'backgrounds',
    fallbackBg: 'linear-gradient(180deg, #000000 0%, #111133 100%)',
    content: (
      <BgWrap fallback='linear-gradient(180deg, #000000 0%, #111133 100%)'>
        <LightPillar />
      </BgWrap>
    ),
  },
  {
    slug: 'electric-border',
    name: 'Electric Border',
    category: 'animations',
    fallbackBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    content: (
      <div className='w-full h-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center'>
        <ElectricBorder color='#ffffff' duration={1.5} borderWidth={2}>
          <div className='px-6 py-4 text-white text-sm tracking-widest uppercase'>
            Electric
          </div>
        </ElectricBorder>
      </div>
    ),
  },
  {
    slug: 'evil-eye',
    name: 'Evil Eye',
    category: 'backgrounds',
    fallbackBg: 'linear-gradient(135deg, #1a0a0a 0%, #0a1a0a 100%)',
    content: (
      <BgWrap fallback='linear-gradient(135deg, #1a0a0a 0%, #0a1a0a 100%)'>
        <EvilEye />
      </BgWrap>
    ),
  },
  {
    slug: 'blur-text',
    name: 'Blur Text',
    category: 'text',
    fallbackBg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    content: (
      <div className='w-full h-full bg-gradient-to-br from-[#ffecd2] to-[#fcb69f] flex items-center justify-center'>
        <BlurText
          text='Hello World'
          className='text-2xl font-bold text-black/80'
          delay={0.08}
        />
      </div>
    ),
  },
  {
    slug: 'radar',
    name: 'Radar',
    category: 'backgrounds',
    fallbackBg: 'linear-gradient(135deg, #001a00 0%, #000a1a 100%)',
    content: (
      <BgWrap fallback='linear-gradient(135deg, #001a00 0%, #000a1a 100%)'>
        <Radar />
      </BgWrap>
    ),
  },
  {
    slug: 'line-waves',
    name: 'Line Waves',
    category: 'backgrounds',
    fallbackBg: '#0f0f0f',
    content: (
      <div className='w-full h-full bg-[#0f0f0f]'>
        <LineWaves
          lineCount={6}
          lineColor='rgba(255,255,255,0.3)'
          amplitude={30}
          speed={0.03}
        />
      </div>
    ),
  },
  {
    slug: 'tilted-card',
    name: 'Tilted Card',
    category: 'components',
    fallbackBg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    content: (
      <div className='w-full h-full bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] flex items-center justify-center'>
        <div className='w-[60%] h-[50%] rounded-xl bg-white shadow-2xl flex items-center justify-center'>
          <span className='text-black/50 text-xs'>3D Card</span>
        </div>
      </div>
    ),
  },
];

export default function Hero3DCarousel() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const duplicatedCards = [...heroCards, ...heroCards];

  return (
    <section className='relative h-screen flex flex-col justify-between overflow-hidden bg-white'>
      <div className='h-20' />

      <div className='flex-1 flex items-center justify-center overflow-hidden'>
        <div
          className='w-full h-[70%] flex items-center overflow-hidden'
          style={{
            maskImage:
              'linear-gradient(to right, rgba(0,0,0,0) 0%, rgb(0,0,0) 12.5%, rgb(0,0,0) 87.5%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, rgba(0,0,0,0) 0%, rgb(0,0,0) 12.5%, rgb(0,0,0) 87.5%, rgba(0,0,0,0) 100%)',
          }}
        >
          <div
            className='flex items-center gap-0 select-none'
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              setIsPaused(false);
              setHoveredIndex(null);
            }}
            style={{
              animation: `hero-scroll ${heroCards.length * 8}s linear infinite`,
              animationPlayState: isPaused ? 'paused' : 'running',
              width: 'fit-content',
            }}
          >
            {duplicatedCards.map((card, i) => {
              const isHovered = hoveredIndex === i;

              return (
                <figure
                  key={`${card.slug}-${i}`}
                  className='shrink-0 relative'
                  style={{
                    width: '220px',
                    height: '300px',
                    margin: '0',
                    transform: isHovered
                      ? 'perspective(1143px) rotateY(-30deg) skewY(12deg) scale(1.08) translateY(-15px)'
                      : 'perspective(1143px) rotateY(-50deg) skewY(20deg)',
                    willChange: 'transform',
                    opacity: isHovered ? 1 : 0.85,
                    transition:
                      'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.3s ease',
                    zIndex: isHovered ? 10 : 0,
                  }}
                >
                  <Link
                    href={`/components/${card.slug}`}
                    className='no-underline block w-full h-full'
                    draggable={false}
                  >
                    <div
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className='relative w-full h-full overflow-hidden'
                      style={{ background: card.fallbackBg }}
                    >
                      <div className='absolute inset-0'>{card.content}</div>
                    </div>
                  </Link>
                </figure>
              );
            })}
          </div>
        </div>
      </div>

      <div className='flex items-end justify-between px-6 pb-6'>
        <p className='text-lg text-black'>
          A{' '}
          <span className='font-[family-name:var(--font-instrument-serif)] italic'>
            collection
          </span>{' '}
          of components I find{' '}
          <span className='font-[family-name:var(--font-instrument-serif)] italic'>
            beautiful
          </span>
        </p>
        <button
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
          }
          className='text-sm text-library-gray hover:text-black transition-colors flex items-center gap-1'
        >
          Scroll & explore
          <span className='text-xs'>&#8595;</span>
        </button>
      </div>

      <style>{`
        @keyframes hero-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
