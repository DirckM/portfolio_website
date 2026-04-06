'use client';

interface ElectricBorderProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  color?: string;
  borderRadius?: string;
  borderWidth?: number;
}

export default function ElectricBorder({
  children,
  className = '',
  duration = 3,
  color = '#ffffff',
  borderRadius = '12px',
  borderWidth = 2,
}: ElectricBorderProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ borderRadius }}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <div
          className="absolute inset-0"
          style={{
            borderRadius,
            padding: `${borderWidth}px`,
            background: `conic-gradient(from 0deg, transparent 0%, ${color} 10%, transparent 20%)`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: `electric-spin ${duration}s linear infinite`,
          }}
        />
      </div>

      <div className="relative" style={{ borderRadius }}>
        {children}
      </div>

      <style>{`
        @keyframes electric-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
