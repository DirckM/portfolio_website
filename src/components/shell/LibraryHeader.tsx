'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LibraryHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-sm">
      <Link
        href="/"
        className="text-sm font-[family-name:var(--font-inter)] tracking-wide text-black no-underline"
      >
        Dirck Mulder
      </Link>
      <nav className="flex gap-8 text-sm font-[family-name:var(--font-inter)]">
        <Link
          href="/components"
          className={`no-underline transition-colors ${
            pathname.startsWith('/components')
              ? 'text-black'
              : 'text-library-gray hover:text-black'
          }`}
        >
          Components
        </Link>
        <Link
          href="/blog"
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
