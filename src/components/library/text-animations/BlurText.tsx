'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'characters';
  direction?: 'top' | 'bottom';
}

export default function BlurText({
  text,
  delay = 0.05,
  className = '',
  animateBy = 'words',
  direction = 'bottom',
}: BlurTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const segments = animateBy === 'words' ? text.split(' ') : text.split('');

  const yOffset = direction === 'top' ? -20 : 20;

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      {segments.map((segment, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: 'blur(12px)', y: yOffset }}
          animate={
            isInView
              ? { opacity: 1, filter: 'blur(0px)', y: 0 }
              : { opacity: 0, filter: 'blur(12px)', y: yOffset }
          }
          transition={{
            duration: 0.5,
            delay: i * delay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className='inline-block'
        >
          {segment}
          {animateBy === 'words' && i < segments.length - 1 && (
            <span>&nbsp;</span>
          )}
        </motion.span>
      ))}
    </div>
  );
}
