import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { ISSUES } from '@/content/newsletter';
import { designsIssue } from '@/lib/designs';

export const metadata: Metadata = {
  title: 'Free app designs, with the code | Dirck Mulder',
  description:
    'Every set of app screens from my newsletter, rebuilt in plain HTML and CSS. The code is free.',
  alternates: { canonical: 'https://dirckmulder.com/designs' },
};

/**
 * Every issue's set of designs, newest first, so someone who lands on one set
 * can find the others. Built from the same issue files as /designs/<slug>.
 */
export default function DesignsIndexPage() {
  const sets = ISSUES.filter(f => designsIssue(f.slug)).sort(
    (a, b) => b.number - a.number
  );

  return (
    <div className='px-6 pb-24 pt-28 md:pt-32'>
      <div className='mx-auto w-full max-w-[1120px]'>
        <p className='text-[11px] uppercase tracking-[0.2em] text-black/50'>
          From the newsletter
        </p>
        <h1 className='mt-5 max-w-[760px] text-balance text-[42px] leading-[1.02] text-black md:text-6xl font-[family-name:var(--font-instrument-serif)]'>
          App screens, rebuilt in HTML, free to take apart
        </h1>
        <p className='mt-5 max-w-[600px] text-base leading-relaxed text-black/60 md:text-lg'>
          Every month a few designs, animated and with the code. Newest first.
        </p>

        <ul className='mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2'>
          {sets.map(f => (
            <li key={f.slug}>
              <Link href={`/designs/${f.slug}`} className='group block'>
                <div className='overflow-hidden rounded-[24px] bg-black/[0.03] ring-1 ring-black/[0.06]'>
                  <Image
                    src={`/email/${f.cover.image}`}
                    alt={f.cover.alt}
                    width={1200}
                    height={400}
                    className='block h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]'
                  />
                </div>
                <p className='mt-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-black/50'>
                  Made in {f.period} · Issue {String(f.number).padStart(3, '0')}
                  <span className='text-black/30'>·</span>
                  {f.showcase.items.length} designs
                </p>
                <h2 className='mt-2 flex items-start justify-between gap-4 text-xl leading-snug text-black md:text-2xl'>
                  {f.showcase.title}
                  <ArrowUpRight
                    className='mt-1 size-5 shrink-0 text-black/40 transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black'
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </h2>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
