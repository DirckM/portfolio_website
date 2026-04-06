'use client';

import { useEffect, useState } from 'react';

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
}: LanyardProps) {
  const [LanyardImpl, setLanyardImpl] =
    useState<React.ComponentType<LanyardProps> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    import('./LanyardImpl')
      .then(mod => setLanyardImpl(() => mod.default))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className='relative z-0 w-full h-screen flex justify-center items-center bg-[#060010] text-white/40 text-sm'>
        Lanyard requires @react-three/rapier and meshline packages.
      </div>
    );
  }

  if (!LanyardImpl) {
    return (
      <div className='relative z-0 w-full h-screen flex justify-center items-center bg-[#060010]'>
        <div className='w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin' />
      </div>
    );
  }

  return (
    <LanyardImpl
      position={position}
      gravity={gravity}
      fov={fov}
      transparent={transparent}
    />
  );
}
