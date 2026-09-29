import { NextResponse, type NextRequest } from 'next/server';
import { recordButtonPress, type ButtonKind } from '@/lib/designs';
import { designsDb } from '@/lib/designs-db';
import { jsonBody, who } from '@/lib/designs-http';

export const runtime = 'nodejs';

/**
 * Any other button press on /designs/<slug> or the blog's kit panel (copy
 * success, share sheet opened, completed or dismissed, form opened or sent).
 * POST only, from the click itself.
 */
export async function POST(request: NextRequest) {
  const body = await jsonBody<{
    slug?: string;
    page?: string;
    kind?: string;
    shareId?: string;
  }>(request);
  if (!body)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const { w, finish } = who(request, body.slug ?? '');
  const result = await recordButtonPress(designsDb, {
    ...w,
    page: body.page === 'blog-kit' ? 'blog-kit' : 'designs',
    kind: (body.kind ?? '') as ButtonKind,
    shareId: body.shareId ?? null,
  });
  return finish(
    NextResponse.json(
      { ok: result.ok },
      { status: result.ok ? 200 : result.status }
    )
  );
}
