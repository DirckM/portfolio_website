import type { Metadata } from 'next';
import NewsletterSignup from '@/components/shell/NewsletterSignup';

export const metadata: Metadata = {
  title: 'Link expired | Dirck Mulder',
  robots: { index: false },
};

/**
 * Deliberately vague about WHY. Distinguishing "expired" from "we have never
 * heard of this token" would let someone probe whether an address is on the
 * list, which is the same leak the subscribe endpoint is careful to avoid.
 */
export default function ConfirmFailedPage() {
  return (
    <div className='pt-32 pb-24 max-w-[560px] mx-auto px-6'>
      <h1 className='text-4xl font-[family-name:var(--font-instrument-serif)] text-black'>
        That link did not work
      </h1>
      <p className='mt-6 text-black/70 leading-relaxed'>
        Confirmation links expire after three days, and each one only works
        once. Sign up again and I will send a fresh one.
      </p>
      <div className='mt-10'>
        <NewsletterSignup source='confirm-failed' layout='panel' headline='Try again' blurb='' />
      </div>
    </div>
  );
}
