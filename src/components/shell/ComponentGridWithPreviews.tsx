'use client';

import { cardPreviews } from '@/lib/component-previews';
import ComponentGrid from './ComponentGrid';
import { type ComponentEntry } from '@/lib/components-registry';

export default function ComponentGridWithPreviews({
  components,
}: {
  components: ComponentEntry[];
}) {
  return (
    <ComponentGrid components={components} componentPreviews={cardPreviews} />
  );
}
