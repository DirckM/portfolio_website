import { NextResponse } from 'next/server';
import { renderWelcome } from '@/lib/email/welcome';
import { getAllBlogPosts } from '@/lib/blog-utils';

export const runtime = 'nodejs';

/**
 * Renders the welcome email in the browser, from the SAME function that sends
 * it, so what is approved here is what lands in an inbox.
 *
 * Development only. In production it 404s, because an open endpoint that renders
 * mail templates is a free reconnaissance tool and there is nothing here worth
 * the risk of leaving it reachable.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const html = renderWelcome({
    unsubscribeToken: 'preview-token-not-real',
    postCount: getAllBlogPosts().length,
  })
    // Assets resolve against the live site, which is right for a real send and
    // wrong here: anything added in this branch is not deployed yet and renders
    // as a broken image. Point them at this server instead.
    .replace(/https:\/\/dirckmulder\.com\/email/g, '/email');

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
