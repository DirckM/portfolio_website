'use client';

import { useRef, useState } from 'react';

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  perspective?: number;
  glareEnable?: boolean;
  glareMaxOpacity?: number;
}

export default function TiltedCard({
  children,
  className = '',
  maxTilt = 15,
  scale = 1.05,
  perspective = 1000,
  glareEnable = true,
  glareMaxOpacity = 0.2,
}: TiltedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [glareStyle, setGlareStyle] = useState({
    opacity: 0,
    background: '',
  });

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;

    const rotateX = ((y - halfH) / halfH) * -maxTilt;
    const rotateY = ((x - halfW) / halfW) * maxTilt;

    setTransform(
      `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
    );

    if (glareEnable) {
      const angle = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI) + 180;
      setGlareStyle({
        opacity: glareMaxOpacity,
        background: `linear-gradient(${angle}deg, rgba(255,255,255,${glareMaxOpacity}) 0%, transparent 80%)`,
      });
    }
  }

  function handleMouseLeave() {
    setTransform('');
    setGlareStyle({ opacity: 0, background: '' });
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-transform duration-200 ease-out ${className}`}
      style={{ transform: transform || undefined }}
    >
      {children}
      {glareEnable && (
        <div
          className='absolute inset-0 pointer-events-none transition-opacity duration-200'
          style={{
            opacity: glareStyle.opacity,
            background: glareStyle.background,
          }}
        />
      )}
    </div>
  );
}
