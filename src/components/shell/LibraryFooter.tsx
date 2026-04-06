import Link from 'next/link';

export default function LibraryFooter() {
  return (
    <footer className='border-t border-library-border px-6 py-8 flex items-center justify-between text-sm text-library-gray font-[family-name:var(--font-inter)]'>
      <span>Dirck Mulder</span>
      <div className='flex gap-6'>
        <Link
          href='/'
          className='no-underline text-library-gray hover:text-black transition-colors'
        >
          Portfolio
        </Link>
        <Link
          href='/components'
          className='no-underline text-library-gray hover:text-black transition-colors'
        >
          Components
        </Link>
        <Link
          href='/blog'
          className='no-underline text-library-gray hover:text-black transition-colors'
        >
          Blog
        </Link>
      </div>
    </footer>
  );
}
