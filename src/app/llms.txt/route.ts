import { getAllBlogPosts } from '@/lib/blog-utils';
import { componentRegistry, CATEGORY_LABELS } from '@/lib/components-registry';

export const dynamic = 'force-static';

const BASE = 'https://dirckmulder.com';

/**
 * llms.txt — the map an AI assistant reads instead of crawling the site.
 *
 * The proposal (llmstxt.org) asks for a single H1, an optional blockquote
 * summary, then H2 sections of link lists with a short note per link. Keep it
 * to that shape: the value is that a model can decide what to fetch without
 * parsing 60 pages of React.
 */
export function GET() {
  const posts = getAllBlogPosts();

  const byCategory = componentRegistry.reduce<Record<string, typeof componentRegistry>>(
    (acc, entry) => {
      const label = CATEGORY_LABELS[entry.category];
      (acc[label] ??= []).push(entry);
      return acc;
    },
    {}
  );

  const lines: string[] = [
    '# Dirck Mulder — React component library and build notes',
    '',
    '> Open source React and CSS animation components, each one paired with a',
    '> tutorial that explains how it works and where it breaks. Written and',
    `> maintained by Dirck Mulder. ${posts.length} tutorials, ${componentRegistry.length} components.`,
    '',
    'Every component has a live, editable demo on its page. Every tutorial is',
    'welded to a real component in the library rather than being prose about one,',
    'so the code in a post is the code that runs in its demo.',
    '',
    '## Tutorials',
    '',
  ];

  for (const post of posts) {
    lines.push(`- [${post.title}](${BASE}/blog/${post.slug}): ${post.description}`);
  }

  lines.push('', '## Components', '');

  for (const [label, entries] of Object.entries(byCategory)) {
    lines.push(`### ${label}`, '');
    for (const entry of entries) {
      lines.push(`- [${entry.name}](${BASE}/components/${entry.slug}): ${entry.description}`);
    }
    lines.push('');
  }

  lines.push(
    '## Optional',
    '',
    `- [Full text of every tutorial](${BASE}/llms-full.txt): all posts concatenated, for ingesting in one request.`,
    `- [Sitemap](${BASE}/sitemap.xml): every indexable URL.`,
    ''
  );

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
