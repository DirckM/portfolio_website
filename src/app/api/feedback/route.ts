import { NextResponse } from 'next/server';
import { pgInsert } from '@/lib/db';
import { pseudonymise } from '@/lib/tokens';
import { isVariant, type ExperimentKey } from '@/lib/experiments';
import { getAllBlogPosts } from '@/lib/blog-utils';

export const runtime = 'nodejs';

/**
 * Records one person's answer about one post.
 *
 * The slug is validated against the posts that actually exist, and the variant
 * against the live arms of the named experiment. Without those two checks the
 * table fills with junk slugs and invented variants, and the experiment
 * readout becomes unreadable exactly when you want to trust it.
 *
 * The visitor id arrives raw and is hashed here. It is never stored raw, and
 * there is no IP column to put one in.
 */
export async function POST(request: Request) {
  let body: {
    post_slug?: string;
    experiment_key?: string;
    variant?: string;
    visitor_id?: string;
    rating?: number | null;
    choice?: string | null;
    comment?: string | null;
    path?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const slug = body.post_slug?.trim();
  const key = body.experiment_key?.trim() as ExperimentKey | undefined;
  const variant = body.variant?.trim();
  const visitorId = body.visitor_id?.trim();

  if (!slug || !key || !variant || !visitorId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (!getAllBlogPosts().some(p => p.slug === slug)) {
    return NextResponse.json({ error: 'Unknown post' }, { status: 400 });
  }
  if (!isVariant(key, variant)) {
    return NextResponse.json({ error: 'Unknown variant' }, { status: 400 });
  }

  const rating =
    typeof body.rating === 'number' && body.rating >= -1 && body.rating <= 5
      ? body.rating
      : null;

  // Upsert on the unique key, so revising an answer replaces it rather than
  // counting the same person twice in the experiment.
  const res = await pgInsert(
    'post_feedback',
    {
      post_slug: slug,
      experiment_key: key,
      variant,
      visitor_hash: pseudonymise(visitorId),
      rating,
      choice: body.choice?.slice(0, 40) ?? null,
      comment: body.comment?.slice(0, 2000) ?? null,
      path: body.path?.slice(0, 200) ?? null,
    },
    { returning: false, upsertOn: 'experiment_key,post_slug,visitor_hash' }
  );

  if (!res.ok) {
    console.error('feedback insert failed:', res.error);
    // Never surface this. They did us a favour and an error implies otherwise.
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: true });
}
