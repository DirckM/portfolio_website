'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ComponentCategory } from '@/lib/components-registry';
import BlurText from '@/components/library/text-animations/BlurText';
import GlitchText from '@/components/library/text-animations/GlitchText';
import ElectricBorder from '@/components/library/animations/ElectricBorder';
import LineWaves from '@/components/library/backgrounds/LineWaves';

interface HeroCard {
  slug: string;
  name: string;
  category: ComponentCategory;
  background: string;
  content?: React.ReactNode;
  hoverContent: React.ReactNode;
}

const heroCards: HeroCard[] = [
  {
    slug: 'line-waves',
    name: 'Line Waves',
    category: 'backgrounds',
    background:
      'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
    content: (
      <svg viewBox='0 0 200 250' className='w-full h-full opacity-40'>
        {[...Array(8)].map((_, i) => (
          <path
            key={i}
            d={`M0 ${80 + i * 20} Q50 ${60 + i * 20 + Math.sin(i) * 15} 100 ${80 + i * 20} T200 ${80 + i * 20}`}
            fill='none'
            stroke='rgba(255,255,255,0.3)'
            strokeWidth='1'
          />
        ))}
      </svg>
    ),
    hoverContent: (
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
    slug: 'electric-border',
    name: 'Electric Border',
    category: 'animations',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    content: (
      <div className='absolute inset-8 rounded-lg border-2 border-white/30 flex items-center justify-center'>
        <span className='text-white/80 text-sm tracking-widest uppercase'>
          Electric
        </span>
      </div>
    ),
    hoverContent: (
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
    slug: 'glitch-text',
    name: 'Glitch Text',
    category: 'text',
    background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
    content: (
      <div className='flex items-center justify-center w-full h-full'>
        <span
          className='text-3xl font-bold text-white tracking-tight'
          style={{ textShadow: '-2px 0 #ff0000, 2px 0 #0000ff' }}
        >
          GLITCH
        </span>
      </div>
    ),
    hoverContent: (
      <div className='w-full h-full bg-black flex items-center justify-center'>
        <GlitchText
          text='GLITCH'
          className='text-3xl font-bold text-white'
          speed={300}
        />
      </div>
    ),
  },
  {
    slug: 'tilted-card',
    name: 'Tilted Card',
    category: 'components',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    content: (
      <div className='absolute inset-6 rounded-xl bg-white shadow-2xl flex items-center justify-center'>
        <span className='text-black/60 text-sm'>3D Card</span>
      </div>
    ),
    hoverContent: (
      <div className='w-full h-full bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] flex items-center justify-center'>
        <div className='w-[70%] h-[60%] rounded-xl bg-white shadow-2xl flex items-center justify-center animate-[tiltHover_2s_ease-in-out_infinite]'>
          <span className='text-black/50 text-xs'>Tilting</span>
        </div>
      </div>
    ),
  },
  {
    slug: 'blur-text',
    name: 'Blur Text',
    category: 'text',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    content: (
      <div className='flex items-center justify-center w-full h-full'>
        <span
          className='text-2xl font-bold text-black/70'
          style={{ filter: 'blur(0.5px)' }}
        >
          Hello World
        </span>
      </div>
    ),
    hoverContent: (
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
    slug: 'macbook-scroll',
    name: 'MacBook Scroll',
    category: 'blocks',
    background: 'linear-gradient(180deg, #2d3436 0%, #000000 100%)',
    content: (
      <div className='flex flex-col items-center justify-center w-full h-full gap-2'>
        <div className='w-16 h-10 rounded-t-md bg-[#333] border border-[#555] border-b-0' />
        <div className='w-20 h-1 rounded-full bg-[#444]' />
      </div>
    ),
    hoverContent: (
      <div className='w-full h-full bg-gradient-to-b from-[#2d3436] to-black flex flex-col items-center justify-center gap-2'>
        <div className='w-16 h-10 rounded-t-md bg-[#333] border border-[#555] border-b-0 animate-pulse' />
        <div className='w-20 h-1 rounded-full bg-[#555]' />
        <span className='text-white/30 text-[8px] mt-2'>Scroll to open</span>
      </div>
    ),
  },
  {
    slug: 'pixel-trail',
    name: 'Pixel Trail',
    category: 'animations',
    background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
    content: (
      <div className='absolute inset-0 overflow-hidden'>
        {[12, 25, 40, 55, 70, 85, 15, 48, 63, 78].map((left, i) => (
          <div
            key={i}
            className='absolute bg-white/20'
            style={{
              width: `${10 + (i % 4) * 3}px`,
              height: `${10 + (i % 3) * 4}px`,
              left: `${left}%`,
              top: `${(i * 17 + 8) % 90}%`,
            }}
          />
        ))}
      </div>
    ),
    hoverContent: (
      <div className='w-full h-full bg-black relative overflow-hidden'>
        {[8, 22, 35, 48, 62, 75, 88, 14, 42, 56, 70, 84].map((left, i) => (
          <div
            key={i}
            className='absolute bg-white animate-pulse'
            style={{
              width: `${8 + (i % 3) * 4}px`,
              height: `${8 + (i % 4) * 3}px`,
              left: `${left}%`,
              top: `${(i * 14 + 5) % 90}%`,
              animationDelay: `${(i * 0.2) % 2}s`,
              animationDuration: `${0.8 + (i % 3) * 0.5}s`,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    slug: 'meta-balls',
    name: 'Meta Balls',
    category: 'animations',
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    content: (
      <div className='relative w-full h-full flex items-center justify-center'>
        <div
          className='absolute w-20 h-20 rounded-full bg-[#ff6b6b]/40 blur-md'
          style={{ top: '30%', left: '25%' }}
        />
        <div
          className='absolute w-16 h-16 rounded-full bg-[#4ecdc4]/40 blur-md'
          style={{ top: '45%', left: '50%' }}
        />
        <div
          className='absolute w-14 h-14 rounded-full bg-[#ffe66d]/40 blur-md'
          style={{ top: '35%', left: '40%' }}
        />
      </div>
    ),
    hoverContent: (
      <div className='w-full h-full bg-gradient-to-br from-[#a8edea] to-[#fed6e3] relative overflow-hidden'>
        <div
          className='absolute w-24 h-24 rounded-full bg-[#ff6b6b]/50 blur-lg animate-bounce'
          style={{ top: '25%', left: '20%', animationDuration: '3s' }}
        />
        <div
          className='absolute w-20 h-20 rounded-full bg-[#4ecdc4]/50 blur-lg animate-bounce'
          style={{
            top: '40%',
            left: '45%',
            animationDuration: '2.5s',
            animationDelay: '0.5s',
          }}
        />
        <div
          className='absolute w-16 h-16 rounded-full bg-[#ffe66d]/50 blur-lg animate-bounce'
          style={{
            top: '30%',
            left: '35%',
            animationDuration: '2s',
            animationDelay: '1s',
          }}
        />
      </div>
    ),
  },
  {
    slug: 'shape-blur',
    name: 'Shape Blur',
    category: 'animations',
    background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    content: (
      <div className='relative w-full h-full'>
        <div
          className='absolute w-32 h-32 rounded-full bg-purple-400/30 blur-xl'
          style={{ top: '20%', left: '10%' }}
        />
        <div
          className='absolute w-24 h-24 rounded-full bg-blue-400/30 blur-xl'
          style={{ top: '40%', left: '50%' }}
        />
      </div>
    ),
    hoverContent: (
      <div className='w-full h-full bg-gradient-to-br from-[#e0c3fc] to-[#8ec5fc] relative overflow-hidden'>
        <div
          className='absolute w-36 h-36 rounded-full bg-purple-500/40 blur-2xl animate-pulse'
          style={{ top: '15%', left: '5%', animationDuration: '2s' }}
        />
        <div
          className='absolute w-28 h-28 rounded-full bg-blue-500/40 blur-2xl animate-pulse'
          style={{
            top: '35%',
            left: '45%',
            animationDuration: '2.5s',
            animationDelay: '0.3s',
          }}
        />
      </div>
    ),
  },
  {
    slug: 'magic-rings',
    name: 'Magic Rings',
    category: 'animations',
    background:
      'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    content: (
      <div className='flex items-center justify-center w-full h-full'>
        {[60, 80, 100].map((size, i) => (
          <div
            key={i}
            className='absolute rounded-full border border-white/20'
            style={{ width: `${size}px`, height: `${size}px` }}
          />
        ))}
      </div>
    ),
    hoverContent: (
      <div className='w-full h-full bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center'>
        {[50, 70, 90, 110].map((size, i) => (
          <div
            key={i}
            className='absolute rounded-full border border-white/25'
            style={{
              width: `${size}px`,
              height: `${size}px`,
              animation: `spin ${3 + i}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    slug: 'flowing-menu',
    name: 'Flowing Menu',
    category: 'components',
    background:
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fdfcfb 100%)',
    content: (
      <div className='flex flex-col items-start justify-center w-full h-full px-8 gap-3'>
        {['Home', 'About', 'Work'].map((item, i) => (
          <div key={i} className='text-black/50 text-sm font-medium'>
            {item}
          </div>
        ))}
      </div>
    ),
    hoverContent: (
      <div className='w-full h-full bg-gradient-to-br from-[#ff9a9e] via-[#fecfef] to-[#fdfcfb] flex flex-col items-start justify-center px-8 gap-3'>
        {['Home', 'About', 'Work', 'Contact'].map((item, i) => (
          <div
            key={i}
            className='text-black/70 text-sm font-medium'
            style={{
              animation: `slideInLeft 0.4s ease-out both`,
              animationDelay: `${i * 0.1}s`,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    ),
  },
];

export default function Hero3DCarousel() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverCount, setHoverCount] = useState(0);
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
                      onMouseEnter={() => {
                        setHoveredIndex(i);
                        setHoverCount(c => c + 1);
                      }}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className='relative w-full h-full'
                      style={{ background: card.background }}
                    >
                      <div className='absolute inset-0'>
                        {isHovered ? (
                          <div
                            key={`hover-${i}-${hoverCount}`}
                            className='w-full h-full'
                          >
                            {card.hoverContent}
                          </div>
                        ) : (
                          card.content
                        )}
                      </div>
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
