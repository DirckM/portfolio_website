import { NextResponse } from 'next/server';
import { pgRpc } from '@/lib/db';
import { isVariant, type ExperimentKey } from '@/lib/experiments';

export const runtime = 'nodejs';

/**
 * The experiment's DENOMINATOR: this visitor saw this widget on this post.
 *
 * Aggregated per day, variant and post by a Postgres function rather than
 * stored one row per view. An exposure row per pageview would outgrow every
 * other table here within a month and would tell us nothing extra.
 *
 * Arrives via navigator.sendBeacon, so it must swallow everything. A reader
 * scrolling past the foot of a post should never see an error, and a failed
 * count is a slightly wrong denominator rather than a broken page.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const key = body.experiment_key as ExperimentKey;
    if (key && body.variant && body.post_slug && isVariant(key, body.variant)) {
      await pgRpc('bump_exposure', {
        p_experiment: key,
        p_variant: body.variant,
        p_slug: String(body.post_slug).slice(0, 120),
      });
    }
  } catch {
    /* deliberately silent */
  }
  return new NextResponse(null, { status: 204 });
}
