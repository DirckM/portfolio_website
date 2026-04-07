import { Metadata } from 'next';
import { componentRegistry } from '@/lib/components-registry';
import Hero3DCarousel from '@/components/shell/Hero3DCarousel';
import ComponentGridWithPreviews from '@/components/shell/ComponentGridWithPreviews';

export const metadata: Metadata = {
  title: 'Component Library | Dirck Mulder',
  description:
    'A curated collection of beautiful, interactive React components. Text animations, 3D effects, glassmorphism, and more.',
};

export default function ComponentsPage() {
  return (
    <>
      <Hero3DCarousel />
      <ComponentGridWithPreviews components={componentRegistry} />
    </>
  );
}
