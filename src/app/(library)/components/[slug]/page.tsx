import { Metadata } from 'next';
import Link from 'next/link';
import {
  componentRegistry,
  getComponentBySlug,
  getComponentsByCategory,
  CATEGORY_LABELS,
} from '@/lib/components-registry';
import ComponentCard from '@/components/shell/ComponentCard';
import { fullDemos, cardPreviews } from '@/lib/component-previews';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return componentRegistry.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const component = getComponentBySlug(slug);
  if (!component) return { title: 'Not Found' };

  return {
    title: `${component.name} | Component Library | Dirck Mulder`,
    description: component.description,
  };
}

export default async function ComponentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const component = getComponentBySlug(slug);

  if (!component) {
    return (
      <div className='pt-32 text-center'>
        <h1 className='text-2xl font-[family-name:var(--font-instrument-serif)]'>
          Component not found
        </h1>
      </div>
    );
  }

  const related = getComponentsByCategory(component.category)
    .filter(c => c.slug !== slug)
    .slice(0, 3);

  return (
    <div className='pt-24'>
      <section className='w-full min-h-[60vh] flex items-center justify-center bg-library-cream border-b border-library-border'>
        {fullDemos[slug] || (
          <div className='text-library-gray'>Live demo: {component.name}</div>
        )}
      </section>

      <section className='max-w-[1200px] mx-auto px-6 py-16'>
        <h1 className='text-4xl font-[family-name:var(--font-instrument-serif)]'>
          {component.name}
        </h1>
        <div className='flex items-center gap-4 mt-3'>
          <span className='text-xs text-library-gray uppercase tracking-wider'>
            {CATEGORY_LABELS[component.category]}
          </span>
        </div>
        <p className='text-library-gray mt-4 max-w-xl'>
          {component.description}
        </p>
        <Link
          href={`/blog/${slug}`}
          className='inline-block mt-6 text-sm text-black underline underline-offset-4 hover:no-underline transition-all'
        >
          Read the blog post
        </Link>
      </section>

      {related.length > 0 && (
        <section className='max-w-[1200px] mx-auto px-6 pb-24'>
          <h2 className='text-lg font-[family-name:var(--font-instrument-serif)] mb-8'>
            Related components
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {related.map(r => (
              <ComponentCard
                key={r.slug}
                name={r.name}
                slug={r.slug}
                category={r.category}
              >
                {cardPreviews[r.slug] || (
                  <div className='text-library-gray text-sm'>{r.name}</div>
                )}
              </ComponentCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
