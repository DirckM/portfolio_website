import React, { Suspense, useMemo } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

interface Model3DProps {
  /** Path to your .glb or .gltf model file */
  modelPath: string;
  /** Position in 3D space (x, y, z) */
  position?: [number, number, number];
  /** Rotation in radians (x, y, z) */
  rotation?: [number, number, number];
  /** Uniform scale factor */
  scale?: number;
  /** Optional auto-rotation speed */
  rotationSpeed?: number;
  /** Optional animation function, runs every frame */
  animate?: (group: Group, time: number) => void;
  /** Optional extra props */
  [key: string]: unknown;
}

function Model3DInner({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  rotationSpeed = 0,
  animate,
  ...props
}: Model3DProps) {
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Preload the model for better performance
  React.useEffect(() => {
    useGLTF.preload(modelPath);
  }, [modelPath]);

  const groupRef = React.useRef<Group>(null);

  useFrame((state: any) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Optional rotation
      if (rotationSpeed !== 0) {
        groupRef.current.rotation.y += rotationSpeed * 0.01;
      }

      // Custom animation logic (user-defined)
      if (animate) animate(groupRef.current, time);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      {...props}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

/**
 * The full Canvas wrapper — easy plug-and-play
 */
export default function Model3DCanvas(props: Model3DProps) {
  return (
    <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <Suspense fallback={null}>
        <Model3DInner {...props} />
      </Suspense>
    </Canvas>
  );
}
