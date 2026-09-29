'use client';

import { fullDemos, cardPreviews } from '@/lib/component-previews';
import LazyCard from './LazyCard';
import ClientDemo from './ClientDemo';

export function FullDemo({ slug, name }: { slug: string; name: string }) {
  return (
    <>
      <ClientDemo>
        {fullDemos[slug] || (
          <div className='text-library-gray'>Live demo: {name}</div>
        )}
      </ClientDemo>
    </>
  );
}

export function CardPreview({ slug, name }: { slug: string; name: string }) {
  const fallback = <div className='text-library-gray text-sm'>{name}</div>;
  return (
    <LazyCard fallback={fallback}>
      <ClientDemo fallback={fallback}>
        {cardPreviews[slug] || fallback}
      </ClientDemo>
    </LazyCard>
  );
}
