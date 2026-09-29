import { NextResponse, type NextRequest } from 'next/server';
import { registerShare } from '@/lib/designs';
import { designsDb } from '@/lib/designs-db';
import { jsonBody, who } from '@/lib/designs-http';

export const runtime = 'nodejs';

/**
 * Registers one share action: its own share_links row, so each copied or
 * shared link can be followed on its own. POST only.
 */
export async function POST(request: NextRequest) {
  const body = await jsonBody<{ slug?: string; id?: string; method?: string }>(
    request
  );
  if (!body)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const { w, finish } = who(request, body.slug ?? '');
  const result = await registerShare(designsDb, {
    ...w,
    id: body.id ?? '',
    method: body.method === 'native' ? 'native' : 'copy',
  });
  if (!result.ok) {
    return finish(
      NextResponse.json({ error: result.error }, { status: result.status })
    );
  }
  return finish(NextResponse.json({ url: result.url }));
}
