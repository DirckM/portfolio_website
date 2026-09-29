import AccentTitle from '@/components/shell/AccentTitle';
import type { Metadata } from 'next';
import ConfirmedNextSteps, {
  type NextPost,
} from '@/components/shell/ConfirmedNextSteps';
import { getAllBlogPosts, getStoryPoster } from '@/lib/blog-utils';

export const metadata: Metadata = {
  title: 'Subscribed | Dirck Mulder',
  robots: { index: false },
};

const POST_COUNT = 4;

/**
 * The newest posts, with any story among them moved to the front. A story is
 * the one kind of post with a picture of something real, so it makes the
 * better first card. Nothing here is hardcoded: a new post shows up on the
 * next build.
 */
function nextPosts(): NextPost[] {
  const newest = getAllBlogPosts().slice(0, POST_COUNT);
  const ordered = [
    ...newest.filter(p => p.kind === 'story'),
    ...newest.filter(p => p.kind !== 'story'),
  ];
  return ordered.map(p => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    readingTime: p.readingTime,
    componentSlug: p.componentSlug,
    poster: p.kind === 'story' ? getStoryPoster(p) : null,
  }));
}

export default function ConfirmedPage() {
  return (
    <div className='pt-32 pb-24 max-w-[1040px] mx-auto px-6'>
      <div className='max-w-[560px]'>
        <p className='text-xs uppercase tracking-[0.16em] text-gradient-primary font-semibold'>
          Subscription confirmed
        </p>
        <h1 className='mt-3 text-5xl font-semibold tracking-[-0.03em] text-black'>
          <AccentTitle text={`You are on the list`} />
        </h1>
        <p className='mt-6 text-black/70 leading-relaxed'>
          Good to have you. The next issue lands in your inbox, and every one
          has a one-click unsubscribe at the bottom. Until then, here is what I
          made lately.
        </p>
      </div>

      <ConfirmedNextSteps posts={nextPosts()} />
    </div>
  );
}
