import { NextResponse } from 'next/server';
import { renderWelcome } from '@/lib/email/welcome';
import { getTutorialPosts } from '@/lib/blog-utils';
import { kitByName } from '@/lib/kits';

export const runtime = 'nodejs';

/**
 * Renders the welcome email in the browser, from the SAME function that sends
 * it, so what is approved here is what lands in an inbox.
 *
 * `?kit=app-demo` renders the version someone gets after signing up from that
 * kit's form, with the download section at the top.
 *
 * Development only. In production it 404s, because an open endpoint that renders
 * mail templates is a free reconnaissance tool and there is nothing here worth
 * the risk of leaving it reachable.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const html = renderWelcome({
    unsubscribeToken: 'preview_token_not_real',
    postCount: getTutorialPosts().length,
    kit: kitByName(new URL(request.url).searchParams.get('kit')),
  })
    // Assets resolve against the live site, which is right for a real send and
    // wrong here: anything added in this branch is not deployed yet and renders
    // as a broken image. Point them at this server instead.
    .replace(/https:\/\/dirckmulder\.com\/(email|kits)/g, '/$1');

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
