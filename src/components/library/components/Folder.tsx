'use client';

import React, { useState, useEffect } from 'react';

interface FolderProps {
  color?: string;
  size?: number;
  items?: React.ReactNode[];
  className?: string;
  triggerOnHover?: boolean;
  open?: boolean;
  hidePapers?: boolean;
  progress?: number;
}

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3)
    color = color
      .split('')
      .map(c => c + c)
      .join('');
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return (
    '#' +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const openTargets = [
  { tx: -120, ty: -70, r: -15 },
  { tx: 10, ty: -70, r: 15 },
  { tx: -50, ty: -100, r: 5 },
];

const Folder: React.FC<FolderProps> = ({
  color = '#5227FF',
  size = 1,
  items = [],
  className = '',
  triggerOnHover = false,
  open: controlledOpen,
  hidePapers = false,
  progress,
}) => {
  const maxItems = 3;
  const papers = items.slice(0, maxItems);
  while (papers.length < maxItems) papers.push(null);

  const isControlled = controlledOpen !== undefined;
  const isProgressDriven = progress !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);

  let open: boolean;
  if (isProgressDriven) {
    open = progress > 0.01;
  } else if (isControlled) {
    open = controlledOpen;
  } else {
    open = internalOpen;
  }

  const [paperOffsets, setPaperOffsets] = useState<{ x: number; y: number }[]>(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
  );

  useEffect(() => {
    if (isControlled && !controlledOpen) {
      setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
    }
  }, [controlledOpen, isControlled]);

  const folderBackColor = darkenColor(color, 0.08);
  const paper1 = darkenColor('#ffffff', 0.1);
  const paper2 = darkenColor('#ffffff', 0.05);
  const paper3 = '#ffffff';

  const handleClick = () => {
    if (triggerOnHover || isControlled || isProgressDriven) return;
    setInternalOpen(prev => !prev);
    if (internalOpen)
      setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
  };

  const handleMouseEnter = () => {
    if (triggerOnHover && !isControlled && !isProgressDriven && !internalOpen)
      setInternalOpen(true);
  };

  const handleMouseLeave = () => {
    if (triggerOnHover && !isControlled && !isProgressDriven && internalOpen) {
      setInternalOpen(false);
      setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
    }
  };

  const handlePaperMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    if (!open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;
    setPaperOffsets(prev => {
      const n = [...prev];
      n[index] = { x: offsetX, y: offsetY };
      return n;
    });
  };

  const handlePaperMouseLeave = (
    _e: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    setPaperOffsets(prev => {
      const n = [...prev];
      n[index] = { x: 0, y: 0 };
      return n;
    });
  };

  const folderStyle: React.CSSProperties = {
    '--folder-color': color,
    '--folder-back-color': folderBackColor,
    '--paper-1': paper1,
    '--paper-2': paper2,
    '--paper-3': paper3,
  } as React.CSSProperties;

  const scaleStyle = { transform: `scale(${size})` };

  const getOpenTransform = (index: number) => {
    if (index === 0) return 'translate(-120%, -70%) rotate(-15deg)';
    if (index === 1) return 'translate(10%, -70%) rotate(15deg)';
    if (index === 2) return 'translate(-50%, -100%) rotate(5deg)';
    return '';
  };

  const getProgressPaperTransform = (index: number) => {
    const p = Math.max(0, Math.min(1, progress!));
    const t = openTargets[index];
    const tx = lerp(-50, t.tx, p);
    const ty = lerp(10, t.ty, p);
    const r = lerp(0, t.r, p);
    const ox = paperOffsets[index].x;
    const oy = paperOffsets[index].y;
    return `translate(${tx}%, ${ty}%) rotate(${r}deg) translate(${ox}px, ${oy}px)`;
  };

  const getProgressFlapTransform = (direction: 'left' | 'right') => {
    const p = Math.max(0, Math.min(1, progress!));
    const skew = direction === 'left' ? lerp(0, 15, p) : lerp(0, -15, p);
    const sy = lerp(1, 0.6, p);
    return `skew(${skew}deg) scaleY(${sy})`;
  };

  const getBodyTranslateY = () => {
    const p = Math.max(0, Math.min(1, progress!));
    return `translateY(${lerp(0, -8, p)}px)`;
  };

  return (
    <div
      style={scaleStyle}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`group relative cursor-pointer ${
          isProgressDriven
            ? ''
            : `transition-all duration-200 ease-in ${!open ? 'hover:-translate-y-2' : ''}`
        }`}
        style={{
          ...folderStyle,
          ...(isProgressDriven
            ? { transform: getBodyTranslateY() }
            : open
              ? { transform: 'translateY(-8px)' }
              : {}),
        }}
        onClick={handleClick}
      >
        <div
          className='relative w-[100px] h-[80px] rounded-tl-0 rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]'
          style={{ backgroundColor: folderBackColor }}
        >
          <span
            className='absolute z-0 bottom-[98%] left-0 w-[30px] h-[10px] rounded-tl-[5px] rounded-tr-[5px] rounded-bl-0 rounded-br-0'
            style={{ backgroundColor: folderBackColor }}
          ></span>
          {!hidePapers &&
            papers.map((item, i) => {
              let sizeClasses = '';
              if (i === 0) sizeClasses = 'w-[70%] h-[80%]';
              if (i === 1)
                sizeClasses = open ? 'w-[80%] h-[80%]' : 'w-[80%] h-[70%]';
              if (i === 2)
                sizeClasses = open ? 'w-[90%] h-[80%]' : 'w-[90%] h-[60%]';

              let transformStyle: string | undefined;
              if (isProgressDriven) {
                transformStyle = getProgressPaperTransform(i);
              } else if (open) {
                transformStyle = `${getOpenTransform(i)} translate(${paperOffsets[i].x}px, ${paperOffsets[i].y}px)`;
              }

              return (
                <div
                  key={i}
                  onMouseMove={e => handlePaperMouseMove(e, i)}
                  onMouseLeave={e => handlePaperMouseLeave(e, i)}
                  className={`absolute z-20 bottom-[10%] left-1/2 ${
                    isProgressDriven
                      ? ''
                      : `transition-all duration-300 ease-in-out ${
                          !open
                            ? 'transform -translate-x-1/2 translate-y-[10%] group-hover:translate-y-0'
                            : 'hover:scale-110'
                        }`
                  } ${sizeClasses}`}
                  style={{
                    ...(isProgressDriven || open
                      ? { transform: transformStyle }
                      : {}),
                    backgroundColor:
                      i === 0 ? paper1 : i === 1 ? paper2 : paper3,
                    borderRadius: '10px',
                  }}
                >
                  {item}
                </div>
              );
            })}
          <div
            className={`absolute z-30 w-full h-full origin-bottom ${
              isProgressDriven
                ? ''
                : `transition-all duration-300 ease-in-out ${
                    !open
                      ? 'group-hover:[transform:skew(15deg)_scaleY(0.6)]'
                      : ''
                  }`
            }`}
            style={{
              backgroundColor: color,
              borderRadius: '5px 10px 10px 10px',
              ...(isProgressDriven
                ? { transform: getProgressFlapTransform('left') }
                : open
                  ? { transform: 'skew(15deg) scaleY(0.6)' }
                  : {}),
            }}
          ></div>
          <div
            className={`absolute z-30 w-full h-full origin-bottom ${
              isProgressDriven
                ? ''
                : `transition-all duration-300 ease-in-out ${
                    !open
                      ? 'group-hover:[transform:skew(-15deg)_scaleY(0.6)]'
                      : ''
                  }`
            }`}
            style={{
              backgroundColor: color,
              borderRadius: '5px 10px 10px 10px',
              ...(isProgressDriven
                ? { transform: getProgressFlapTransform('right') }
                : open
                  ? { transform: 'skew(-15deg) scaleY(0.6)' }
                  : {}),
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Folder;
