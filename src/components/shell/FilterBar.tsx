'use client';

import {
  type ComponentCategory,
  CATEGORY_LABELS,
} from '@/lib/components-registry';

interface FilterBarProps {
  active: ComponentCategory | 'all';
  onChange: (category: ComponentCategory | 'all') => void;
}

const categories: (ComponentCategory | 'all')[] = [
  'all',
  'text',
  'animations',
  'components',
  'backgrounds',
  'blocks',
];

export default function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="sticky top-[68px] z-40 bg-white/80 backdrop-blur-sm border-b border-library-border">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex gap-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`text-sm transition-colors pb-1 border-b-2 ${
              active === cat
                ? 'text-black border-black'
                : 'text-library-gray border-transparent hover:text-black'
            }`}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
    </div>
  );
}
