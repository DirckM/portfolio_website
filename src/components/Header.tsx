'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const Header = () => {
  const [_isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-library-border'>
      <nav className='flex items-center justify-between max-w-6xl mx-auto px-6 h-14'>
        {/* Logo */}
        <span className='text-black font-semibold text-sm tracking-wide'>
          Dirck Mulder
        </span>

        {/* Desktop Navigation */}
        <div className='hidden md:flex flex-row gap-8 items-center'>
          <button
            onClick={() => scrollToSection('projects')}
            className='text-library-gray hover:text-black transition-colors duration-200 text-sm font-medium'
          >
            Projects
          </button>
          <button
            onClick={() => scrollToSection('experience')}
            className='text-library-gray hover:text-black transition-colors duration-200 text-sm font-medium'
          >
            Experience
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className='text-library-gray hover:text-black transition-colors duration-200 text-sm font-medium'
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className='text-library-gray hover:text-black transition-colors duration-200 text-sm font-medium'
          >
            Contact
          </button>
          <Link
            href='/components'
            className='text-library-gray hover:text-black transition-colors duration-200 text-sm font-medium'
          >
            Components
          </Link>
          <Link
            href='/blog'
            className='text-library-gray hover:text-black transition-colors duration-200 text-sm font-medium'
          >
            Blog
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className='md:hidden'>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='p-2 text-black'
            aria-label='Toggle mobile menu'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              {isMobileMenuOpen ? (
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
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className='fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden'>
            <div
              ref={mobileMenuRef}
              className='absolute top-14 right-0 left-0 bg-white border-b border-library-border shadow-sm px-6 py-4'
            >
              <div className='flex flex-col gap-1'>
                <button
                  onClick={() => scrollToSection('projects')}
                  className='text-left text-black hover:text-library-gray transition-colors duration-200 text-sm font-medium py-2'
                >
                  Projects
                </button>
                <button
                  onClick={() => scrollToSection('experience')}
                  className='text-left text-black hover:text-library-gray transition-colors duration-200 text-sm font-medium py-2'
                >
                  Experience
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className='text-left text-black hover:text-library-gray transition-colors duration-200 text-sm font-medium py-2'
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className='text-left text-black hover:text-library-gray transition-colors duration-200 text-sm font-medium py-2'
                >
                  Contact
                </button>
                <Link
                  href='/components'
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='text-black hover:text-library-gray transition-colors duration-200 text-sm font-medium py-2'
                >
                  Components
                </Link>
                <Link
                  href='/blog'
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='text-black hover:text-library-gray transition-colors duration-200 text-sm font-medium py-2'
                >
                  Blog
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
