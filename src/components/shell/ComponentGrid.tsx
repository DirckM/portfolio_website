'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ComponentCard from './ComponentCard';
import FilterBar from './FilterBar';
import {
  type ComponentCategory,
  type ComponentEntry,
} from '@/lib/components-registry';

interface ComponentGridProps {
  components: ComponentEntry[];
  componentPreviews: Record<string, React.ReactNode>;
}

export default function ComponentGrid({
  components,
  componentPreviews,
}: ComponentGridProps) {
  const [filter, setFilter] = useState<ComponentCategory | 'all'>('all');

  const filtered =
    filter === 'all'
      ? components
      : components.filter(c => c.category === filter);

  return (
    <section>
      <FilterBar active={filter} onChange={setFilter} />
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map(component => (
              <motion.div
                key={component.slug}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ComponentCard
                  name={component.name}
                  slug={component.slug}
                  category={component.category}
                >
                  {componentPreviews[component.slug] || (
                    <div className="text-library-gray text-sm text-center">
                      {component.name}
                    </div>
                  )}
                </ComponentCard>
                <div className="mt-3">
                  <p className="text-sm font-medium text-black">
                    {component.name}
                  </p>
                  <p className="text-xs text-library-gray uppercase tracking-wider mt-0.5">
                    {component.category}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
