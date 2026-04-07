'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { type ComponentCategory } from '@/lib/components-registry';

interface ComponentCardProps {
  name: string;
  slug: string;
  category: ComponentCategory;
  children: React.ReactNode;
  perspective?: boolean;
}

export default function ComponentCard({
  name: _name,
  slug,
  children,
  perspective = false,
}: ComponentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current || !perspective) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(((y - centerY) / centerY) * -8);
    setRotateY(((x - centerX) / centerX) * 8);
  }

  function handleMouseLeave() {
    setRotateX(0);
    setRotateY(0);
  }

  return (
    <Link href={`/components/${slug}`} className='no-underline'>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className='relative overflow-hidden rounded-xl border border-library-border bg-library-cream aspect-[4/3] cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary/25'
        style={{
          transform: perspective
            ? `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
            : undefined,
          transition: 'transform 0.15s ease-out, box-shadow 0.3s ease',
        }}
      >
        <div className='absolute inset-0 flex items-center justify-center overflow-hidden p-4'>
          {children}
        </div>
      </div>
    </Link>
  );
}
