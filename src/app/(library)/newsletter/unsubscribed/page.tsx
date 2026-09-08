import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Unsubscribed | Dirck Mulder',
  robots: { index: false },
};

export default function UnsubscribedPage() {
  return (
    <div className='pt-32 pb-24 max-w-[560px] mx-auto px-6'>
      <h1 className='text-4xl font-[family-name:var(--font-instrument-serif)] text-black'>
        You are unsubscribed
      </h1>
      <p className='mt-6 text-black/70 leading-relaxed'>
        Done, no more emails. No hard feelings and no follow-up asking why.
      </p>
      <p className='mt-6'>
        <Link
          href='/newsletter'
          className='text-sm text-black underline underline-offset-4 hover:no-underline'
        >
          Changed your mind
        </Link>
      </p>
    </div>
  );
}
