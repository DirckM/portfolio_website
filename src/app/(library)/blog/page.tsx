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

  return (
    <div className='pt-24 pb-20 max-w-[720px] mx-auto px-6'>
      <h1 className='text-3xl font-[family-name:var(--font-instrument-serif)] mb-16'>
        Blog
      </h1>

      {posts.length === 0 ? (
        <p className='text-library-gray'>No posts yet.</p>
      ) : (
        <div className='flex flex-col'>
          {posts.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className='group no-underline py-6 border-b border-library-border first:pt-0 last:border-0'
            >
              <div className='flex items-center gap-3 mb-2'>
                <span className='text-xs text-library-gray uppercase tracking-wider'>
                  {post.category}
                </span>
                <span className='text-library-border'>|</span>
                <time className='text-xs text-library-gray'>{post.date}</time>
              </div>
              <h2 className='text-xl font-[family-name:var(--font-instrument-serif)] text-black group-hover:underline underline-offset-4'>
                {post.title}
              </h2>
              <p className='text-sm text-library-gray mt-1'>
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
