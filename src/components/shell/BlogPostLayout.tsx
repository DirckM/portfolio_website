import Link from 'next/link';
import type { BlogPost } from '@/lib/blog-utils';

interface BlogPostLayoutProps {
  post: BlogPost;
  demo?: React.ReactNode;
  children: React.ReactNode;
}

export default function BlogPostLayout({
  post,
  demo,
  children,
}: BlogPostLayoutProps) {
  return (
    <article className='pt-24 pb-20'>
      <header className='max-w-[720px] mx-auto px-6 mb-12'>
        <div className='flex items-center gap-3 mb-4'>
          <span className='text-xs text-library-gray uppercase tracking-wider'>
            {post.category}
          </span>
          <span className='text-library-border'>|</span>
          <time className='text-xs text-library-gray'>{post.date}</time>
          <span className='text-library-border'>|</span>
          <span className='text-xs text-library-gray'>{post.readingTime}</span>
        </div>
        <h1 className='text-4xl md:text-5xl font-[family-name:var(--font-instrument-serif)] text-black leading-tight'>
          {post.title}
        </h1>
        <p className='mt-4 text-library-gray text-lg'>{post.description}</p>
      </header>

      {demo && (
        <section className='w-full bg-library-cream border-y border-library-border mb-12'>
          <div className='max-w-[1200px] mx-auto min-h-[300px] flex items-center justify-center py-12'>
            {demo}
          </div>
        </section>
      )}

      <div className='max-w-[720px] mx-auto px-6 prose prose-neutral prose-lg' suppressHydrationWarning>
        {children}
      </div>

      <footer className='max-w-[720px] mx-auto px-6 mt-16 pt-8 border-t border-library-border'>
        <Link
          href={`/components/${post.componentSlug}`}
          className='text-sm text-black underline underline-offset-4 hover:no-underline'
        >
          View {post.title} component
        </Link>
      </footer>
    </article>
  );
}
