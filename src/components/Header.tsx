'use client';

import { useState, useEffect, useRef } from 'react';

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
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <header className='fixed top-0 left-0 right-0 z-50 transition-all duration-30 my-8'>
      <nav className='flex justify-center md:justify-center'>
        {/* Desktop Navigation */}
        <div className='hidden md:flex flex-row gap-12 w-fit px-10 py-3 rounded-4xl bg-black/10 backdrop-blur-md border border-white/20 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-all duration-300s'>
          <button
            onClick={() => scrollToSection('projects')}
            className='text-neutral-700 hover:text-primary transition-colors duration-200 font-medium'
          >
            Projects
          </button>
          <button
            onClick={() => scrollToSection('experience')}
            className='text-neutral-700 hover:text-primary transition-colors duration-200 font-medium'
          >
            Experience
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className='text-neutral-700 hover:text-primary transition-colors duration-200 font-medium'
          >
            About Me
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className='text-neutral-700 hover:text-primary transition-colors duration-200 font-medium'
          >
            Contact
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className='md:hidden flex justify-end w-full px-8'>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='p-3 rounded-full bg-black/10 backdrop-blur-md border border-white/20 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-all duration-300'
            aria-label='Toggle mobile menu'
          >
            <svg
              className='w-6 h-6 text-neutral-700'
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
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden'>
            <div
              ref={mobileMenuRef}
              className='absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl shadow-black/20 p-6'
            >
              {/* Close Button */}
              <div className='flex justify-end mb-6'>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='p-2 rounded-full hover:bg-gray-100 transition-colors duration-200'
                  aria-label='Close mobile menu'
                >
                  <svg
                    className='w-6 h-6 text-neutral-700'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className='flex flex-col gap-4'>
                <button
                  onClick={() => scrollToSection('projects')}
                  className='text-left text-neutral-700 hover:text-primary transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-gray-100'
                >
                  Projects
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className='text-left text-neutral-700 hover:text-primary transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-gray-100'
                >
                  About Me
                </button>
                <button
                  onClick={() => scrollToSection('experience')}
                  className='text-left text-neutral-700 hover:text-primary transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-gray-100'
                >
                  Experience
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className='text-left text-neutral-700 hover:text-primary transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-gray-100'
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
