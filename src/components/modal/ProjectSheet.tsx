'use client';

import Image from 'next/image';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import { useEffect } from 'react';

export interface SheetProject {
  title: string;
  description: string;
  cardBg: string;
  media: { type: 'image' | 'video'; src: string; alt?: string };
  content: {
    description: string;
    technologies: string[];
    features: string[];
    link: string | null;
  };
}

const EXPO = [0.16, 1, 0.3, 1] as const;

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.28 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EXPO } },
};

export function Media({
  project,
  className = '',
}: {
  project: SheetProject;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: project.cardBg }}
    >
      {project.media.type === 'video' ? (
        <video
          src={project.media.src}
          autoPlay
          muted
          loop
          playsInline
          className='absolute inset-0 m-auto max-h-[calc(100%-48px)] max-w-[calc(100%-48px)] rounded-xl object-contain shadow-2xl'
        />
      ) : (
        <Image
          src={project.media.src}
          alt={project.media.alt || project.title}
          fill
          sizes='(max-width: 768px) 100vw, 50vw'
          className='object-contain p-10'
        />
      )}
    </div>
  );
}

/** Title, story, features and stack, revealed in a short cascade. */
export function Body({
  project,
  wide = false,
}: {
  project: SheetProject;
  wide?: boolean;
}) {
  const { content } = project;
  return (
    <motion.div variants={stagger} initial='hidden' animate='show'>
      <motion.h2
        variants={rise}
        className='text-4xl font-bold tracking-tight text-black md:text-5xl font-[family-name:var(--font-inter)]'
      >
        {project.title}
      </motion.h2>
      <motion.p
        variants={rise}
        className='mt-2 text-2xl italic text-library-gray font-[family-name:var(--font-instrument-serif)]'
      >
        {project.description}
      </motion.p>

      {content.link && (
        <motion.a
          variants={rise}
          href={content.link}
          // Links inside the site stay in this tab.
          {...(content.link.startsWith('/')
            ? {}
            : { target: '_blank', rel: 'noopener noreferrer' })}
          className='mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm text-white no-underline transition-colors hover:bg-neutral-800'
        >
          View project <ArrowUpRight size={16} />
        </motion.a>
      )}

      <motion.p
        variants={rise}
        className='mt-8 text-[15px] leading-relaxed text-black/75 [&_strong]:font-semibold [&_strong]:text-black'
        dangerouslySetInnerHTML={{ __html: content.description }}
      />

      <div className={wide ? 'mt-10 grid gap-10 md:grid-cols-2' : 'mt-10'}>
        {content.features.length > 0 && (
          <motion.div variants={rise}>
            <h3 className='mb-3 text-[11px] uppercase tracking-[0.2em] text-library-gray'>
              What it does
            </h3>
            <ol className='border-t border-library-border'>
              {content.features.map((f, i) => (
                <li
                  key={f}
                  className='flex gap-4 border-b border-library-border py-3 text-sm text-black'
                >
                  <span className='w-5 shrink-0 tabular-nums text-library-gray'>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {f}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
        {content.technologies.length > 0 && (
          <motion.div variants={rise} className={wide ? '' : 'mt-10'}>
            <h3 className='mb-3 text-[11px] uppercase tracking-[0.2em] text-library-gray'>
              Built with
            </h3>
            <div className='flex flex-wrap gap-2'>
              {content.technologies.map(t => (
                <span
                  key={t}
                  className='rounded-full border border-library-border px-3 py-1.5 text-xs text-black'
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function CloseButton({
  onClose,
  className = '',
}: {
  onClose: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClose}
      aria-label='Close'
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black shadow-md backdrop-blur transition-transform hover:scale-105 ${className}`}
    >
      <X size={18} />
    </button>
  );
}

export default function ProjectSheet({
  open,
  project,
  onClose,
}: {
  open: boolean;
  project: SheetProject | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Split: the image slides in from the left and the text from the right,
  // meeting in the middle. Closing plays it back out.
  const slide = { duration: 0.8, ease: EXPO };
  return (
    <AnimatePresence>
      {open && project && (
        <motion.div
          key='backdrop'
          className='fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[6px] md:p-6'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.1 } }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
          data-lenis-prevent
        >
          <div
            onClick={e => e.stopPropagation()}
            className='relative grid h-full max-h-[660px] w-full max-w-[1040px] grid-rows-[38%_1fr] overflow-hidden rounded-[28px] bg-white shadow-2xl md:grid-cols-[1.05fr_1fr] md:grid-rows-1'
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%', transition: { duration: 0.45, ease: EXPO } }}
              transition={slide}
              className='min-h-0'
            >
              <Media project={project} className='h-full' />
            </motion.div>
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{
                x: '100%',
                opacity: 0,
                transition: { duration: 0.45, ease: EXPO },
              }}
              transition={slide}
              className='min-h-0 overflow-y-auto px-7 py-8 md:px-10 md:py-12'
            >
              <Body project={project} />
            </motion.div>
            <CloseButton onClose={onClose} className='absolute right-4 top-4' />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
