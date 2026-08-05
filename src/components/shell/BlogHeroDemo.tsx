'use client';

import { fullDemos } from '@/lib/component-previews';

/**
 * The hero demo above a blog post.
 *
 * This has to read `fullDemos` from a client component. component-previews.tsx
 * is `'use client'`, so a server component importing the map gets a client
 * reference proxy rather than the object, every lookup comes back undefined and
 * every post silently renders with no hero. /components/[slug] avoids that by
 * going through <FullDemo>, and this is the same trick for /blog/[slug].
 *
 * Renders nothing at all when the slug has no entry, so posts without a demo
 * keep their current layout instead of gaining an empty band.
 */
export default function BlogHeroDemo({ slug }: { slug: string }) {
  const demo = fullDemos[slug];
  if (!demo) return null;

  return (
    <section className='w-full bg-library-cream border-y border-library-border mb-12'>
      <div className='max-w-[1200px] mx-auto min-h-[300px] flex items-center justify-center py-12'>
        {demo}
      </div>
    </section>
  );
}
