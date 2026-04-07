'use client';

import { fullDemos, cardPreviews } from '@/lib/component-previews';

export function FullDemo({ slug, name }: { slug: string; name: string }) {
  return (
    <>
      {fullDemos[slug] || (
        <div className='text-library-gray'>Live demo: {name}</div>
      )}
    </>
  );
}

export function CardPreview({ slug, name }: { slug: string; name: string }) {
  return (
    <>
      {cardPreviews[slug] || (
        <div className='text-library-gray text-sm'>{name}</div>
      )}
    </>
  );
}
