import { NextResponse, type NextRequest } from 'next/server';
import { recordShareVisit } from '@/lib/designs';
import { designsDb } from '@/lib/designs-db';
import { jsonBody, who } from '@/lib/designs-http';

export const runtime = 'nodejs';

/**
 * A visit through a share link, reported by the page after it loaded in a
 * real browser. One row per browser per link, so a reload does not count
 * twice. POST only: the page's GET is also opened by link previewers
 * (WhatsApp, iMessage, Slack unfurls) and those are not visits.
 */
export async function POST(request: NextRequest) {
  const body = await jsonBody<{ ref?: string }>(request);
  if (!body)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const { w, finish } = who(request, '');
  const result = await recordShareVisit(designsDb, {
    ref: body.ref ?? '',
    visitorHash: w.visitorHash,
  });
  return finish(
    NextResponse.json(
      { ok: result.ok },
      { status: result.ok ? 200 : result.status }
    )
  );
}
