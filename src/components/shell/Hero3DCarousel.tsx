'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import ComponentCard from './ComponentCard';
import { getFeaturedComponents } from '@/lib/components-registry';

interface Hero3DCarouselProps {
  componentPreviews: Record<string, React.ReactNode>;
}

export default function Hero3DCarousel({
  componentPreviews,
}: Hero3DCarouselProps) {
  const featured = getFeaturedComponents();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative h-screen flex flex-col justify-between overflow-hidden">
      <div className="h-20" />

      <div className="flex-1 flex items-center">
        <div
          ref={scrollRef}
          className="flex gap-6 px-12 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none' }}
        >
          {featured.map((component, i) => (
            <motion.div
              key={component.slug}
              className="shrink-0 w-[280px]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              style={{
                transform: `perspective(1200px) rotateY(${(i - Math.floor(featured.length / 2)) * 4}deg)`,
              }}
            >
              <ComponentCard
                name={component.name}
                slug={component.slug}
                category={component.category}
                perspective
              >
                {componentPreviews[component.slug] || (
                  <div className="text-library-gray text-sm">
                    {component.name}
                  </div>
                )}
              </ComponentCard>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between px-6 pb-6">
        <p className="font-[family-name:var(--font-instrument-serif)] italic text-lg text-black">
          A collection of components I find beautiful
        </p>
        <button
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
          }
          className="text-sm text-library-gray hover:text-black transition-colors flex items-center gap-1"
        >
          Scroll & explore
          <span className="text-xs">&#8595;</span>
        </button>
      </div>
    </section>
  );
}
