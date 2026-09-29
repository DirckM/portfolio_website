import { NextResponse } from 'next/server';
import { issueBySlug } from '@/content/newsletter';
import { toIssue, validateIssueFile } from '@/lib/email/issue-file';
import { renderIssue, renderIssueText } from '@/lib/email/issue';

export const runtime = 'nodejs';

/**
 * Renders a newsletter issue in the browser, from the SAME functions the send
 * script uses, so what is approved here is what lands in an inbox.
 *
 *   /api/newsletter/preview-issue?slug=2026-09              the HTML part
 *   /api/newsletter/preview-issue?slug=2026-09&format=text  the plain-text part
 *
 * Development only, like the other preview routes. In production it 404s.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const params = new URL(request.url).searchParams;
  const file = issueBySlug(params.get('slug'));
  if (!file)
    return new NextResponse('No issue with that slug', { status: 404 });

  // A draft that breaks the writing rules still renders, with the problems on
  // top, so the fix can be made while looking at it.
  const problems = validateIssueFile(file);
  const issue = toIssue(file, 'preview_token_not_real');

  if (params.get('format') === 'text') {
    const text = renderIssueText(issue);
    return new NextResponse(
      `${problems.length ? `RULE PROBLEMS:\n${problems.join('\n')}\n\n` : ''}Subject: ${file.subject}\n\n${text}`,
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  let html = renderIssue(issue)
    // Assets resolve against the live site, which is right for a real send and
    // wrong here: anything added in this branch is not deployed yet and renders
    // as a broken image. Point them at this server instead.
    .replace(/https:\/\/dirckmulder\.com\/(email|kits)/g, '/$1');
  if (problems.length) {
    html = html.replace(
      /(<body[^>]*>)/,
      `$1<pre style="margin:0;padding:12px 16px;background:#c44b10;color:#fff;font:12px/1.5 monospace;white-space:pre-wrap;">${problems
        .map(p => p.replace(/</g, '&lt;'))
        .join('\n')}</pre>`
    );
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
