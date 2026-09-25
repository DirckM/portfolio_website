import { getAllBlogPosts } from '@/lib/blog-utils';

export const dynamic = 'force-static';

const BASE = 'https://dirckmulder.com';

/**
 * llms-full.txt — every tutorial as plain markdown in one response, so a model
 * can ingest the whole library without 60 round trips. The MDX keeps its
 * <LiveStep> tags, which are meaningless to a reader, so they are stripped and
 * replaced by a line pointing at the live demo.
 */
export function GET() {
  const posts = getAllBlogPosts();

  const chunks = posts.map(post => {
    const body = post.content
      .replace(
        /<LiveStep[\s\S]*?\/>/g,
        '[Live editable demo of this step on the page.]'
      )
      // Story posts: a video of the app on the page, and a signup form that
      // means nothing as text.
      .replace(/<PhoneDemo[\s\S]*?\/>/g, '[Video of the app demo on the page.]')
      .replace(/<KitSignup[\s\S]*?\/>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return [
      `# ${post.title}`,
      '',
      `Source: ${BASE}/blog/${post.slug}`,
      ...(post.componentSlug
        ? [`Component: ${BASE}/components/${post.componentSlug}`]
        : []),
      `Published: ${post.date}`,
      `Category: ${post.category}`,
      '',
      post.description,
      '',
      body,
    ].join('\n');
  });

  const tutorials = posts.filter(p => p.kind === 'tutorial').length;
  const stories = posts.filter(p => p.kind === 'story').length;
  const header = [
    '# Dirck Mulder — full tutorial text',
    '',
    `${tutorials} tutorials on React and CSS animation components,`,
    `and ${stories} ${stories === 1 ? 'story post' : 'story posts'} on how a project was made.`,
    'Each tutorial corresponds to a working component with a live demo at the URL given.',
    '',
    '---',
    '',
  ].join('\n');

  return new Response(header + chunks.join('\n\n---\n\n') + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
