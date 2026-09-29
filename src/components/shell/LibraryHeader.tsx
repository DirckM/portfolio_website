'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

const MENU_EASE = { duration: 0.45, ease: [0.22, 1, 0.36, 1] } as const;
const MENU_ITEM = {
  closed: { opacity: 0, y: -8 },
  open: { opacity: 1, y: 0, transition: MENU_EASE },
};

export default function LibraryHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Past the first few pixels of scroll the full-width header glides into a
  // black pill that is exactly as wide as its content.
  const [scrolled, setScrolled] = useState(false);
  const [viewportW, setViewportW] = useState(0);
  const [pillW, setPillW] = useState(0);
  const nameRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const measure = () => {
      setViewportW(window.innerWidth);
      const name = nameRef.current?.offsetWidth ?? 0;
      const nav = navRef.current?.offsetWidth ?? 0;
      const burger = burgerRef.current?.offsetWidth ?? 0;
      // content + gap between name and links + the pill's side padding
      setPillW(name + (nav || burger) + 56 + 64 + (nav ? 24 : 0));
    };
    onScroll();
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
    };
  }, [pathname]);

  const pill = scrolled && pillW > 0;
  const linkIdle = pill
    ? 'text-white/60 hover:text-white'
    : 'text-library-gray hover:text-black';
  const linkActive = pill ? 'text-white' : 'text-black';

  function scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMenuOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center transition-[padding] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
        pill ? 'px-3' : 'px-0'
      }`}
    >
      <div
        style={{ maxWidth: pill ? pillW : viewportW || undefined }}
        className={`pointer-events-auto relative z-50 flex w-full items-center justify-between backdrop-blur-sm transition-[max-width,margin,padding,background-color,border-radius,box-shadow] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
          pill
            ? 'mt-6 rounded-full bg-black px-8 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.22)]'
            : 'mt-0 rounded-none bg-white/80 px-6 py-5 shadow-none'
        }`}
      >
        <Link
          ref={nameRef}
          href='/'
          className={`whitespace-nowrap font-[family-name:var(--font-inter)] tracking-wide no-underline text-sm transition-colors duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
            pill ? 'text-white' : 'text-black'
          }`}
        >
          Dirck Mulder
        </Link>

        <nav
          ref={navRef}
          className={`hidden md:flex whitespace-nowrap text-sm font-[family-name:var(--font-inter)] transition-[gap] duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
            pill ? 'gap-9' : 'gap-8'
          }`}
        >
          {isHome ? (
            <>
              <button
                onClick={() => scrollToSection('projects')}
                className={`${linkIdle} transition-colors duration-[900ms]`}
              >
                Projects
              </button>
              <button
                onClick={() => scrollToSection('experience')}
                className={`${linkIdle} transition-colors duration-[900ms]`}
              >
                Experience
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className={`${linkIdle} transition-colors duration-[900ms]`}
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className={`${linkIdle} transition-colors duration-[900ms]`}
              >
                Contact
              </button>
            </>
          ) : null}
          <Link
            href='/components'
            className={`no-underline transition-colors duration-[900ms] ${
              pathname.startsWith('/components') ? linkActive : linkIdle
            }`}
          >
            Components
          </Link>
          <Link
            href='/blog'
            className={`no-underline transition-colors duration-[900ms] ${
              pathname.startsWith('/blog') ? linkActive : linkIdle
            }`}
          >
            Blog
          </Link>
          <a
            href='https://portal.dirckmulder.com'
            className={`no-underline transition-colors duration-[900ms] ${linkIdle}`}
          >
            Portal
          </a>
        </nav>

        <button
          ref={burgerRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden -my-1 p-2 transition-colors duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
            pill ? 'text-white' : 'text-black'
          }`}
          aria-label='Toggle menu'
        >
          {/* Three lines that fold into an X */}
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            strokeLinecap='round'
            viewBox='0 0 24 24'
          >
            <motion.line
              x1='4'
              x2='20'
              y1='6'
              y2='6'
              style={{ originX: '50%', originY: '50%' }}
              animate={menuOpen ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
              transition={MENU_EASE}
            />
            <motion.line
              x1='4'
              x2='20'
              y1='12'
              y2='12'
              animate={
                menuOpen
                  ? { opacity: 0, scaleX: 0.2 }
                  : { opacity: 1, scaleX: 1 }
              }
              transition={{ ...MENU_EASE, duration: 0.25 }}
            />
            <motion.line
              x1='4'
              x2='20'
              y1='18'
              y2='18'
              style={{ originX: '50%', originY: '50%' }}
              animate={menuOpen ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }}
              transition={MENU_EASE}
            />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className='pointer-events-auto fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={MENU_EASE}
              style={{ originX: 1, originY: 0 }}
              className={
                pill
                  ? 'absolute top-[100px] right-3 left-3 rounded-3xl bg-white shadow-lg px-6 py-4'
                  : 'absolute top-16 right-0 left-0 bg-white border-b border-library-border shadow-sm px-6 py-4'
              }
            >
              <motion.div
                className='flex flex-col gap-1 text-sm font-[family-name:var(--font-inter)]'
                initial='closed'
                animate='open'
                exit='closed'
                variants={{
                  open: {
                    transition: { staggerChildren: 0.045, delayChildren: 0.08 },
                  },
                  closed: {
                    transition: { staggerChildren: 0.03, staggerDirection: -1 },
                  },
                }}
              >
                {isHome && (
                  <>
                    <motion.div variants={MENU_ITEM}>
                      <button
                        onClick={() => scrollToSection('projects')}
                        className='block w-full text-left text-black hover:text-library-gray transition-colors py-2'
                      >
                        Projects
                      </button>
                    </motion.div>
                    <motion.div variants={MENU_ITEM}>
                      <button
                        onClick={() => scrollToSection('experience')}
                        className='block w-full text-left text-black hover:text-library-gray transition-colors py-2'
                      >
                        Experience
                      </button>
                    </motion.div>
                    <motion.div variants={MENU_ITEM}>
                      <button
                        onClick={() => scrollToSection('about')}
                        className='block w-full text-left text-black hover:text-library-gray transition-colors py-2'
                      >
                        About
                      </button>
                    </motion.div>
                    <motion.div variants={MENU_ITEM}>
                      <button
                        onClick={() => scrollToSection('contact')}
                        className='block w-full text-left text-black hover:text-library-gray transition-colors py-2'
                      >
                        Contact
                      </button>
                    </motion.div>
                  </>
                )}
                <motion.div variants={MENU_ITEM}>
                  <Link
                    href='/components'
                    onClick={() => setMenuOpen(false)}
                    className='block text-black hover:text-library-gray transition-colors py-2 no-underline'
                  >
                    Components
                  </Link>
                </motion.div>
                <motion.div variants={MENU_ITEM}>
                  <Link
                    href='/blog'
                    onClick={() => setMenuOpen(false)}
                    className='block text-black hover:text-library-gray transition-colors py-2 no-underline'
                  >
                    Blog
                  </Link>
                </motion.div>
                <motion.div variants={MENU_ITEM}>
                  <a
                    href='https://portal.dirckmulder.com'
                    onClick={() => setMenuOpen(false)}
                    className='block text-black hover:text-library-gray transition-colors py-2 no-underline'
                  >
                    Portal
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
