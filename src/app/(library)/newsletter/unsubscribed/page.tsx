import type { Metadata } from 'next';
import Link from 'next/link';
import UnsubscribeSurvey from '@/components/shell/UnsubscribeSurvey';

export const metadata: Metadata = {
  title: 'Unsubscribed | Dirck Mulder',
  robots: { index: false },
};

interface Props {
  searchParams: Promise<{ t?: string }>;
}

/**
 * The unsubscribe already happened in the route handler before this rendered.
 * This page only confirms it and, optionally, asks why.
 *
 * The previous version promised "no follow-up asking why", so that line had to
 * go before a survey could be added. Shipping a questionnaire under a promise
 * not to ask one would be worse than never asking.
 */
export default async function UnsubscribedPage({ searchParams }: Props) {
  const { t } = await searchParams;

  return (
    <div className='pt-32 pb-24 max-w-[560px] mx-auto px-6'>
      <h1 className='text-4xl font-[family-name:var(--font-instrument-serif)] text-black'>
        You are unsubscribed
      </h1>
      <p className='mt-6 text-black/70 leading-relaxed'>
        Done, no more emails. That took effect immediately, and nothing below
        changes it.
      </p>
      <p className='mt-4 text-sm text-black/60'>
        Unsubscribed by mistake, or changed your mind?{' '}
        <Link href='/newsletter' className='text-black underline underline-offset-4 hover:no-underline'>
          Come back any time
        </Link>
        .
      </p>

      {t && <UnsubscribeSurvey token={t} />}
    </div>
  );
}
