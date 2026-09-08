import { MetadataRoute } from 'next';

/**
 * AI crawlers are named explicitly rather than left to the `*` rule.
 *
 * Two reasons. Some of these agents only read a rule that names them, and a
 * blanket allow reads as an oversight to anyone auditing the site. Naming them
 * is a statement that citation traffic is wanted here, which it is: ChatGPT is
 * already the third largest referrer to the blog, ahead of DuckDuckGo.
 *
 * Split into two groups because they do different jobs. Training crawlers feed
 * a model. Retrieval agents fetch a page live to answer a question someone is
 * asking right now, and those are the ones that produce a citation and a click.
 */
const AI_CRAWLERS = [
  // Retrieval and citation: these send traffic back.
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Perplexity-User',
  'Claude-User',
  'Claude-SearchBot',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'DuckAssistBot',
  'Meta-ExternalFetcher',
  // Training and indexing.
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'cohere-ai',
  'Amazonbot',
  'Applebot',
  'YouBot',
  'Diffbot',
  'Meta-ExternalAgent',
  'Bytespider',
  'CCBot',
  'Timpibot',
  'omgili',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      ...AI_CRAWLERS.map(userAgent => ({
        userAgent,
        allow: '/',
      })),
    ],
    sitemap: 'https://dirckmulder.com/sitemap.xml',
    host: 'https://dirckmulder.com',
  };
}
