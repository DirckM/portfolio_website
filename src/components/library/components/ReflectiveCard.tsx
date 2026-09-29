'use client';

import React, { useRef, useState } from 'react';
import { Fingerprint, Activity, Lock } from 'lucide-react';

interface ReflectiveCardProps {
  blurStrength?: number;
  color?: string;
  metalness?: number;
  roughness?: number;
  overlayColor?: string;
  displacementStrength?: number;
  noiseScale?: number;
  specularConstant?: number;
  grayscale?: number;
  glassDistortion?: number;
  className?: string;
  style?: React.CSSProperties;
}

const ReflectiveCard: React.FC<ReflectiveCardProps> = ({
  blurStrength = 12,
  color = 'white',
  metalness = 1,
  roughness = 0.4,
  overlayColor = 'rgba(255, 255, 255, 0.1)',
  specularConstant = 1.2,
  className = '',
  style = {},
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const cssVariables = {
    '--blur-strength': `${blurStrength}px`,
    '--metalness': metalness,
    '--roughness': roughness,
    '--overlay-color': overlayColor,
    '--text-color': color,
  } as React.CSSProperties;

  function handlePointerMove(e: React.PointerEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setMousePos({ x: 0.5, y: 0.5 })}
      className={`relative w-[320px] h-[500px] rounded-[20px] overflow-hidden bg-[#1a1a1a] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset] isolate font-sans ${className}`}
      style={{ ...style, ...cssVariables }}
    >
      {/* Brushed-metal base with a light source that follows the pointer.
          The old SVG displacement filter rendered as silver static and
          hid the card, so the reflection is plain gradients now. */}
      <div
        className='absolute inset-0 z-0'
        style={{
          background: `linear-gradient(${120 + (mousePos.x - 0.5) * 40}deg, #0d0d1f 0%, #2a2440 35%, #15142a 55%, #0a0a18 100%)`,
        }}
      />
      <div
        className='absolute inset-0 z-0 transition-[background] duration-300 ease-out'
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(180,170,255,0.55) 0%, transparent 55%)`,
          filter: `blur(${blurStrength}px)`,
          opacity: 0.6 + specularConstant * 0.2,
        }}
      />
      <div
        className='absolute inset-0 z-20 pointer-events-none mix-blend-screen transition-[background] duration-300 ease-out'
        style={{
          background: `linear-gradient(${105 + (mousePos.x - 0.5) * 30}deg, transparent ${mousePos.x * 100 - 30}%, rgba(255,255,255,0.35) ${mousePos.x * 100}%, transparent ${mousePos.x * 100 + 30}%)`,
          opacity: metalness * 0.8,
        }}
      />

      <div
        className='absolute inset-0 z-10 opacity-[var(--roughness,0.4)] pointer-events-none mix-blend-overlay'
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%20200%20200%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27noiseFilter%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.8%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url(%23noiseFilter)%27%2F%3E%3C%2Fsvg%3E')",
        }}
      />

      <div className='absolute inset-0 z-20 bg-[linear-gradient(135deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.1)_40%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.1)_60%,rgba(255,255,255,0.3)_100%)] pointer-events-none mix-blend-overlay opacity-[var(--metalness,1)]' />

      <div className='absolute inset-0 rounded-[20px] p-[1px] bg-[linear-gradient(135deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.6)_100%)] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] z-20 pointer-events-none' />

      <div className='relative z-10 h-full flex flex-col justify-between p-8 text-[var(--text-color,white)] bg-[var(--overlay-color,rgba(255,255,255,0.05))]'>
        <div className='flex justify-between items-center border-b border-white/20 pb-4'>
          <div className='flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] px-2 py-1 bg-white/10 rounded border border-white/20'>
            <Lock size={14} className='opacity-80' />
            <span>SECURE ACCESS</span>
          </div>
          <Activity className='opacity-80' size={20} />
        </div>

        <div className='flex-1 flex flex-col justify-end items-center text-center gap-6 mb-8'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold tracking-[0.05em] m-0 mb-2 drop-shadow-md'>
              ALEXANDER DOE
            </h2>
            <p className='text-xs tracking-[0.2em] opacity-70 m-0 uppercase'>
              SENIOR DEVELOPER
            </p>
          </div>
        </div>

        <div className='flex justify-between items-end border-t border-white/20 pt-6'>
          <div className='flex flex-col gap-1'>
            <span className='text-[9px] tracking-[0.1em] opacity-60'>
              ID NUMBER
            </span>
            <span className='font-mono text-sm tracking-[0.05em]'>
              8901-2345-6789
            </span>
          </div>
          <div className='opacity-40'>
            <Fingerprint size={32} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflectiveCard;
