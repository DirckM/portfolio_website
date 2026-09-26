import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import DesignsLanding from '@/components/designs/DesignsLanding';
import { cookieName, designsIssue, pageState } from '@/lib/designs';
import { designsDb } from '@/lib/designs-db';

const COUNT_WORDS: Record<number, string> = { 2: 'two', 3: 'three', 4: 'four' };

// Who is looking decides what the button does, so this page is never cached.
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string; ref?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const f = designsIssue(slug);
  if (!f) return { title: 'Not found | Dirck Mulder' };
  const title = `${f.showcase.title} | Dirck Mulder`;
  const description = `The code for ${f.showcase.items.length} app screens from issue ${String(f.number).padStart(3, '0')} of my newsletter. Plain HTML and CSS, free.`;
  const url = `https://dirckmulder.com/designs/${slug}`;
  // The issue's own cover: made for sharing, 1200x400, orange, with the number.
  const image = {
    url: `https://dirckmulder.com/email/${f.cover.image}`,
    width: 1200,
    height: 400,
    alt: f.cover.alt,
  };
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: f.showcase.title,
      description,
      url,
      type: 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: f.showcase.title,
      description,
      images: [image.url],
    },
  };
}

/**
 * The page behind each issue's "Get the code" button. See src/lib/designs.ts
 * for the two readers it serves. Rendering it never writes anything: a
 * download or a share is only counted by the POST a click makes.
 */
export default async function DesignsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { t, ref } = await searchParams;
  const f = designsIssue(slug);
  if (!f) notFound();

  const cookieToken = (await cookies()).get(cookieName(slug))?.value;
  const state = await pageState(designsDb, slug, t ?? cookieToken, ref);
  const d = f.showcase.designs!;
  const count = f.showcase.items.length;

  return (
    <DesignsLanding
      slug={slug}
      state={state.kind}
      refCode={state.kind === 'visitor' ? state.ref : null}
      hasTokenInUrl={Boolean(t)}
      kicker={`Made in ${f.period} · Issue ${String(f.number).padStart(3, '0')}`}
      title={f.showcase.title}
      countWord={COUNT_WORDS[count] ?? String(count)}
      size={d.size}
      credit={f.showcase.credit}
      items={f.showcase.items.map(item => ({
        // The page plays the mp4 the email GIF script made next to each GIF.
        src: `/email/${item.image.replace(/\.gif$/, '.mp4')}`,
        alt: item.alt,
        caption: item.caption,
      }))}
    />
  );
}
