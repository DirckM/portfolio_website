'use client';

import { useEffect, useRef } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  speed?: number;
  enableShadow?: boolean;
}

export default function GlitchText({
  text,
  className = '',
  speed = 500,
  enableShadow = true,
}: GlitchTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const style = document.createElement('style');
    const id = `glitch-${Math.random().toString(36).slice(2, 8)}`;
    container.setAttribute('data-glitch-id', id);

    style.textContent = `
      [data-glitch-id="${id}"] {
        position: relative;
        display: inline-block;
      }

      [data-glitch-id="${id}"]::before,
      [data-glitch-id="${id}"]::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      [data-glitch-id="${id}"]::before {
        color: #ff0000;
        animation: glitch-before-${id} ${speed}ms infinite linear alternate-reverse;
        clip-path: inset(0 0 60% 0);
        ${enableShadow ? 'text-shadow: -2px 0 #ff0000;' : ''}
      }

      [data-glitch-id="${id}"]::after {
        color: #0000ff;
        animation: glitch-after-${id} ${speed}ms infinite linear alternate-reverse;
        clip-path: inset(40% 0 0 0);
        ${enableShadow ? 'text-shadow: 2px 0 #0000ff;' : ''}
      }

      @keyframes glitch-before-${id} {
        0% { clip-path: inset(0 0 80% 0); transform: translate(-2px, -1px); }
        20% { clip-path: inset(20% 0 60% 0); transform: translate(2px, 1px); }
        40% { clip-path: inset(40% 0 40% 0); transform: translate(-1px, 2px); }
        60% { clip-path: inset(60% 0 20% 0); transform: translate(1px, -2px); }
        80% { clip-path: inset(10% 0 70% 0); transform: translate(-2px, 1px); }
        100% { clip-path: inset(30% 0 50% 0); transform: translate(2px, -1px); }
      }

      @keyframes glitch-after-${id} {
        0% { clip-path: inset(60% 0 0 0); transform: translate(2px, 1px); }
        20% { clip-path: inset(40% 0 20% 0); transform: translate(-2px, -1px); }
        40% { clip-path: inset(20% 0 40% 0); transform: translate(1px, -2px); }
        60% { clip-path: inset(50% 0 10% 0); transform: translate(-1px, 2px); }
        80% { clip-path: inset(70% 0 5% 0); transform: translate(2px, -1px); }
        100% { clip-path: inset(80% 0 0 0); transform: translate(-2px, 1px); }
      }
    `;

    document.head.appendChild(style);
    return () => style.remove();
  }, [speed, enableShadow]);

  return (
    <div ref={containerRef} data-text={text} className={className}>
      {text}
    </div>
  );
}
