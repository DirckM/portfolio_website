'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause } from 'lucide-react';
import ElasticSlider from './ElasticSlider';

interface VinylSpinnerProps {
  coverArtSrc: string;
  altText?: string;
  size?: number;
  isSpinning?: boolean;
  spinSpeed?: number;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onVolumeChange?: (volume: number) => void;
}

export default function VinylSpinner({
  coverArtSrc,
  altText = 'Album Cover',
  size = 300,
  isSpinning = true,
  spinSpeed = 2,
  className = '',
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
}: VinylSpinnerProps) {
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);

  useEffect(() => {
    if (!isSpinning || !isPlaying) return;

    const interval = setInterval(() => {
      setRotation(prev => prev + spinSpeed);
    }, 50);

    return () => clearInterval(interval);
  }, [isSpinning, spinSpeed, isPlaying]);

  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    if (newPlayingState) {
      onPlay?.();
    } else {
      onPause?.();
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    onStop?.();
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size + 50 }}
    >
      {/* Vinyl Player */}
      <div className='relative' style={{ width: size, height: size }}>
        {/* Outer vinyl ring */}
        <div
          className='absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl'
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.1s linear',
          }}
        >
          {/* Vinyl grooves */}
          <div className='absolute inset-2 rounded-full border-2 border-gray-700'></div>
          <div className='absolute inset-4 rounded-full border border-gray-600'></div>
          <div className='absolute inset-6 rounded-full border border-gray-600'></div>
          <div className='absolute inset-8 rounded-full border border-gray-600'></div>

          {/* Cover art area */}
          <div className='absolute inset-10 rounded-full overflow-hidden'>
            <Image
              src={coverArtSrc}
              alt={altText}
              width={size - 80}
              height={size - 80}
              className='w-full h-full object-cover'
            />
          </div>

          {/* Center hole */}
          <div className='absolute top-1/2 left-1/2 w-8 h-8 bg-gray-900 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-inner'></div>
        </div>

        {/* Vinyl shine effect */}
        <div className='absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none'></div>

        {/* Play/Pause Button - Centered */}
        <button
          onClick={handlePlayPause}
          onDoubleClick={handleStop}
          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-primary hover:bg-primary-dark rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-10'
          style={{
            width: Math.max(32, size * 0.3), // 20% of vinyl size, minimum 32px
            height: Math.max(32, size * 0.3),
          }}
        >
          {isPlaying ? (
            <Pause
              className='text-white'
              style={{
                width: Math.max(12, size * 0.12), // 8% of vinyl size, minimum 12px
                height: Math.max(12, size * 0.12),
              }}
            />
          ) : (
            <Play
              className='text-white ml-1'
              style={{
                width: Math.max(12, size * 0.12), // 8% of vinyl size, minimum 12px
                height: Math.max(12, size * 0.12),
              }}
            />
          )}
        </button>
      </div>

      {/* Volume Control - Animated */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className='absolute top-full left-1/2 transform -translate-x-1/2 mt-4 flex flex-col items-center gap-2'
            onMouseDown={e => e.stopPropagation()}
            onMouseMove={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
            onTouchMove={e => e.stopPropagation()}
            onTouchEnd={e => e.stopPropagation()}
          >
            <ElasticSlider
              defaultValue={volume}
              startingValue={0}
              maxValue={100}
              isStepped={true}
              stepSize={5}
              leftIcon={
                <svg
                  className='w-4 h-4 text-gray-600'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z' />
                </svg>
              }
              rightIcon={
                <svg
                  className='w-4 h-4 text-gray-600'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' />
                </svg>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
