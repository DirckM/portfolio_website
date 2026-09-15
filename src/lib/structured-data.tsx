import type { BlogPost } from '@/lib/blog-utils';

const BASE = 'https://dirckmulder.com';

export const AUTHOR = {
  '@type': 'Person',
  name: 'Dirck Mulder',
  url: BASE,
  jobTitle: 'Software developer',
  knowsAbout: [
    'React',
    'CSS animation',
    'Next.js',
    'WebGL',
    'Front-end development',
  ],
} as const;

/**
 * Structured data exists here for AI answer engines as much as for Google.
 * An assistant deciding whether to cite a page leans on explicit author,
 * date and subject far more than a search crawler does, because it has to
 * justify the citation. TechArticle rather than BlogPosting is deliberate:
 * these are how-to pieces about a named technology, and `proficiencyLevel`
 * plus `dependencies` are the fields that say so.
 */
export function articleJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${BASE}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: AUTHOR,
    publisher: AUTHOR,
    inLanguage: 'en',
    isAccessibleForFree: true,
    articleSection: post.category,
    proficiencyLevel: 'Intermediate',
    dependencies: 'React, CSS',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE}/blog/${post.slug}`,
    },
    url: `${BASE}/blog/${post.slug}`,
    about: {
      '@type': 'SoftwareSourceCode',
      name: post.title,
      codeRepository: `${BASE}/components/${post.componentSlug}`,
      programmingLanguage: ['TypeScript', 'CSS'],
      runtimePlatform: 'React',
    },
  };
}

export function breadcrumbJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${BASE}/blog/${post.slug}`,
      },
    ],
  };
}

export function blogIndexJsonLd(posts: BlogPost[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${BASE}/blog#blog`,
    name: 'Dirck Mulder — build notes',
    description:
      'Tutorials on React and CSS animation components, each paired with a working, editable demo.',
    url: `${BASE}/blog`,
    inLanguage: 'en',
    author: AUTHOR,
    publisher: AUTHOR,
    blogPost: posts.map(post => ({
      '@type': 'TechArticle',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `${BASE}/blog/${post.slug}`,
      author: AUTHOR,
    })),
  };
}

/** Renders a JSON-LD block. Next keeps this in the server-rendered HTML. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
