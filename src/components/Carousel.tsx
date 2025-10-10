'use client';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

// -------------------------
// Model3D: single rotating model with adaptive scaling
// -------------------------
function Model3D({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  baseScale = 1,
  rotationSpeed = 0,
}: {
  modelPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  baseScale?: number;
  rotationSpeed?: number;
}) {
  const { scene } = useGLTF(modelPath);
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  const ref = useRef<Group>(null);
  const { viewport } = useThree();

  // ✅ Responsive model scale based on viewport width
  const responsiveScale = React.useMemo(() => {
    // on large screens (viewport.width ~20), models scale up ~2.5x
    const scaleFactor = Math.min(Math.max(0.9, viewport.width / 14), 1.8);
    return baseScale * scaleFactor;
  }, [viewport.width, baseScale]);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += rotationSpeed * 0.01;
  });

  return (
    <group ref={ref} position={position} rotation={rotation} scale={responsiveScale}>
      <primitive object={clonedScene} />
    </group>
  );
}

// -------------------------
// CarouselScene: moves all models horizontally
// -------------------------
function CarouselScene({
  models,
  speed,
}: {
  models: { path: string; name: string; baseScale: number }[];
  speed: number;
}) {
  const groupRef = useRef<Group>(null);
  const { viewport, size } = useThree();
  const [itemSpacing, setItemSpacing] = useState(5);

  useLayoutEffect(() => {
    const visibleWidth = viewport.width;
    const spacingFactor = 1 + 10 / visibleWidth;
    const baseSpacing = visibleWidth / models.length;
    const spacing = Math.max(baseSpacing * spacingFactor, 4.5);
    setItemSpacing(spacing);
  }, [viewport.width, models.length, size.width]);

  const totalWidth = models.length * itemSpacing;

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.x -= 0.05 * speed;
    if (groupRef.current.position.x < -totalWidth) {
      groupRef.current.position.x = 0;
    }
  });

  return (
    <group ref={groupRef}>
      {[...models, ...models].map((model, i) => (
        <Model3D
          key={`${model.name}-${i}`}
          modelPath={model.path}
          baseScale={model.baseScale}
          position={[i * itemSpacing - totalWidth / 2, -1, 0]}
          rotation={[0, Math.PI / 4, 0]}
          rotationSpeed={0.2}
        />
      ))}
    </group>
  );
}

// -------------------------
// Main Carousel component
// -------------------------
export default function Carousel({
  className = '',
  speed = 0.2,
}: {
  className?: string;
  speed?: number;
}) {
  const models = [
    { path: '/3d-models/react_logo.glb', name: 'React', baseScale: 0.8 },
    { path: '/3d-models/typescript.glb', name: 'TypeScript', baseScale: 1 },
    { path: '/3d-models/figma.glb', name: 'HTML', baseScale: 1 },
    { path: '/3d-models/git_logo.glb', name: 'SketchUp', baseScale: 2.5 },
    { path: '/3d-models/python_programming_language.glb', name: 'Python', baseScale: 0.7 },
  ];

  // ✅ Camera zooms out slightly on smaller screens
  const [cameraZ, setCameraZ] = useState(15);
  useLayoutEffect(() => {
    const width = window.innerWidth;
    if (width < 500) setCameraZ(22);
    else if (width < 800) setCameraZ(18);
    else setCameraZ(15);
  }, []);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <Canvas camera={{ position: [0, 2, cameraZ], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />

        <CarouselScene models={models} speed={speed} />
      </Canvas>
    </div>
  );
}
