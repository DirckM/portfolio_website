import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllBlogPosts, getBlogPost } from '@/lib/blog-utils';
import BlogPostLayout from '@/components/shell/BlogPostLayout';
import CodeBlock from '@/components/shell/CodeBlock';
import { fullDemos } from '@/lib/component-previews';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: 'Not Found' };

  return {
    title: `${post.title} | Dirck Mulder`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

const mdxComponents = {
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-[family-name:var(--font-instrument-serif)] mt-12 mb-4">
      {children}
    </h2>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-black/80 leading-relaxed mb-4">{children}</p>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-black/80 leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-black">{children}</strong>
  ),
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className="pt-32 text-center">
        <h1 className="text-2xl font-[family-name:var(--font-instrument-serif)]">
          Post not found
        </h1>
      </div>
    );
  }

  return (
    <BlogPostLayout post={post} demo={fullDemos[post.componentSlug]}>
      <MDXRemote source={post.content} components={mdxComponents} />
    </BlogPostLayout>
  );
}
