'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Dot {
  lat: number;
  lng: number;
  label?: string;
}

interface Arc {
  from: Dot;
  to: Dot;
  color?: string;
}

interface WorldMapProps {
  dots?: Dot[];
  arcs?: Arc[];
  dotColor?: string;
  lineColor?: string;
  backgroundColor?: string;
  globeColor?: string;
  className?: string;
  animated?: boolean;
}

function latLngToXY(
  lat: number,
  lng: number,
  width: number,
  height: number
): [number, number] {
  // Equirectangular projection
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

function bezierArcPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  steps = 40
): [number, number][] {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const cx = midX;
  const cy = midY - dist * 0.35;

  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const bx = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t ** 2 * x2;
    const by = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t ** 2 * y2;
    points.push([bx, by]);
  }
  return points;
}

const _WORLD_SVG_PATH =
  'M 0 90 L 0 270 L 720 270 L 720 90 Z M 60 90 L 90 60 L 120 90 Z M 300 60 L 360 30 L 420 60 L 390 90 L 330 90 Z';

const DEFAULT_DOTS: Dot[] = [
  { lat: 40.7128, lng: -74.006, label: 'New York' },
  { lat: 51.5074, lng: -0.1278, label: 'London' },
  { lat: 35.6762, lng: 139.6503, label: 'Tokyo' },
  { lat: -33.8688, lng: 151.2093, label: 'Sydney' },
  { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
  { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  { lat: -23.5505, lng: -46.6333, label: 'Sao Paulo' },
  { lat: 28.6139, lng: 77.209, label: 'New Delhi' },
  { lat: 55.7558, lng: 37.6173, label: 'Moscow' },
  { lat: -1.2921, lng: 36.8219, label: 'Nairobi' },
];

const DEFAULT_ARCS: Arc[] = [
  { from: DEFAULT_DOTS[0], to: DEFAULT_DOTS[1] },
  { from: DEFAULT_DOTS[1], to: DEFAULT_DOTS[2] },
  { from: DEFAULT_DOTS[2], to: DEFAULT_DOTS[3] },
  { from: DEFAULT_DOTS[0], to: DEFAULT_DOTS[4] },
  { from: DEFAULT_DOTS[5], to: DEFAULT_DOTS[8] },
  { from: DEFAULT_DOTS[6], to: DEFAULT_DOTS[0] },
  { from: DEFAULT_DOTS[7], to: DEFAULT_DOTS[4] },
];

export default function WorldMap({
  dots = DEFAULT_DOTS,
  arcs = DEFAULT_ARCS,
  dotColor = '#38bdf8',
  lineColor = '#38bdf8',
  backgroundColor = '#0f172a',
  globeColor = '#1e293b',
  className,
  animated = true,
}: WorldMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const progressRef = useRef<number[]>(arcs.map(() => 0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const dotPositions = dots.map(({ lat, lng }) => latLngToXY(lat, lng, W, H));
    const arcPaths = arcs.map(({ from, to }) => {
      const [x1, y1] = latLngToXY(from.lat, from.lng, W, H);
      const [x2, y2] = latLngToXY(to.lat, to.lng, W, H);
      return bezierArcPoints(x1, y1, x2, y2, 60);
    });

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, W, H);

      // Simple grid lines (latitude/longitude)
      ctx.strokeStyle = globeColor;
      ctx.lineWidth = 0.5;
      for (let lng = -180; lng <= 180; lng += 30) {
        const x = ((lng + 180) / 360) * W;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let lat = -90; lat <= 90; lat += 30) {
        const y = ((90 - lat) / 180) * H;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Draw arcs
      arcs.forEach((_, i) => {
        const points = arcPaths[i];
        const color = arcs[i].color || lineColor;
        const progress = animated ? progressRef.current[i] : 1;
        const endIdx = Math.floor(progress * (points.length - 1));

        if (endIdx < 1) return;

        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let j = 1; j <= endIdx; j++) {
          ctx.lineTo(points[j][0], points[j][1]);
        }

        const grad = ctx.createLinearGradient(
          points[0][0],
          points[0][1],
          points[endIdx][0],
          points[endIdx][1]
        );
        grad.addColorStop(0, `${color}00`);
        grad.addColorStop(0.5, color);
        grad.addColorStop(1, color);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glowing dot at current position
        const tip = points[endIdx];
        ctx.beginPath();
        ctx.arc(tip[0], tip[1], 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Draw location dots
      dotPositions.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();

        // Outer ring
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = `${dotColor}55`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    if (!animated) {
      draw();
      return;
    }

    const speed = 0.004;
    const tick = () => {
      progressRef.current = progressRef.current.map((p, _i) => {
        const next = p + speed * (0.5 + Math.random() * 0.5);
        return next > 1.3 ? 0 : next;
      });
      draw();
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animRef.current);
  }, [dots, arcs, dotColor, lineColor, backgroundColor, globeColor, animated]);

  return (
    <div className={cn('w-full h-full relative', className)}>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className='w-full h-full object-contain'
      />
    </div>
  );
}
