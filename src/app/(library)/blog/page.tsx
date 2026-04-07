import { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog-utils';

export const metadata: Metadata = {
  title: 'Blog | Dirck Mulder',
  description:
    'Tutorials on building beautiful, interactive React components. Text animations, 3D effects, glassmorphism, and more.',
};

export default function BlogPage() {
  const posts = getAllBlogPosts();
  const [latest, ...rest] = posts;

  return (
    <div className='pt-24 pb-20 max-w-[900px] mx-auto px-6'>
      <h1 className='text-3xl font-[family-name:var(--font-instrument-serif)] mb-16'>
        Blog
      </h1>

      {!latest ? (
        <p className='text-library-gray'>No posts yet.</p>
      ) : (
        <>
          {/* Featured latest post */}
          <Link
            href={`/blog/${latest.slug}`}
            className='group no-underline block mb-16'
          >
            <div className='border border-library-border rounded-xl p-8 hover:shadow-lg transition-shadow duration-300'>
              <div className='flex items-center gap-3 mb-4'>
                <span className='text-xs bg-black text-white px-2 py-1 rounded-full uppercase tracking-wider'>
                  Latest
                </span>
                <span className='text-xs text-library-gray uppercase tracking-wider'>
                  {latest.category}
                </span>
                <span className='text-library-border'>|</span>
                <time className='text-xs text-library-gray'>{latest.date}</time>
                <span className='text-library-border'>|</span>
                <span className='text-xs text-library-gray'>
                  {latest.readingTime}
                </span>
              </div>
              <h2 className='text-3xl font-[family-name:var(--font-instrument-serif)] text-black group-hover:underline underline-offset-4 leading-tight'>
                {latest.title}
              </h2>
              <p className='text-library-gray mt-3 text-base leading-relaxed'>
                {latest.description}
              </p>
            </div>
          </Link>

          {/* All posts list */}
          {rest.length > 0 && (
            <div className='flex flex-col'>
              <h2 className='text-lg font-[family-name:var(--font-instrument-serif)] mb-8 text-library-gray'>
                All posts
              </h2>
              {rest.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className='group no-underline py-5 border-b border-library-border first:pt-0 last:border-0'
                >
                  <div className='flex items-center gap-3 mb-1.5'>
                    <span className='text-xs text-library-gray uppercase tracking-wider'>
                      {post.category}
                    </span>
                    <span className='text-library-border'>|</span>
                    <time className='text-xs text-library-gray'>
                      {post.date}
                    </time>
                    <span className='text-library-border'>|</span>
                    <span className='text-xs text-library-gray'>
                      {post.readingTime}
                    </span>
                  </div>
                  <h3 className='text-lg font-[family-name:var(--font-instrument-serif)] text-black group-hover:underline underline-offset-4'>
                    {post.title}
                  </h3>
                  <p className='text-sm text-library-gray mt-1'>
                    {post.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
