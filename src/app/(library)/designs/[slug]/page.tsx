import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import DesignsActions from '@/components/shell/DesignsActions';
import { cookieName, designsIssue, pageState } from '@/lib/designs';
import { designsDb } from '@/lib/designs-db';

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
  const issueNo = String(f.number).padStart(3, '0');
  const d = f.showcase.designs!;

  return (
    <div className='px-6 pt-28 pb-24'>
      <div className='mx-auto w-full max-w-[1120px]'>
        <p className='flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-black/50'>
          <span>
            Made in {f.period} · Issue {issueNo}
          </span>
          <span className='bg-[#ff7e35] px-2 py-[3px] text-[10px] font-bold tracking-[0.14em] text-white'>
            Free
          </span>
        </p>

        <div className='mt-6 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-end'>
          <div>
            <h1 className='text-4xl leading-[1.05] text-black md:text-6xl font-[family-name:var(--font-instrument-serif)]'>
              {f.showcase.title}
            </h1>
            <p className='mt-6 max-w-[620px] text-lg leading-relaxed text-black/70'>
              The code for all{' '}
              {['two', 'three', 'four'][f.showcase.items.length - 2]}, one
              folder each. Plain HTML and CSS you can open in a browser, pull
              apart and reuse.
            </p>
          </div>
          <DesignsActions
            slug={slug}
            state={state.kind}
            refCode={state.kind === 'visitor' ? state.ref : null}
            hasTokenInUrl={Boolean(t)}
            size={d.size}
            title={f.showcase.title}
          />
        </div>

        <div className='mt-16 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4'>
          {f.showcase.items.map(item => (
            <figure key={item.image}>
              <div className='overflow-hidden bg-black/[0.03]'>
                <video
                  className='block aspect-[4/5] w-full object-contain'
                  src={`/email/${item.image.replace(/\.gif$/, '.mp4')}`}
                  poster={`/email/${item.image}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label={item.alt}
                />
              </div>
              <figcaption className='mt-4 text-sm leading-relaxed text-black/70'>
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <p className='mt-16 max-w-[720px] border-t border-black/10 pt-6 text-sm leading-relaxed text-black/50'>
          {f.showcase.credit}
        </p>
      </div>
    </div>
  );
}
