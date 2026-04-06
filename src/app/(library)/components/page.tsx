import { Metadata } from 'next';
import { componentRegistry } from '@/lib/components-registry';
import Hero3DCarousel from '@/components/shell/Hero3DCarousel';
import ComponentGrid from '@/components/shell/ComponentGrid';
import { cardPreviews } from '@/lib/component-previews';

export const metadata: Metadata = {
  title: 'Component Library | Dirck Mulder',
  description:
    'A curated collection of beautiful, interactive React components. Text animations, 3D effects, glassmorphism, and more.',
};

export default function ComponentsPage() {
  return (
    <>
      <Hero3DCarousel componentPreviews={cardPreviews} />
      <ComponentGrid
        components={componentRegistry}
        componentPreviews={cardPreviews}
      />
    </>
  );
}
