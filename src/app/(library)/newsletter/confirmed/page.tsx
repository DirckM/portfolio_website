import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Subscribed | Dirck Mulder',
  robots: { index: false },
};

export default function ConfirmedPage() {
  return (
    <div className='pt-32 pb-24 max-w-[560px] mx-auto px-6'>
      <h1 className='text-4xl font-[family-name:var(--font-instrument-serif)] text-black'>
        You are on the list
      </h1>
      <p className='mt-6 text-black/70 leading-relaxed'>
        That is it. The next issue will land in your inbox, and every one has a
        one-click unsubscribe at the bottom.
      </p>
      <p className='mt-6'>
        <Link
          href='/blog'
          className='text-sm text-black underline underline-offset-4 hover:no-underline'
        >
          Read the tutorials
        </Link>
      </p>
    </div>
  );
}
