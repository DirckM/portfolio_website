import React, { useState, useRef, useEffect } from 'react';
import './ThreeDCarousel.css'; // We'll move your CSS here
import VinylSpinner from '../VinylSpinner';

const ThreeDCarousel = () => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startRotation, setStartRotation] = useState(0);
  const [screenSize, setScreenSize] = useState('desktop');
  const [activeVinylIndex, setActiveVinylIndex] = useState<number | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartRotation(rotation);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const sensitivity = 0.5; // Adjust sensitivity
    const newRotation = startRotation + deltaX * sensitivity;
    setRotation(newRotation);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);
    // Snap to nearest 72-degree position (360° ÷ 5 items = 72°)
    const snappedRotation = Math.round(rotation / 72) * 72;
    setRotation(snappedRotation);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartRotation(rotation);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const deltaX = e.touches[0].clientX - startX;
    const sensitivity = 0.5;
    const newRotation = startRotation + deltaX * sensitivity;
    setRotation(newRotation);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);
    // Snap to nearest 72-degree position (360° ÷ 5 items = 72°)
    const snappedRotation = Math.round(rotation / 72) * 72;
    setRotation(snappedRotation);
  };

  // Add global mouse events for smooth dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const sensitivity = 0.5;
      const newRotation = startRotation + deltaX * sensitivity;
      setRotation(newRotation);
    };

    const handleGlobalMouseUp = () => {
      if (!isDragging) return;

      setIsDragging(false);
      // Snap to nearest 72-degree position (360° ÷ 5 items = 72°)
      const snappedRotation = Math.round(rotation / 72) * 72;
      setRotation(snappedRotation);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, startX, startRotation, rotation]);

  // Vinyl interaction handlers
  const handleVinylPlay = (vinylIndex: number) => {
    // Stop auto-rotation and clear any existing timeout
    setIsAutoRotating(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Set active vinyl
    setActiveVinylIndex(vinylIndex);

    // Snap carousel to the active vinyl position
    const targetRotation = vinylIndex * 72; // 72 degrees per vinyl
    setRotation(targetRotation);
  };

  const handleVinylPause = () => {
    // Clear active vinyl
    setActiveVinylIndex(null);

    // Resume auto-rotation after 4 seconds
    timeoutRef.current = setTimeout(() => {
      setIsAutoRotating(true);
    }, 4000);
  };

  const handleVinylStop = () => {
    // Clear active vinyl and resume auto-rotation immediately
    setActiveVinylIndex(null);
    setIsAutoRotating(true);

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Screen size detection for responsive VinylSpinner sizes
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width <= 320) {
        setScreenSize('tiny');
      } else if (width <= 360) {
        setScreenSize('extra-small');
      } else if (width <= 480) {
        setScreenSize('mobile');
      } else if (width <= 768) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Get responsive VinylSpinner size
  const getVinylSize = () => {
    switch (screenSize) {
      case 'tiny':
        return 80;
      case 'extra-small':
        return 100;
      case 'mobile':
        return 120;
      case 'tablet':
        return 160;
      default:
        return 200;
    }
  };

  // Automatic slow rotation
  useEffect(() => {
    if (isDragging || !isAutoRotating) return; // Don't auto-rotate while dragging or when vinyl is active

    const interval = setInterval(() => {
      setRotation(prev => prev + 0.5); // Slow rotation: 0.5 degrees per frame
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [isDragging, isAutoRotating]);

  // Get responsive minHeight
  const getMinHeight = () => {
    switch (screenSize) {
      case 'tiny':
        return 'auto'; // Let it size naturally
      case 'extra-small':
        return 'auto';
      case 'mobile':
        return '80vh';
      case 'tablet':
        return '90vh';
      default:
        return '100vh';
    }
  };

  return (
    <div
      style={{
        padding:
          screenSize === 'tiny'
            ? '20px 0'
            : screenSize === 'extra-small'
              ? '25px 0'
              : screenSize === 'mobile'
                ? '40px 0'
                : screenSize === 'tablet'
                  ? '50px 0'
                  : '70px 0',
        minHeight: getMinHeight(),
        position: 'relative',
      }}
    >
      <div className='container'>
        <div
          ref={carouselRef}
          className='carousel'
          style={{
            transform: `rotateY(${rotation}deg)`,
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className='item a'>
            <VinylSpinner
              coverArtSrc='/projects/othello.png'
              altText='Othello Game'
              size={getVinylSize()}
              isSpinning={activeVinylIndex === 0}
              spinSpeed={1.5}
              onPlay={() => handleVinylPlay(0)}
              onPause={handleVinylPause}
              onStop={handleVinylStop}
            />
          </div>
          <div className='item b'>
            <VinylSpinner
              coverArtSrc='/next.svg'
              altText='Next.js'
              size={getVinylSize()}
              isSpinning={activeVinylIndex === 1}
              spinSpeed={2}
              onPlay={() => handleVinylPlay(1)}
              onPause={handleVinylPause}
              onStop={handleVinylStop}
            />
          </div>
          <div className='item c'>
            <VinylSpinner
              coverArtSrc='/vercel.svg'
              altText='Vercel'
              size={getVinylSize()}
              isSpinning={activeVinylIndex === 2}
              spinSpeed={1.8}
              onPlay={() => handleVinylPlay(2)}
              onPause={handleVinylPause}
              onStop={handleVinylStop}
            />
          </div>
          <div className='item d'>
            <VinylSpinner
              coverArtSrc='/file.svg'
              altText='File Icon'
              size={getVinylSize()}
              isSpinning={activeVinylIndex === 3}
              spinSpeed={2.2}
              onPlay={() => handleVinylPlay(3)}
              onPause={handleVinylPause}
              onStop={handleVinylStop}
            />
          </div>
          <div className='item e'>
            <VinylSpinner
              coverArtSrc='/file.svg'
              altText='File Icon'
              size={getVinylSize()}
              isSpinning={activeVinylIndex === 4}
              spinSpeed={2.2}
              onPlay={() => handleVinylPlay(4)}
              onPause={handleVinylPause}
              onStop={handleVinylStop}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDCarousel;
