import { type ComponentCategory, CATEGORY_LABELS } from '@/lib/components-registry';

interface GlassmorphicOverlayProps {
  name: string;
  category: ComponentCategory;
  visible: boolean;
}

export default function GlassmorphicOverlay({
  name,
  category,
  visible,
}: GlassmorphicOverlayProps) {
  return (
    <div
      className={`absolute inset-x-4 bottom-4 rounded-lg bg-black/60 backdrop-blur-md px-4 py-3 transition-all duration-300 ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <p className="text-white text-sm font-medium">{name}</p>
      <p className="text-white/60 text-xs mt-0.5">
        {CATEGORY_LABELS[category]}
      </p>
    </div>
  );
}
