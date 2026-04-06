'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface MacbookScrollProps {
  src: string;
  title?: string;
  showGradient?: boolean;
  className?: string;
}

export default function MacbookScroll({
  src,
  title,
  showGradient = true,
  className = '',
}: MacbookScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const scaleX = useTransform(
    scrollYProgress,
    [0, 0.3],
    [1.2, isMobile ? 1 : 1.5]
  );
  const scaleY = useTransform(
    scrollYProgress,
    [0, 0.3],
    [0.6, isMobile ? 1 : 1.5]
  );
  const rotate = useTransform(
    scrollYProgress,
    [0.1, 0.12, 0.3],
    [-28, -28, 0]
  );
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);

  return (
    <div
      ref={ref}
      className={`flex min-h-[200vh] flex-col items-center justify-start py-20 md:py-80 [perspective:800px] ${className}`}
    >
      <motion.h2
        style={{ translateY: textY, opacity: textOpacity }}
        className="mb-20 text-center text-3xl font-bold text-black"
      >
        {title || 'Scroll to reveal'}
      </motion.h2>

      <div className="relative [perspective:800px]">
        <div
          style={{
            transform: 'perspective(800px) rotateX(-25deg) translateZ(0px)',
            transformOrigin: 'bottom',
            transformStyle: 'preserve-3d',
          }}
          className="relative h-[12rem] w-[32rem] rounded-2xl bg-[#010101] p-2"
        >
          <div
            style={{ boxShadow: '0px 2px 0px 2px #171717 inset' }}
            className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#010101]"
          >
            <span className="text-white text-sm font-medium">DM</span>
          </div>
        </div>

        <motion.div
          style={{
            scaleX,
            scaleY,
            rotateX: rotate,
            transformStyle: 'preserve-3d',
            transformOrigin: 'top',
          }}
          className="absolute inset-0 h-96 w-[32rem] rounded-2xl bg-[#010101] p-2"
        >
          <div className="absolute inset-0 rounded-lg bg-[#272729]" />
          <img
            src={src}
            alt="screen content"
            className="absolute inset-0 h-full w-full rounded-lg object-cover object-left-top"
          />
        </motion.div>
      </div>

      <div className="relative -z-10 h-[22rem] w-[32rem] overflow-hidden rounded-2xl bg-gray-200">
        <div className="relative h-10 w-full">
          <div className="absolute inset-x-0 mx-auto h-4 w-[80%] bg-[#050505]" />
        </div>
        <div className="mx-auto my-1 h-32 w-[40%] rounded-xl" style={{ boxShadow: '0px 0px 1px 1px #00000020 inset' }} />
        <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tl-3xl rounded-tr-3xl bg-gradient-to-t from-[#272729] to-[#050505]" />
        {showGradient && (
          <div className="absolute inset-x-0 bottom-0 h-40 w-full bg-gradient-to-t from-white via-white to-transparent" />
        )}
      </div>
    </div>
  );
}
