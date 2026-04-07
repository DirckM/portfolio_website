'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LibraryHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  function scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

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
    </header>
  );
}
