'use client';

import * as THREE from 'three';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, useGLTF } from '@react-three/drei';
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';

interface MacbookScrollProps {
  src: string;
  title?: string;
  showGradient?: boolean;
  className?: string;
}

// MacBook model from pmndrs/examples (floating-laptop, MIT).
const MODEL_URL = '/models/macbook.glb';

// Lid angle in radians: lying on the deck, and open a little past upright.
const HINGE_CLOSED = 1.575;
const HINGE_OPEN = -0.32;
const FOV = 32;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const damp = THREE.MathUtils.damp;

type MacNodes = Record<string, THREE.Mesh>;
type MacMaterials = Record<string, THREE.MeshStandardMaterial>;

/**
 * Draws the screen image onto a canvas at display resolution, so a tiny
 * SVG or a small screenshot still looks sharp once it fills the viewport.
 */
function useScreenTexture(src: string) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1330;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    // glTF UVs have their origin top-left
    tex.flipY = false;
    return tex;
  }, []);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = texture.image as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = img.naturalWidth || 1;
      const h = img.naturalHeight || 1;
      const scale = Math.max(canvas.width / w, canvas.height / h);
      const dw = w * scale;
      const dh = h * scale;
      ctx.drawImage(
        img,
        (canvas.width - dw) / 2,
        (canvas.height - dh) / 2,
        dw,
        dh
      );
      texture.needsUpdate = true;
    };
    img.src = src;
  }, [src, texture]);

  return texture;
}

function Laptop({
  progress,
  src,
}: {
  progress: MotionValue<number>;
  src: string;
}) {
  const { nodes, materials } = useGLTF(MODEL_URL, true) as unknown as {
    nodes: MacNodes;
    materials: MacMaterials;
  };
  const { camera, size } = useThree();
  const lid = useRef<THREE.Group>(null!);
  const screen = useRef<THREE.Mesh>(null!);
  const screenMaterial = useRef<THREE.MeshBasicMaterial>(null!);
  const texture = useScreenTexture(src);

  const smooth = useRef({ p: 0 });
  const scratch = useMemo(
    () => ({
      box: new THREE.Box3(),
      center: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      camPos: new THREE.Vector3(),
      target: new THREE.Vector3(),
      startPos: new THREE.Vector3(),
      startTarget: new THREE.Vector3(),
    }),
    []
  );

  // Screen size in its own space, for the fly-in distance.
  const screenSize = useMemo(() => {
    const geo = nodes['Cube008_2'].geometry;
    geo.computeBoundingBox();
    const s = new THREE.Vector3();
    geo.boundingBox!.getSize(s);
    const dims = [s.x, s.y, s.z].sort((a, b) => b - a);
    return { w: dims[0], h: dims[1] };
  }, [nodes]);

  useFrame((_, delta) => {
    const s = smooth.current;
    s.p = damp(s.p, progress.get(), 12, delta);
    const p = s.p;

    const open = ease(clamp01((p - 0.05) / 0.45));
    const zoom = ease(clamp01((p - 0.55) / 0.35));

    const hinge = THREE.MathUtils.lerp(HINGE_CLOSED, HINGE_OPEN, open);
    lid.current.rotation.x = hinge;
    screenMaterial.current.color.setScalar(clamp01((open - 0.55) / 0.45));

    const aspect = size.width / size.height;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

    // Start: the whole laptop framed from the front, a little above.
    // Narrow screens pull back so the full width fits.
    const fitDist = Math.max(19, 7.5 / (tanHalf * aspect));
    scratch.startPos.set(0, fitDist * 0.42, -3.3 - fitDist);
    scratch.startTarget.set(0, THREE.MathUtils.lerp(0.2, 1.6, open), -3.3);

    // End: square in front of the screen, close enough that it covers
    // the viewport.
    lid.current.updateWorldMatrix(true, true);
    scratch.box.setFromObject(screen.current).getCenter(scratch.center);
    scratch.normal.set(0, -Math.sin(hinge), -Math.cos(hinge)).normalize();
    const coverDist =
      Math.min(
        screenSize.h / 2 / tanHalf,
        screenSize.w / 2 / (tanHalf * aspect)
      ) * 0.97;
    scratch.camPos
      .copy(scratch.center)
      .addScaledVector(scratch.normal, coverDist);

    camera.position.lerpVectors(scratch.startPos, scratch.camPos, zoom);
    scratch.target.lerpVectors(scratch.startTarget, scratch.center, zoom);
    camera.lookAt(scratch.target);
  });

  return (
    <group rotation={[0, Math.PI, 0]} dispose={null}>
      <group ref={lid} position={[0, -0.04, 0.41]}>
        <group position={[0, 2.96, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            material={materials.aluminium}
            geometry={nodes['Cube008'].geometry}
          />
          <mesh
            material={materials['matte.001']}
            geometry={nodes['Cube008_1'].geometry}
          />
          <mesh ref={screen} geometry={nodes['Cube008_2'].geometry}>
            <meshBasicMaterial
              ref={screenMaterial}
              map={texture}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>
      <mesh
        material={materials.keys}
        geometry={nodes.keyboard.geometry}
        position={[1.79, 0, 3.45]}
      />
      <group position={[0, -0.1, 3.39]}>
        <mesh
          material={materials.aluminium}
          geometry={nodes['Cube002'].geometry}
        />
        <mesh
          material={materials.trackpad}
          geometry={nodes['Cube002_1'].geometry}
        />
      </group>
      <mesh
        material={materials.touchbar}
        geometry={nodes.touchbar.geometry}
        position={[0, -0.03, 1.2]}
      />
    </group>
  );
}

export default function MacbookScroll({
  src,
  title,
  showGradient = true,
  className = '',
}: MacbookScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Progress runs while the laptop is pinned in view, so the whole
  // opening happens on screen.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.12], [0, -24]);
  const shadowOpacity = useTransform(scrollYProgress, [0.55, 0.75], [1, 0]);

  return (
    <div ref={ref} className={`relative h-[300vh] w-full ${className}`}>
      <div className='sticky top-0 h-screen w-full overflow-hidden'>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 8, -19], fov: FOV }}
          gl={{ antialias: true, alpha: true }}
          className='!absolute inset-0'
        >
          <Suspense fallback={null}>
            <Laptop progress={scrollYProgress} src={src} />
            <Environment preset='city' />
          </Suspense>
          {showGradient && <FloorShadow opacity={shadowOpacity} />}
        </Canvas>

        <motion.h2
          style={{ y: textY, opacity: textOpacity }}
          className='pointer-events-none absolute inset-x-0 top-[16vh] text-center text-3xl font-bold text-black'
        >
          {title || 'Scroll to reveal'}
        </motion.h2>
      </div>
    </div>
  );
}

function FloorShadow({ opacity }: { opacity: MotionValue<number> }) {
  const group = useRef<THREE.Group>(null!);
  useFrame(() => {
    group.current.visible = opacity.get() > 0.01;
  });
  return (
    <group ref={group}>
      <ContactShadows
        position={[0, -0.22, -3.3]}
        opacity={0.4}
        scale={16}
        blur={2.2}
        far={4}
      />
    </group>
  );
}

useGLTF.preload(MODEL_URL, true);
