import type { Metadata } from 'next';
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

  return (
    <div className='pt-32 pb-24 max-w-[640px] mx-auto px-6'>
      <h1 className='text-4xl md:text-5xl font-[family-name:var(--font-instrument-serif)] text-black leading-tight'>
        What I am building
      </h1>

      <p className='mt-6 text-lg text-black/70 leading-relaxed'>
        One email a month. What I shipped, what broke, and the components and
        write-ups that came out of it.
      </p>

      <p className='mt-4 text-black/60 leading-relaxed'>
        There are {posts.length} tutorials on this site so far, each one welded
        to a component you can edit in the browser. The newsletter is where the
        new ones land, plus the parts that never make it into a tutorial.
      </p>

      <div className='mt-12'>
        <NewsletterSignup
          source='newsletter-page'
          layout='panel'
          headline='Sign up'
          blurb='No spam, no drip sequence, no course. One email a month.'
        />
      </div>
    </div>
  );
}
