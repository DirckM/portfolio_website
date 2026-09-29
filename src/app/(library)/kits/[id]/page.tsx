import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import KitLanding from '@/components/designs/KitLanding';
import { cookieName, pageState } from '@/lib/designs';
import { designsDb } from '@/lib/designs-db';
import { kitWithPage } from '@/lib/kits';

// Who is looking decides what the button does, so this page is never cached.
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string; ref?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const kit = kitWithPage(id);
  if (!kit?.page) return { title: 'Not found | Dirck Mulder' };
  const p = kit.page;
  const title = `${p.title} | Dirck Mulder`;
  const url = `https://dirckmulder.com/kits/${id}`;
  const image = {
    url: `https://dirckmulder.com${p.ogImage.src}`,
    width: p.ogImage.width,
    height: p.ogImage.height,
    alt: p.ogImage.alt,
  };
  return {
    title,
    description: p.line,
    alternates: { canonical: url },
    openGraph: {
      title: p.title,
      description: p.line,
      url,
      type: 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: p.title,
      description: p.line,
      images: [image.url],
    },
  };
}

/**
 * The page behind a kit's button in the newsletter and in the welcome email,
 * built on the same logic as /designs/<slug> (src/lib/designs.ts, key
 * 'kit:<id>'). Rendering it never writes anything: a download or a share is
 * only counted by the POST a click makes.
 *
 * The zips in public/kits/ are served at /kits/<file>.zip. Next serves files
 * from public/ before it tries a dynamic route, so those links keep working.
 */
export default async function KitPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { t, ref } = await searchParams;
  const kit = kitWithPage(id);
  if (!kit?.page) notFound();

  const key = `kit:${id}`;
  const cookieToken = (await cookies()).get(cookieName(key))?.value;
  const state = await pageState(designsDb, key, t ?? cookieToken, ref);

  return (
    <KitLanding
      id={id}
      state={state.kind}
      refCode={state.kind === 'visitor' ? state.ref : null}
      hasTokenInUrl={Boolean(t)}
      name={kit.name}
      size={kit.size}
      page={kit.page}
    />
  );
}
