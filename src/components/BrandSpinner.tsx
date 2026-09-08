'use client';

/**
 * Brand loading spinner: one ring drawn as three arcs, one per craft
 * (dev, designer, storyteller), in the three brand oranges. The spin is
 * eased per revolution so it feels hand-spun rather than mechanical.
 */

const ARCS: { color: string; rotation: number }[] = [
  { color: '#FF9A5C', rotation: -90 },
  { color: '#FF7E35', rotation: 30 },
  { color: '#E66A1A', rotation: 150 },
];

interface BrandSpinnerProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function BrandSpinner({
  size = 56,
  strokeWidth = 4.5,
  className = '',
}: BrandSpinnerProps) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (circumference * 96) / 360;

  return (
    <span
      role='status'
      aria-label='Loading'
      className={`inline-block animate-brand-spin ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox='0 0 56 56' width={size} height={size} aria-hidden='true'>
        {ARCS.map(arc => (
          <circle
            key={arc.color}
            cx='28'
            cy='28'
            r={radius}
            fill='none'
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap='round'
            strokeDasharray={`${arcLength} ${circumference}`}
            transform={`rotate(${arc.rotation} 28 28)`}
          />
        ))}
      </svg>
    </span>
  );
}
