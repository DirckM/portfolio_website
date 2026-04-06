'use client';

import { useRef, useEffect } from 'react';

interface LineWavesProps {
  lineCount?: number;
  lineColor?: string;
  lineWidth?: number;
  amplitude?: number;
  frequency?: number;
  speed?: number;
  className?: string;
}

export default function LineWaves({
  lineCount = 8,
  lineColor = '#e5e5e5',
  lineWidth = 1,
  amplitude = 40,
  frequency = 0.02,
  speed = 0.02,
  className = '',
}: LineWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;

      const spacing = h / (lineCount + 1);

      for (let i = 1; i <= lineCount; i++) {
        const baseY = spacing * i;
        ctx.beginPath();

        for (let x = 0; x <= w; x++) {
          const y =
            baseY +
            Math.sin(x * frequency + offsetRef.current + i * 0.8) *
              amplitude *
              (1 - Math.abs(i - lineCount / 2) / lineCount);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      offsetRef.current += speed;
      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [lineCount, lineColor, lineWidth, amplitude, frequency, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
    />
  );
}
