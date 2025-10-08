import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

interface Model3DProps {
  modelPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  rotationSpeed?: number;
}

function Model3D({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  rotationSpeed = 0,
}: Model3DProps) {
  const { scene } = useGLTF(modelPath);
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  const groupRef = React.useRef<Group>(null);

  React.useEffect(() => {
    useGLTF.preload(modelPath);
  }, [modelPath]);

  React.useEffect(() => {
    if (!groupRef.current) return;

    const animate = () => {
      if (groupRef.current && rotationSpeed !== 0) {
        groupRef.current.rotation.y += rotationSpeed * 0.01;
      }
      requestAnimationFrame(animate);
    };

    animate();
  }, [rotationSpeed]);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

interface CarouselProps {
  className?: string;
  speed?: number;
}

export default function Carousel({ className = '', speed = 1 }: CarouselProps) {
  // List of all available 3D models
  const models = [
    {
      path: '/3d-models/react_logo.glb',
      name: 'React',
      scale: 0.8,
    },
    {
      path: '/3d-models/typescript.glb',
      name: 'TypeScript',
      scale: 1,
    },
    {
      path: '/3d-models/html-3d.glb',
      name: 'HTML',
      scale: 0.3,
    },
    {
      path: '/3d-models/python_programming_language.glb',
      name: 'Python',
      scale: 0.7,
    },
    {
      path: '/3d-models/java.glb',
      name: 'Java',
      scale: 1,
    },
  ];

  // Duplicate models for seamless looping
  const duplicatedModels = [...models, ...models, ...models];

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Continuous scrolling container */}
      <div
        className='flex animate-scroll'
        style={{
          animationDuration: `${20 / speed}s`,
          width: `${duplicatedModels.length * 200}px`,
        }}
      >
        {duplicatedModels.map((model, index) => (
          <div
            key={`${model.name}-${index}`}
            className='flex-shrink-0 w-48 h-48 mx-4'
          >
            <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <pointLight position={[-5, -5, -5]} intensity={0.5} />

              <Model3D
                modelPath={model.path}
                scale={model.scale}
                position={[0, -1, 0]}
                rotation={[0, Math.PI / 4, 0]}
                rotationSpeed={0.2}
              />
            </Canvas>
          </div>
        ))}
      </div>
    </div>
  );
}
