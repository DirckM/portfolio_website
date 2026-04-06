import { MetadataRoute } from 'next';
import { componentRegistry } from '@/lib/components-registry';
import { getAllBlogPosts } from '@/lib/blog-utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dirckmulder.com';

  const componentPages = componentRegistry.map(c => ({
    url: `${baseUrl}/components/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const blogPosts = getAllBlogPosts().map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/components`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...componentPages,
    ...blogPosts,
  ];
}
