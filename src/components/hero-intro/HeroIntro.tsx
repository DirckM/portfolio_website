'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

// Type and portrait sizes of the homepage hero.
const WORD =
  'text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-black leading-none select-none tracking-wider';
const DIRCK = `${WORD} font-[family-name:var(--font-inter)] font-bold`;
const MULDER = `${WORD} font-[family-name:var(--font-instrument-serif)] italic`;
const PHOTO_SIZE =
  'w-20 h-30 sm:w-24 sm:h-36 md:w-28 md:h-42 lg:w-32 lg:h-48 xl:w-36 xl:h-54';
const PHOTO_SRC = '/dirck_mulder_organge_light.jpg';

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

function Photo({ className = '' }: { className?: string }) {
  return (
    <Image
      src={PHOTO_SRC}
      alt='Dirck Mulder'
      width={160}
      height={240}
      priority
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

function Stack({
  photo,
  dirck,
  mulder,
}: {
  photo: React.ReactNode;
  dirck: React.ReactNode;
  mulder: React.ReactNode;
}) {
  return (
    <div className='relative flex flex-col items-center text-center'>
      <div className='absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2'>
        {photo}
      </div>
      {dirck}
      {mulder}
    </div>
  );
}

/* Letters that rise out of their own baseline, one after another. */
function RisingWord({
  text,
  className,
  delay,
}: {
  text: string;
  className: string;
  delay: number;
}) {
  return (
    <h1 className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className='-mb-[0.12em] -mr-[0.08em] inline-block overflow-hidden pb-[0.12em] pr-[0.08em] align-top'
        >
          <motion.span
            className='inline-block'
            initial={{ y: '110%', rotate: 6 }}
            animate={{ y: '0%', rotate: 0 }}
            transition={{
              duration: 1.1,
              delay: delay + i * 0.05,
              ease: EXPO_OUT,
            }}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

/* The homepage intro: the letters of the name rise out of their baseline,
   then the portrait opens from a slit into its pill. */
export default function HeroIntro() {
  return (
    <Stack
      photo={
        <motion.div
          initial={{ clipPath: 'inset(50% 0% 50% 0% round 999px)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0% round 999px)' }}
          transition={{ duration: 1.2, delay: 0.75, ease: EXPO_OUT }}
          className={`${PHOTO_SIZE} overflow-hidden rounded-full shadow-2xl`}
        >
          <motion.div
            className='h-full w-full'
            initial={{ scale: 1.35 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.6, delay: 0.75, ease: EXPO_OUT }}
          >
            <Photo />
          </motion.div>
        </motion.div>
      }
      dirck={<RisingWord text='DIRCK' className={DIRCK} delay={0.1} />}
      mulder={<RisingWord text='MULDER' className={MULDER} delay={0.3} />}
    />
  );
}
