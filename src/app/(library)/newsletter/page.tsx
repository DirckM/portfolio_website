import type { Metadata } from 'next';
import Image from 'next/image';
import NewsletterSignup from '@/components/shell/NewsletterSignup';
import { getAllBlogPosts } from '@/lib/blog-utils';

export const metadata: Metadata = {
  title: 'Newsletter | Dirck Mulder',
  description:
    'One email a month about what I am building. New components, what shipped, and what broke along the way.',
  alternates: { canonical: 'https://dirckmulder.com/newsletter' },
};

/**
 * The shareable page. A footer widget cannot be posted as a link, and this is
 * also where the archive will live once there are issues to show.
 */
export default function NewsletterPage() {
  const posts = getAllBlogPosts();

  // A full viewport split. The photo holds one half and the ask the other, so
  // the footer only arrives once someone has scrolled past it rather than
  // sitting in frame beside it.
  return (
    <div className='flex min-h-[100svh] flex-col md:flex-row'>
      <div className='relative h-[280px] w-full shrink-0 md:h-auto md:w-[42%] md:max-w-[620px]'>
        <Image
          src='/dirck-newsletter-tall.jpg'
          alt='Dirck Mulder'
          fill
          sizes='(max-width: 768px) 100vw, 42vw'
          priority
          className='object-cover object-[center_24%] md:object-center'
        />
      </div>

      <div className='flex flex-1 items-center px-6 pt-12 pb-20 md:px-14 md:pt-28 lg:px-20'>
        <div className='w-full max-w-[540px]'>
          <h1 className='text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-instrument-serif)] text-black leading-[1.05]'>
            What I am building
          </h1>

          <p className='mt-7 text-lg md:text-xl text-black/70 leading-relaxed'>
            One email a month. What I shipped, what broke, and the components
            and write-ups that came out of it.
          </p>

          <p className='mt-4 text-base text-black/60 leading-relaxed'>
            There are {posts.length} tutorials on this site so far, each one
            welded to a component you can edit in the browser. The newsletter is
            where the new ones land, plus the parts that never make it into a
            tutorial.
          </p>

          {/* Inline rather than the grey panel: a boxed card inside a
              full-bleed hero reads as a widget dropped on the page. */}
          <div className='mt-10'>
            <NewsletterSignup
              source='newsletter-page'
              layout='inline'
              headline=''
              blurb=''
            />
          </div>
        </div>
      </div>
    </div>
  );
}
