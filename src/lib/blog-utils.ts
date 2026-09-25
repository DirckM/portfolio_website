import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

/**
 * The category that marks a story post.
 *
 * Almost every post is a tutorial welded to a component in the library, and the
 * render gate enforces that. A story post is the one explicit exception: prose
 * about how something was made, with no component, no LiveStep and no hero
 * demo. It has to be declared with this category, so a tutorial that forgot its
 * componentSlug still fails the gate instead of quietly becoming a story.
 */
export const STORY_CATEGORY = 'Story';

export type BlogPostKind = 'tutorial' | 'story';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  kind: BlogPostKind;
  /** The library component a tutorial is built on. Null for a story post. */
  componentSlug: string | null;
  readingTime: string;
  content: string;
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));

  return files
    .map(file => {
      const slug = file.replace('.mdx', '');
      return getBlogPost(slug);
    })
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const stats = readingTime(content);
  const kind: BlogPostKind =
    data.category === STORY_CATEGORY ? 'story' : 'tutorial';

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date || new Date().toISOString(),
    category: data.category || 'components',
    kind,
    // A tutorial falls back to its own slug, which is how the original 63
    // posts were written. A story never points at a component.
    componentSlug: kind === 'story' ? null : data.componentSlug || slug,
    readingTime: stats.text,
    content,
  };
}

/** Tutorials only, for anything that promises "a working component each". */
export function getTutorialPosts(): BlogPost[] {
  return getAllBlogPosts().filter(p => p.kind === 'tutorial');
}
