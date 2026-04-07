import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllBlogPosts, getBlogPost } from '@/lib/blog-utils';
import { highlightCode } from '@/lib/shiki';
import BlogPostLayout from '@/components/shell/BlogPostLayout';
import CodeBlock from '@/components/shell/CodeBlock';

import { fullDemos } from '@/lib/component-previews';
import LiveStep from '@/components/shell/LiveStep';
import BlurText from '@/components/library/text-animations/BlurText';
import TiltedCard from '@/components/library/components/TiltedCard';
import ElectricBorder from '@/components/library/animations/ElectricBorder';
import LineWaves from '@/components/library/backgrounds/LineWaves';

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

function extractCode(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (node == null || typeof node === 'boolean') return '';
  if (Array.isArray(node)) return node.map(extractCode).join('');
  if (typeof node === 'object' && 'props' in node) {
    return extractCode((node as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return '';
}

async function HighlightedPre({
  children,
  ...props
}: React.HTMLAttributes<HTMLPreElement> & { children?: React.ReactNode }) {
  try {
    const codeElement = children as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;

    if (!codeElement?.props) {
      return <pre {...props}>{children}</pre>;
    }

    const className = codeElement.props.className || '';
    const lang = className.replace('language-', '') || 'tsx';
    const code = extractCode(codeElement.props.children).trim();

    if (!code) {
      return <pre {...props}>{children}</pre>;
    }

    const highlightedHtml = await highlightCode(code, lang);

    return <CodeBlock code={code} language={lang} highlightedHtml={highlightedHtml} />;
  } catch {
    return <pre {...props}>{children}</pre>;
  }
}

const mdxComponents = {
  LiveStep: (props: any) => (
    <LiveStep
      {...props}
      scope={{
        BlurText,
        TiltedCard,
        ElectricBorder,
        LineWaves,
        ...props.scope,
      }}
    />
  ),
  pre: HighlightedPre,
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className='text-2xl font-[family-name:var(--font-instrument-serif)] mt-12 mb-4'>
      {children}
    </h2>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className='text-black/80 leading-relaxed mb-4'>{children}</p>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className='text-black/80 leading-relaxed'>{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className='font-semibold text-black'>{children}</strong>
  ),
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className='pt-32 text-center'>
        <h1 className='text-2xl font-[family-name:var(--font-instrument-serif)]'>
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
