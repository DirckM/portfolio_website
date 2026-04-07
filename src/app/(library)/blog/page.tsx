import { Metadata } from 'next';
import { getAllBlogPosts } from '@/lib/blog-utils';
import BlogList from '@/components/shell/BlogList';

export const metadata: Metadata = {
  title: 'Blog | Dirck Mulder',
  description:
    'Tutorials on building beautiful, interactive React components. Text animations, 3D effects, glassmorphism, and more.',
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className='pt-24 pb-20 max-w-[900px] mx-auto px-6'>
      <h1 className='text-3xl font-[family-name:var(--font-instrument-serif)] mb-16'>
        Blog
      </h1>

      <BlogList
        posts={posts.map(p => ({
          slug: p.slug,
          title: p.title,
          description: p.description,
          date: p.date,
          category: p.category,
          readingTime: p.readingTime,
        }))}
      />
    </div>
  );
}
