'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LibraryHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <header className='fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-sm'>
      <Link
        href='/'
        className='text-sm font-[family-name:var(--font-inter)] tracking-wide text-black no-underline'
      >
        Dirck Mulder
      </Link>

      <nav className='hidden md:flex gap-8 text-sm font-[family-name:var(--font-inter)]'>
        {isHome ? (
          <>
            <button
              onClick={() => scrollToSection('projects')}
              className='text-library-gray hover:text-black transition-colors'
            >
              Projects
            </button>
            <button
              onClick={() => scrollToSection('experience')}
              className='text-library-gray hover:text-black transition-colors'
            >
              Experience
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className='text-library-gray hover:text-black transition-colors'
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className='text-library-gray hover:text-black transition-colors'
            >
              Contact
            </button>
          </>
        ) : null}
        <Link
          href='/components'
          className={`no-underline transition-colors ${
            pathname.startsWith('/components')
              ? 'text-black'
              : 'text-library-gray hover:text-black'
          }`}
        >
          Components
        </Link>
        <Link
          href='/blog'
          className={`no-underline transition-colors ${
            pathname.startsWith('/blog')
              ? 'text-black'
              : 'text-library-gray hover:text-black'
          }`}
        >
          Blog
        </Link>
      </nav>

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className='md:hidden p-2 text-black'
        aria-label='Toggle menu'
      >
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          {menuOpen ? (
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          ) : (
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 6h16M4 12h16M4 18h16'
            />
          )}
        </svg>
      </button>

      {menuOpen && (
        <div className='fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden'>
          <div
            ref={menuRef}
            className='absolute top-16 right-0 left-0 bg-white border-b border-library-border shadow-sm px-6 py-4'
          >
            <div className='flex flex-col gap-1 text-sm font-[family-name:var(--font-inter)]'>
              {isHome && (
                <>
                  <button
                    onClick={() => scrollToSection('projects')}
                    className='text-left text-black hover:text-library-gray transition-colors py-2'
                  >
                    Projects
                  </button>
                  <button
                    onClick={() => scrollToSection('experience')}
                    className='text-left text-black hover:text-library-gray transition-colors py-2'
                  >
                    Experience
                  </button>
                  <button
                    onClick={() => scrollToSection('about')}
                    className='text-left text-black hover:text-library-gray transition-colors py-2'
                  >
                    About
                  </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className='text-left text-black hover:text-library-gray transition-colors py-2'
                  >
                    Contact
                  </button>
                </>
              )}
              <Link
                href='/components'
                onClick={() => setMenuOpen(false)}
                className='text-black hover:text-library-gray transition-colors py-2 no-underline'
              >
                Components
              </Link>
              <Link
                href='/blog'
                onClick={() => setMenuOpen(false)}
                className='text-black hover:text-library-gray transition-colors py-2 no-underline'
              >
                Blog
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
