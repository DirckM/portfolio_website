'use client';

import dynamic from 'next/dynamic';
import React, { useRef } from 'react';

// Text animations
import BlurText from '@/components/library/text-animations/BlurText';
import GlitchText from '@/components/library/text-animations/GlitchText';
import CircularText from '@/components/library/text-animations/CircularText';
import CurvedLoop from '@/components/library/text-animations/CurvedLoop';
import DecryptedText from '@/components/library/text-animations/DecryptedText';
import FallingText from '@/components/library/text-animations/FallingText';
import RotatingText from '@/components/library/text-animations/RotatingText';
import ScrambledText from '@/components/library/text-animations/ScrambledText';
import ScrollFloat from '@/components/library/text-animations/ScrollFloat';
import ScrollReveal from '@/components/library/text-animations/ScrollReveal';
import { ScrollVelocity } from '@/components/library/text-animations/ScrollVelocity';
import ShinyText from '@/components/library/text-animations/ShinyText';
import Shuffle from '@/components/library/text-animations/Shuffle';
import SplitText from '@/components/library/text-animations/SplitText';
import TextPressure from '@/components/library/text-animations/TextPressure';
import TextType from '@/components/library/text-animations/TextType';
import TrueFocus from '@/components/library/text-animations/TrueFocus';
import VariableProximity from '@/components/library/text-animations/VariableProximity';

// Animations
import Antigravity from '@/components/library/animations/Antigravity';
import Crosshair from '@/components/library/animations/Crosshair';
import ElectricBorder from '@/components/library/animations/ElectricBorder';
import GlareHover from '@/components/library/animations/GlareHover';
import LogoLoop from '@/components/library/animations/LogoLoop';
import MagicRings from '@/components/library/animations/MagicRings';
import Magnet from '@/components/library/animations/Magnet';
import MetaBalls from '@/components/library/animations/MetaBalls';
import MetallicPaint from '@/components/library/animations/MetallicPaint';
import PixelTrail from '@/components/library/animations/PixelTrail';
import ShapeBlur from '@/components/library/animations/ShapeBlur';
import TargetCursor from '@/components/library/animations/TargetCursor';

// Backgrounds (non-WebGL CSS/canvas)
import LineWaves from '@/components/library/backgrounds/LineWaves';

// WebGL backgrounds loaded dynamically
const SoftAurora = dynamic(
  () => import('@/components/library/backgrounds/SoftAurora'),
  { ssr: false }
);
const ColorBends = dynamic(
  () => import('@/components/library/backgrounds/ColorBends'),
  { ssr: false }
);
const DarkVeil = dynamic(
  () => import('@/components/library/backgrounds/DarkVeil'),
  { ssr: false }
);
const EvilEye = dynamic(
  () => import('@/components/library/backgrounds/EvilEye'),
  { ssr: false }
);
const LightPillar = dynamic(
  () => import('@/components/library/backgrounds/LightPillar'),
  { ssr: false }
);
const Radar = dynamic(() => import('@/components/library/backgrounds/Radar'), {
  ssr: false,
});

// Blocks
import CirclingElements from '@/components/library/blocks/CirclingElements';
import MacbookScroll from '@/components/library/blocks/MacbookScroll';
import MarqueeAlongSvgPath from '@/components/library/blocks/MarqueeAlongSvgPath';
import Terminal from '@/components/library/blocks/Terminal';
import WorldMap from '@/components/library/blocks/WorldMap';

// ParallaxFloating loaded dynamically (uses scroll listeners)
const ParallaxFloating = dynamic(
  () =>
    import('@/components/library/blocks/ParallaxFloating').then(m => ({
      default: m.default,
    })),
  { ssr: false }
);
const FloatingElement = dynamic(
  () =>
    import('@/components/library/blocks/ParallaxFloating').then(m => ({
      default: m.FloatingElement,
    })),
  { ssr: false }
);

// Components
import AnimatedList from '@/components/library/components/AnimatedList';
import BorderGlow from '@/components/library/components/BorderGlow';
import CircularGallery from '@/components/library/components/CircularGallery';
import Dock from '@/components/library/components/Dock';
import DomeGallery from '@/components/library/components/DomeGallery';
import ElasticSlider from '@/components/library/components/ElasticSlider';
import FlowingMenu from '@/components/library/components/FlowingMenu';
import FluidGlass from '@/components/library/components/FluidGlass';
import Folder from '@/components/library/components/Folder';
import GlassSurface from '@/components/library/components/GlassSurface';
import InfiniteMenu from '@/components/library/components/InfiniteMenu';
import Lanyard from '@/components/library/components/Lanyard';
import MagicBento from '@/components/library/components/MagicBento';
const PixelCard = dynamic(
  () => import('@/components/library/components/PixelCard'),
  { ssr: false }
);
import ReflectiveCard from '@/components/library/components/ReflectiveCard';
import ScrollStack, {
  ScrollStackItem,
} from '@/components/library/components/ScrollStack';
import TiltedCard from '@/components/library/components/TiltedCard';

// ASCIIText loaded dynamically (WebGL + THREE)
const ASCIIText = dynamic(
  () => import('@/components/library/text-animations/ASCIIText'),
  { ssr: false }
);

function VariableProximityPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={containerRef}
      className='flex items-center justify-center w-full h-full'
    >
      <VariableProximity
        label='Variable'
        fromFontVariationSettings="'wght' 100, 'wdth' 85"
        toFontVariationSettings="'wght' 900, 'wdth' 125"
        containerRef={containerRef}
        className='text-2xl text-black'
        radius={120}
      />
    </div>
  );
}

function VariableProximityFullDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={containerRef}
      className='flex flex-col items-center justify-center gap-8 w-full h-full p-12'
    >
      <VariableProximity
        label='Move your cursor close'
        fromFontVariationSettings="'wght' 100, 'wdth' 85"
        toFontVariationSettings="'wght' 900, 'wdth' 125"
        containerRef={containerRef}
        className='text-4xl text-black'
        radius={150}
      />
      <VariableProximity
        label='Gaussian falloff'
        fromFontVariationSettings="'wght' 200"
        toFontVariationSettings="'wght' 800"
        containerRef={containerRef}
        className='text-2xl text-[#6b6b6b]'
        radius={100}
        falloff='gaussian'
      />
    </div>
  );
}

export const cardPreviews: Record<string, React.ReactNode> = {
  // Text animations
  'ascii-text': (
    <div className='w-full h-full bg-black'>
      <ASCIIText
        text='Hi'
        asciiFontSize={8}
        textFontSize={180}
        enableWaves={true}
      />
    </div>
  ),
  'blur-text': (
    <div className='flex items-center justify-center w-full h-full'>
      <BlurText text='Blur Text' className='text-2xl font-bold text-black' />
    </div>
  ),
  'circular-text': (
    <div className='flex items-center justify-center w-full h-full scale-75'>
      <CircularText
        text='CIRCULAR TEXT * CIRCULAR * '
        spinDuration={10}
        className='text-black'
      />
    </div>
  ),
  'curved-loop': (
    <div className='w-full h-full overflow-hidden bg-black flex items-center'>
      <div className='w-full scale-50 -mt-8'>
        <CurvedLoop
          marqueeText='CURVED LOOP  *  '
          speed={3}
          className='text-white'
          curveAmount={200}
        />
      </div>
    </div>
  ),
  'decrypted-text': (
    <div className='flex items-center justify-center w-full h-full'>
      <DecryptedText
        text='Decrypted'
        className='text-2xl font-bold text-black'
        encryptedClassName='text-2xl font-bold text-gray-400'
        animateOn='view'
        sequential={true}
        speed={60}
      />
    </div>
  ),
  'falling-text': (
    <div className='w-full h-full'>
      <FallingText
        text='Falling words physics demo'
        trigger='auto'
        gravity={0.8}
        fontSize='0.85rem'
      />
    </div>
  ),
  'glitch-text': (
    <div className='flex items-center justify-center w-full h-full'>
      <GlitchText text='GLITCH' className='text-3xl font-bold text-black' />
    </div>
  ),
  'rotating-text': (
    <div className='flex items-center justify-center w-full h-full'>
      <span className='text-xl font-bold text-black mr-2'>I am</span>
      <RotatingText
        texts={['creative', 'a dev', 'focused', 'curious']}
        mainClassName='text-xl font-bold text-white bg-black px-2 py-1 rounded'
        rotationInterval={1800}
      />
    </div>
  ),
  'scrambled-text': (
    <div className='flex items-center justify-center w-full h-full bg-black'>
      <ScrambledText className='!m-0 !text-base text-white' scrambleChars='.:'>
        Hover to scramble text
      </ScrambledText>
    </div>
  ),
  'scroll-float': (
    <div className='flex items-center justify-center w-full h-full'>
      <ScrollFloat
        containerClassName='!my-0'
        textClassName='!text-lg text-black'
      >
        Scroll Float
      </ScrollFloat>
    </div>
  ),
  'scroll-reveal': (
    <div className='flex items-center justify-center w-full h-full px-4'>
      <ScrollReveal
        containerClassName='!my-0'
        textClassName='!text-base text-black'
      >
        Words reveal as you scroll through the page
      </ScrollReveal>
    </div>
  ),
  'scroll-velocity': (
    <div className='w-full h-full overflow-hidden flex items-center'>
      <ScrollVelocity
        texts={['Scroll Velocity', 'Marquee Text']}
        velocity={50}
        className='text-black text-2xl font-bold'
        parallaxClassName='py-1'
      />
    </div>
  ),
  'shiny-text': (
    <div className='flex items-center justify-center w-full h-full'>
      <ShinyText
        text='Shiny Text Effect'
        className='text-2xl font-bold'
        color='#888'
        shineColor='#000'
        speed={2}
      />
    </div>
  ),
  shuffle: (
    <div className='flex items-center justify-center w-full h-full'>
      <Shuffle
        text='SHUFFLE'
        className='text-2xl text-black'
        shuffleDirection='up'
        loop={true}
        loopDelay={1}
      />
    </div>
  ),
  'split-text': (
    <div className='flex items-center justify-center w-full h-full'>
      <SplitText
        text='Split Text'
        className='text-2xl font-bold text-black'
        splitType='chars'
        duration={0.8}
      />
    </div>
  ),
  'text-pressure': (
    <div className='flex items-center justify-center w-full h-full px-4'>
      <div className='w-full h-16'>
        <TextPressure text='Pressure' textColor='#000000' minFontSize={24} />
      </div>
    </div>
  ),
  'text-type': (
    <div className='flex items-center justify-center w-full h-full'>
      <TextType
        text={['Hello World', 'Type Effect', 'Text Demo']}
        className='text-2xl font-bold text-black'
        typingSpeed={60}
        pauseDuration={1500}
      />
    </div>
  ),
  'true-focus': (
    <div className='flex items-center justify-center w-full h-full scale-75'>
      <TrueFocus
        sentence='True Focus'
        blurAmount={4}
        borderColor='black'
        glowColor='rgba(0,0,0,0.5)'
        animationDuration={0.4}
        pauseBetweenAnimations={1}
      />
    </div>
  ),
  'variable-proximity': <VariableProximityPreview />,

  // Animations
  antigravity: (
    <div className='w-full h-full'>
      <Antigravity
        count={150}
        color='#5227FF'
        autoAnimate={true}
        particleSize={1.5}
      />
    </div>
  ),
  crosshair: (
    <div className='relative w-full h-full bg-black overflow-hidden'>
      <Crosshair color='white' />
      <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
        <span className='text-white/40 text-sm'>Move mouse</span>
      </div>
    </div>
  ),
  'electric-border': (
    <div className='flex items-center justify-center w-full h-full bg-black'>
      <ElectricBorder color='#ffffff' duration={2}>
        <div className='px-6 py-3 text-white text-sm'>Electric</div>
      </ElectricBorder>
    </div>
  ),
  'glare-hover': (
    <div className='flex items-center justify-center w-full h-full'>
      <GlareHover
        width='180px'
        height='120px'
        background='#111'
        borderRadius='12px'
        glareColor='#ffffff'
        glareOpacity={0.6}
      >
        <span className='text-white text-sm font-medium'>Hover me</span>
      </GlareHover>
    </div>
  ),
  'logo-loop': (
    <div className='flex items-center justify-center w-full h-full'>
      <LogoLoop
        logos={[
          { node: <span className='text-black font-bold text-lg'>React</span> },
          {
            node: <span className='text-black font-bold text-lg'>Next.js</span>,
          },
          {
            node: (
              <span className='text-black font-bold text-lg'>TypeScript</span>
            ),
          },
          {
            node: (
              <span className='text-black font-bold text-lg'>Tailwind</span>
            ),
          },
        ]}
        speed={80}
        logoHeight={28}
        pauseOnHover
      />
    </div>
  ),
  'magic-rings': (
    <div className='w-full h-full'>
      <MagicRings
        color='#5227FF'
        colorTwo='#FF9FFC'
        ringCount={5}
        followMouse={false}
      />
    </div>
  ),
  magnet: (
    <div className='flex items-center justify-center w-full h-full'>
      <Magnet padding={60} magnetStrength={3}>
        <div className='w-20 h-20 bg-black rounded-full flex items-center justify-center'>
          <span className='text-white text-xs text-center'>Magnet</span>
        </div>
      </Magnet>
    </div>
  ),
  'meta-balls': (
    <div className='w-full h-full'>
      <MetaBalls
        color='#5227FF'
        ballCount={6}
        animationSize={15}
        enableMouseInteraction={true}
        enableTransparency={false}
      />
    </div>
  ),
  'metallic-paint': (
    <div className='w-full h-full'>
      <MetallicPaint imageSrc='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' />
    </div>
  ),
  'pixel-trail': (
    <div className='relative w-full h-full bg-black overflow-hidden'>
      <PixelTrail gridSize={24} trailSize={0.15} color='#ffffff' />
      <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
        <span className='text-white/40 text-xs'>Move mouse</span>
      </div>
    </div>
  ),
  'shape-blur': (
    <div className='w-full h-full'>
      <ShapeBlur />
    </div>
  ),
  'target-cursor': (
    <div className='relative w-full h-full bg-white overflow-hidden flex items-center justify-center'>
      <TargetCursor hideDefaultCursor={false} />
      <span className='text-black/50 text-sm pointer-events-none'>
        Move mouse
      </span>
    </div>
  ),

  // Backgrounds
  'color-bends': (
    <div className='w-full h-full'>
      <ColorBends />
    </div>
  ),
  'dark-veil': (
    <div className='w-full h-full'>
      <DarkVeil />
    </div>
  ),
  'evil-eye': (
    <div className='w-full h-full bg-black'>
      <EvilEye />
    </div>
  ),
  'light-pillar': (
    <div className='w-full h-full bg-black'>
      <LightPillar quality='low' />
    </div>
  ),
  'line-waves': (
    <div className='w-full h-full'>
      <LineWaves lineCount={6} amplitude={25} lineColor='#000' />
    </div>
  ),
  radar: (
    <div className='w-full h-full bg-black'>
      <Radar color='#00ff88' backgroundColor='#000000' />
    </div>
  ),
  'soft-aurora': (
    <div className='w-full h-full'>
      <SoftAurora />
    </div>
  ),

  // Blocks
  'circling-elements': (
    <div className='flex items-center justify-center w-full h-full'>
      <CirclingElements radius={70} duration={6} className='w-40 h-40'>
        <div className='w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs'>
          1
        </div>
        <div className='w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs'>
          2
        </div>
        <div className='w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs'>
          3
        </div>
        <div className='w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-black text-xs'>
          4
        </div>
      </CirclingElements>
    </div>
  ),
  'macbook-scroll': (
    <div className='flex items-center justify-center w-full h-full bg-[#010101]'>
      <div className='w-24 h-16 bg-[#1a1a1a] rounded-md flex items-center justify-center border border-white/10'>
        <span className='text-white/60 text-[8px]'>MacBook</span>
      </div>
    </div>
  ),
  'marquee-along-svg-path': (
    <div className='w-full h-full overflow-hidden'>
      <MarqueeAlongSvgPath
        path='M 50,150 Q 250,50 450,150 Q 650,250 850,150'
        viewBox='0 0 900 300'
        width='100%'
        height='100%'
        baseVelocity={40}
      >
        <span className='text-black font-bold text-sm mx-4'>Along Path</span>
        <span className='text-gray-500 text-sm mx-4'>Marquee</span>
        <span className='text-black font-bold text-sm mx-4'>SVG Path</span>
        <span className='text-gray-500 text-sm mx-4'>Scroll</span>
      </MarqueeAlongSvgPath>
    </div>
  ),
  'parallax-floating': (
    <div className='w-full h-full overflow-hidden bg-gray-50 relative'>
      <ParallaxFloating sensitivity={0.3} className='w-full h-full'>
        <FloatingElement depth={1} className='absolute top-4 left-8'>
          <div className='w-16 h-10 bg-black rounded-lg' />
        </FloatingElement>
        <FloatingElement depth={2} className='absolute top-8 right-12'>
          <div className='w-10 h-10 bg-gray-400 rounded-full' />
        </FloatingElement>
        <FloatingElement depth={0.5} className='absolute bottom-8 left-16'>
          <div className='w-12 h-8 bg-gray-300 rounded-md' />
        </FloatingElement>
        <FloatingElement depth={1.5} className='absolute bottom-4 right-8'>
          <div className='w-8 h-8 bg-gray-700 rounded-lg' />
        </FloatingElement>
      </ParallaxFloating>
    </div>
  ),
  terminal: (
    <div className='w-full h-full scale-90 origin-top'>
      <Terminal
        commands={['npm install', 'npm run dev']}
        outputs={{
          0: ['added 312 packages in 4.2s'],
          1: ['ready - started on localhost:3000'],
        }}
        typingSpeed={40}
      />
    </div>
  ),
  'world-map': (
    <div className='w-full h-full'>
      <WorldMap
        dots={[
          { lat: 51.5074, lng: -0.1278 },
          { lat: 40.7128, lng: -74.006 },
          { lat: 35.6762, lng: 139.6503 },
        ]}
        arcs={[
          {
            from: { lat: 51.5074, lng: -0.1278 },
            to: { lat: 40.7128, lng: -74.006 },
          },
        ]}
      />
    </div>
  ),

  // Components
  'animated-list': (
    <div className='w-full h-48 overflow-hidden'>
      <AnimatedList
        items={['Design', 'Develop', 'Deploy', 'Iterate', 'Ship']}
        className='!max-h-40'
        showGradients={true}
      />
    </div>
  ),
  'border-glow': (
    <div className='flex items-center justify-center w-full h-full'>
      <BorderGlow
        glowColor='40deg 80% 60%'
        className='w-40 h-24 flex items-center justify-center'
      >
        <span className='text-sm font-medium'>Border Glow</span>
      </BorderGlow>
    </div>
  ),
  'circular-gallery': (
    <div className='w-full h-full overflow-hidden'>
      <CircularGallery
        items={[
          {
            image:
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
            text: 'Mountains',
          },
          {
            image:
              'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400',
            text: 'Forest',
          },
          {
            image:
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
            text: 'Beach',
          },
        ]}
        bend={2}
        textColor='#fff'
        borderRadius={0.06}
      />
    </div>
  ),
  dock: (
    <div className='flex items-end justify-center w-full h-full pb-4'>
      <Dock
        items={[
          {
            icon: <span className='text-lg'>🏠</span>,
            label: 'Home',
            onClick: () => {},
          },
          {
            icon: <span className='text-lg'>⭐</span>,
            label: 'Stars',
            onClick: () => {},
          },
          {
            icon: <span className='text-lg'>📁</span>,
            label: 'Files',
            onClick: () => {},
          },
          {
            icon: <span className='text-lg'>⚙️</span>,
            label: 'Settings',
            onClick: () => {},
          },
        ]}
        baseItemSize={40}
        magnification={60}
        panelHeight={56}
      />
    </div>
  ),
  'dome-gallery': (
    <div className='w-full h-full overflow-hidden'>
      <DomeGallery
        images={[
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300',
          'https://images.unsplash.com/photo-1551632811-561732d1e306?w=300',
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300',
        ]}
        fit={1.2}
        grayscale={false}
      />
    </div>
  ),
  'elastic-slider': (
    <div className='flex items-center justify-center w-full h-full'>
      <ElasticSlider defaultValue={50} maxValue={100} />
    </div>
  ),
  'flowing-menu': (
    <div className='w-full h-full overflow-hidden'>
      <FlowingMenu
        items={[
          {
            link: '#',
            text: 'Design',
            image:
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
          },
          {
            link: '#',
            text: 'Build',
            image:
              'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300',
          },
          {
            link: '#',
            text: 'Ship',
            image:
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300',
          },
        ]}
        speed={12}
      />
    </div>
  ),
  'fluid-glass': (
    <div className='w-full h-full'>
      <FluidGlass />
    </div>
  ),
  folder: (
    <div className='flex items-center justify-center w-full h-full'>
      <Folder color='#5227FF' size={1.2} items={[null, null, null]} />
    </div>
  ),
  'glass-surface': (
    <div className='relative flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-400 to-purple-600'>
      <GlassSurface
        width={160}
        height={80}
        borderRadius={12}
        blur={8}
        opacity={0.3}
      >
        <span className='text-white text-sm font-medium px-4'>Glass</span>
      </GlassSurface>
    </div>
  ),
  'infinite-menu': (
    <div className='w-full h-full overflow-hidden'>
      <InfiniteMenu
        items={[
          {
            image:
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
            link: '#',
            title: 'Mountains',
            description: 'Alpine views',
          },
          {
            image:
              'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300',
            link: '#',
            title: 'Forest',
            description: 'Into the woods',
          },
          {
            image:
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300',
            link: '#',
            title: 'Beach',
            description: 'Coastal escape',
          },
          {
            image:
              'https://images.unsplash.com/photo-1551632811-561732d1e306?w=300',
            link: '#',
            title: 'Hike',
            description: 'Trail ahead',
          },
        ]}
      />
    </div>
  ),
  lanyard: (
    <div className='w-full h-full bg-[#060010] overflow-hidden'>
      <Lanyard />
    </div>
  ),
  'magic-bento': (
    <div className='w-full h-full overflow-hidden scale-75 origin-top'>
      <MagicBento enableStars={true} enableSpotlight={true} particleCount={8} />
    </div>
  ),
  'pixel-card': (
    <div className='flex items-center justify-center w-full h-full'>
      <PixelCard variant='blue' className='w-40 h-28'>
        <span className='text-black text-sm font-medium relative z-10'>
          Pixel Card
        </span>
      </PixelCard>
    </div>
  ),
  'reflective-card': (
    <div className='flex items-center justify-center w-full h-full bg-gray-900'>
      <ReflectiveCard className='w-40 h-28 rounded-xl' />
    </div>
  ),
  'scroll-stack': (
    <div className='w-full h-full overflow-hidden scale-75 origin-top'>
      <ScrollStack useWindowScroll={false} className='!h-auto'>
        <ScrollStackItem itemClassName='!h-16 bg-black text-white flex items-center px-6 !my-2 !rounded-2xl'>
          <span className='text-sm'>Card One</span>
        </ScrollStackItem>
        <ScrollStackItem itemClassName='!h-16 bg-gray-700 text-white flex items-center px-6 !my-2 !rounded-2xl'>
          <span className='text-sm'>Card Two</span>
        </ScrollStackItem>
        <ScrollStackItem itemClassName='!h-16 bg-gray-500 text-white flex items-center px-6 !my-2 !rounded-2xl'>
          <span className='text-sm'>Card Three</span>
        </ScrollStackItem>
      </ScrollStack>
    </div>
  ),
  'tilted-card': (
    <div className='flex items-center justify-center w-full h-full'>
      <TiltedCard className='w-36 h-24 bg-black rounded-xl flex items-center justify-center'>
        <span className='text-white text-xs'>Hover me</span>
      </TiltedCard>
    </div>
  ),
};

export const fullDemos: Record<string, React.ReactNode> = {
  'blur-text': (
    <div className='flex flex-col items-center gap-8 p-12'>
      <BlurText
        text='This text fades in with a blur effect'
        className='text-4xl font-bold text-black font-[family-name:var(--font-instrument-serif)]'
        animateBy='words'
      />
      <BlurText
        text='Character by character'
        className='text-2xl text-[#6b6b6b]'
        animateBy='characters'
        delay={0.03}
      />
    </div>
  ),
  'glitch-text': (
    <div className='flex flex-col items-center gap-8 p-12'>
      <GlitchText
        text='DIGITAL GLITCH'
        className='text-5xl font-bold text-black'
      />
      <GlitchText
        text='Subtle version'
        className='text-2xl text-[#6b6b6b]'
        speed={1000}
        enableShadow={false}
      />
    </div>
  ),
  'electric-border': (
    <div className='flex flex-col items-center gap-8 p-12 bg-black rounded-xl'>
      <ElectricBorder color='#ffffff' duration={2}>
        <div className='px-12 py-8 text-white text-lg'>
          Electric Border Effect
        </div>
      </ElectricBorder>
      <ElectricBorder color='#3b82f6' duration={4} borderRadius='9999px'>
        <div className='px-8 py-3 text-white text-sm'>Rounded with blue</div>
      </ElectricBorder>
    </div>
  ),
  'tilted-card': (
    <div className='flex items-center justify-center gap-8 p-12'>
      <TiltedCard className='w-64 h-80 bg-[#f5f5f0] rounded-2xl border border-[#e5e5e5] flex items-center justify-center shadow-lg'>
        <span className='text-black text-lg font-[family-name:var(--font-instrument-serif)]'>
          Hover & tilt
        </span>
      </TiltedCard>
    </div>
  ),
  'line-waves': (
    <div className='w-full h-[400px]'>
      <LineWaves lineCount={10} lineColor='#000' amplitude={50} />
    </div>
  ),
  'macbook-scroll': (
    <MacbookScroll src='/projects/teckit.svg' title='Scroll down to open' />
  ),
  'rotating-text': (
    <div className='flex flex-col items-center gap-8 p-12'>
      <div className='flex items-center gap-3 text-4xl font-bold text-black'>
        <span>I build</span>
        <RotatingText
          texts={['websites', 'products', 'experiences', 'interfaces']}
          mainClassName='text-white bg-black px-3 py-1 rounded-lg'
          rotationInterval={2000}
        />
      </div>
    </div>
  ),
  'shiny-text': (
    <div className='flex flex-col items-center gap-6 p-12'>
      <ShinyText
        text='Premium Shiny Effect'
        className='text-5xl font-bold'
        color='#888'
        shineColor='#000'
        speed={2.5}
      />
      <ShinyText
        text='Subtle shine on secondary text'
        className='text-2xl'
        color='#aaa'
        shineColor='#333'
        speed={4}
      />
    </div>
  ),
  'text-type': (
    <div className='flex flex-col items-center gap-8 p-12'>
      <TextType
        text={[
          'Hello, World!',
          'Welcome to the demo',
          'Type it out...',
          'Loop it forever',
        ]}
        className='text-4xl font-bold text-black'
        typingSpeed={55}
        pauseDuration={2000}
      />
    </div>
  ),
  terminal: (
    <div className='w-full max-w-2xl mx-auto p-8'>
      <Terminal
        commands={[
          'git clone https://github.com/example/repo',
          'cd repo && npm install',
          'npm run dev',
        ]}
        outputs={{
          0: [
            "Cloning into 'repo'...",
            'remote: Counting objects: 100%',
            'Receiving objects: 100%',
          ],
          1: ['added 312 packages in 4.2s'],
          2: [
            '> dev',
            '> next dev',
            '',
            'ready - started on http://localhost:3000',
          ],
        }}
        typingSpeed={45}
        title='bash'
      />
    </div>
  ),
  folder: (
    <div className='flex items-center justify-center gap-12 p-12'>
      <Folder color='#5227FF' size={1.5} items={[null, null, null]} />
      <Folder color='#FF9FFC' size={1.5} items={[null, null, null]} />
      <Folder color='#000000' size={1.5} items={[null, null, null]} />
    </div>
  ),
  'magic-rings': (
    <div className='w-full h-[400px]'>
      <MagicRings
        color='#5227FF'
        colorTwo='#FF9FFC'
        ringCount={6}
        followMouse={true}
        clickBurst={true}
      />
    </div>
  ),
  'elastic-slider': (
    <div className='flex flex-col items-center gap-8 p-12'>
      <ElasticSlider
        defaultValue={30}
        maxValue={100}
        leftIcon={<span>-</span>}
        rightIcon={<span>+</span>}
      />
      <ElasticSlider
        defaultValue={70}
        maxValue={100}
        isStepped={true}
        stepSize={10}
      />
    </div>
  ),
  'split-text': (
    <div className='flex flex-col items-center gap-8 p-12'>
      <SplitText
        text='Characters split apart'
        className='text-4xl font-bold text-black font-[family-name:var(--font-instrument-serif)]'
        splitType='chars'
        duration={1}
        delay={30}
      />
      <SplitText
        text='Words animate in one by one'
        className='text-2xl text-[#6b6b6b]'
        splitType='words'
        duration={0.8}
        delay={80}
      />
    </div>
  ),
  'circular-text': (
    <div className='flex items-center justify-center gap-16 p-12'>
      <CircularText
        text='CIRCULAR TEXT * SPINNING * '
        spinDuration={10}
        onHover='speedUp'
        className='text-black'
      />
      <CircularText
        text='HOVER TO PAUSE * HOVER * '
        spinDuration={15}
        onHover='pause'
        className='text-black'
      />
    </div>
  ),
  shuffle: (
    <div className='flex flex-col items-center gap-8 p-12'>
      <Shuffle
        text='SHUFFLE UP'
        className='text-4xl font-bold text-black'
        shuffleDirection='up'
        loop={true}
        loopDelay={2}
      />
      <Shuffle
        text='SHUFFLE DOWN'
        className='text-2xl text-[#6b6b6b]'
        shuffleDirection='down'
        loop={true}
        loopDelay={3}
      />
      <Shuffle
        text='LEFT TO RIGHT'
        className='text-xl text-black'
        shuffleDirection='right'
        loop={true}
        loopDelay={2.5}
      />
    </div>
  ),
  'text-pressure': (
    <div className='flex items-center justify-center w-full h-full px-8'>
      <div className='w-full h-48'>
        <TextPressure text='Pressure' textColor='#000000' minFontSize={36} />
      </div>
    </div>
  ),
  'decrypted-text': (
    <div className='flex flex-col items-center gap-8 p-12'>
      <DecryptedText
        text='Hover to decrypt this text'
        className='text-4xl font-bold text-black'
        encryptedClassName='text-4xl font-bold text-gray-300'
        animateOn='hover'
        speed={60}
        sequential={true}
      />
      <DecryptedText
        text='Decrypts on view'
        className='text-2xl text-[#6b6b6b]'
        encryptedClassName='text-2xl text-gray-300'
        animateOn='view'
        speed={40}
        sequential={false}
        revealDirection='center'
      />
    </div>
  ),
  'true-focus': (
    <div className='flex flex-col items-center gap-12 p-12'>
      <TrueFocus
        sentence='Only one word is sharp'
        blurAmount={5}
        borderColor='black'
        glowColor='rgba(0,0,0,0.5)'
        animationDuration={0.4}
        pauseBetweenAnimations={1}
      />
      <TrueFocus
        sentence='Try hovering each word'
        blurAmount={3}
        borderColor='#5227FF'
        glowColor='rgba(82,39,255,0.4)'
        manualMode={true}
        animationDuration={0.3}
      />
    </div>
  ),
  'variable-proximity': <VariableProximityFullDemo />,
  'curved-loop': (
    <div className='w-full h-full overflow-hidden bg-black flex items-center'>
      <CurvedLoop
        marqueeText='CURVED LOOP * FLOWING TEXT * '
        speed={3}
        className='text-white'
        curveAmount={300}
      />
    </div>
  ),
  'falling-text': (
    <div className='flex flex-col items-center gap-4 w-full h-full'>
      <div className='w-full h-full'>
        <FallingText
          text='Click or hover to interact with the falling words and watch physics in action'
          trigger='auto'
          gravity={0.8}
          fontSize='1.2rem'
        />
      </div>
    </div>
  ),
  'scroll-float': (
    <div className='flex flex-col items-center justify-center gap-8 p-12 overflow-auto h-full'>
      <ScrollFloat
        containerClassName='!my-0'
        textClassName='!text-4xl text-black font-[family-name:var(--font-instrument-serif)]'
      >
        Scroll Float Effect
      </ScrollFloat>
      <ScrollFloat
        containerClassName='!my-0'
        textClassName='!text-2xl text-[#6b6b6b]'
        animationDuration={1.5}
      >
        Text floats upward smoothly
      </ScrollFloat>
    </div>
  ),
  'scroll-reveal': (
    <div className='flex items-center justify-center p-12 overflow-auto h-full'>
      <ScrollReveal
        containerClassName='!my-0'
        textClassName='!text-3xl text-black font-[family-name:var(--font-instrument-serif)]'
      >
        Words reveal progressively as you scroll through the page creating a reading experience
      </ScrollReveal>
    </div>
  ),
  'ascii-text': (
    <div className='w-full h-full bg-black'>
      <ASCIIText
        text='Hello'
        asciiFontSize={8}
        textFontSize={200}
        enableWaves={true}
        textColor='#fdf9f3'
      />
    </div>
  ),
  'scrambled-text': (
    <div className='flex flex-col items-center justify-center gap-8 p-12 bg-black w-full h-full'>
      <ScrambledText className='!m-0 !text-4xl text-white font-bold' scrambleChars='.:'>
        Hover to scramble
      </ScrambledText>
      <ScrambledText className='!m-0 !text-2xl text-gray-400' scrambleChars='#*' speed={0.3}>
        Different scramble characters
      </ScrambledText>
    </div>
  ),
  'scroll-velocity': (
    <div className='w-full h-full overflow-hidden flex flex-col items-center justify-center gap-4'>
      <ScrollVelocity
        texts={['Scroll Velocity', 'Speed Changes']}
        velocity={80}
        className='text-black text-4xl font-bold'
      />
      <ScrollVelocity
        texts={['Slower Track', 'Different Speed']}
        velocity={30}
        className='text-[#6b6b6b] text-2xl'
      />
    </div>
  ),
  'glare-hover': (
    <div className='flex items-center justify-center gap-8 p-12'>
      <GlareHover
        width='240px'
        height='160px'
        background='#111'
        borderRadius='16px'
        glareColor='#ffffff'
        glareOpacity={0.6}
      >
        <span className='text-white text-lg font-medium'>Light glare</span>
      </GlareHover>
      <GlareHover
        width='240px'
        height='160px'
        background='#1a1a2e'
        borderRadius='24px'
        glareColor='#5227FF'
        glareOpacity={0.8}
      >
        <span className='text-white text-lg font-medium'>Purple glare</span>
      </GlareHover>
    </div>
  ),
  antigravity: (
    <div className='flex items-center gap-4 w-full h-full'>
      <div className='w-1/2 h-full'>
        <Antigravity count={200} color='#5227FF' autoAnimate={true} particleSize={2} />
      </div>
      <div className='w-1/2 h-full'>
        <Antigravity count={200} color='#FF9FFC' autoAnimate={true} particleSize={1.5} particleShape='sphere' />
      </div>
    </div>
  ),
  'logo-loop': (
    <div className='flex flex-col items-center justify-center gap-12 p-12 w-full'>
      <LogoLoop
        logos={[
          { node: <span className='text-black font-bold text-2xl'>React</span> },
          { node: <span className='text-black font-bold text-2xl'>Next.js</span> },
          { node: <span className='text-black font-bold text-2xl'>TypeScript</span> },
          { node: <span className='text-black font-bold text-2xl'>Tailwind</span> },
          { node: <span className='text-black font-bold text-2xl'>Node.js</span> },
        ]}
        speed={100}
        logoHeight={36}
        pauseOnHover
      />
      <LogoLoop
        logos={[
          { node: <span className='text-[#6b6b6b] text-xl'>Figma</span> },
          { node: <span className='text-[#6b6b6b] text-xl'>Vercel</span> },
          { node: <span className='text-[#6b6b6b] text-xl'>GitHub</span> },
          { node: <span className='text-[#6b6b6b] text-xl'>Docker</span> },
        ]}
        speed={60}
        logoHeight={28}
        direction='right'
      />
    </div>
  ),
  'target-cursor': (
    <div className='relative w-full h-full bg-white overflow-hidden flex items-center justify-center'>
      <TargetCursor hideDefaultCursor={false} />
      <span className='text-black/30 text-xl pointer-events-none font-[family-name:var(--font-instrument-serif)]'>
        Move your cursor around
      </span>
    </div>
  ),
  magnet: (
    <div className='flex items-center justify-center gap-16 p-12'>
      <Magnet padding={80} magnetStrength={2}>
        <div className='w-28 h-28 bg-black rounded-full flex items-center justify-center'>
          <span className='text-white text-sm'>Subtle</span>
        </div>
      </Magnet>
      <Magnet padding={80} magnetStrength={5}>
        <div className='w-28 h-28 bg-[#5227FF] rounded-full flex items-center justify-center'>
          <span className='text-white text-sm'>Strong</span>
        </div>
      </Magnet>
      <Magnet padding={80} magnetStrength={8}>
        <div className='w-28 h-28 bg-[#FF9FFC] rounded-full flex items-center justify-center'>
          <span className='text-black text-sm'>Very strong</span>
        </div>
      </Magnet>
    </div>
  ),
  'pixel-trail': (
    <div className='relative w-full h-full bg-black overflow-hidden'>
      <PixelTrail gridSize={24} trailSize={0.15} color='#ffffff' />
      <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
        <span className='text-white/30 text-2xl font-[family-name:var(--font-instrument-serif)]'>
          Move your cursor
        </span>
      </div>
    </div>
  ),
  'metallic-paint': (
    <div className='w-full h-full'>
      <MetallicPaint imageSrc='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop' />
    </div>
  ),
  'shape-blur': (
    <div className='w-full h-full'>
      <ShapeBlur variation={0} shapeSize={1.2} roundness={0.4} />
    </div>
  ),
  crosshair: (
    <div className='relative w-full h-full bg-black overflow-hidden'>
      <Crosshair color='white' />
      <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
        <span className='text-white/20 text-2xl font-[family-name:var(--font-instrument-serif)]'>
          Precision crosshair
        </span>
      </div>
    </div>
  ),
  'meta-balls': (
    <div className='flex items-center gap-4 w-full h-full'>
      <div className='w-1/2 h-full'>
        <MetaBalls color='#5227FF' ballCount={8} animationSize={20} enableMouseInteraction={true} enableTransparency={false} />
      </div>
      <div className='w-1/2 h-full'>
        <MetaBalls color='#FF9FFC' ballCount={12} animationSize={15} enableMouseInteraction={true} enableTransparency={false} />
      </div>
    </div>
  ),
  'animated-list': (
    <div className='flex items-center justify-center p-12 w-full h-full'>
      <div className='w-full max-w-md h-80'>
        <AnimatedList
          items={['Design the interface', 'Build the components', 'Write the tests', 'Deploy to production', 'Ship it', 'Iterate and improve']}
          showGradients={true}
          enableArrowNavigation={true}
        />
      </div>
    </div>
  ),
  'scroll-stack': (
    <div className='w-full h-full overflow-auto'>
      <ScrollStack useWindowScroll={false}>
        <ScrollStackItem itemClassName='bg-black text-white flex items-center justify-center rounded-2xl'>
          <span className='text-2xl font-[family-name:var(--font-instrument-serif)]'>First Card</span>
        </ScrollStackItem>
        <ScrollStackItem itemClassName='bg-[#5227FF] text-white flex items-center justify-center rounded-2xl'>
          <span className='text-2xl font-[family-name:var(--font-instrument-serif)]'>Second Card</span>
        </ScrollStackItem>
        <ScrollStackItem itemClassName='bg-[#FF9FFC] text-black flex items-center justify-center rounded-2xl'>
          <span className='text-2xl font-[family-name:var(--font-instrument-serif)]'>Third Card</span>
        </ScrollStackItem>
      </ScrollStack>
    </div>
  ),
  'magic-bento': (
    <div className='w-full h-full'>
      <MagicBento enableStars={true} enableSpotlight={true} particleCount={12} />
    </div>
  ),
  'circular-gallery': (
    <div className='w-full h-full'>
      <CircularGallery
        items={[
          { image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', text: 'Mountains' },
          { image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600', text: 'Forest' },
          { image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', text: 'Beach' },
          { image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600', text: 'Hiking' },
          { image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600', text: 'Forest Path' },
        ]}
        bend={2}
        textColor='#fff'
        borderRadius={0.06}
      />
    </div>
  ),
  'reflective-card': (
    <div className='flex items-center justify-center gap-8 p-12 bg-gray-900 w-full h-full'>
      <ReflectiveCard className='w-64 h-80 rounded-2xl' />
      <ReflectiveCard className='w-48 h-64 rounded-xl' color='#5227FF' />
    </div>
  ),
  'fluid-glass': (
    <div className='w-full h-full'>
      <FluidGlass />
    </div>
  ),
  'glass-surface': (
    <div className='relative flex items-center justify-center gap-8 w-full h-full bg-gradient-to-br from-blue-400 to-purple-600'>
      <GlassSurface width={220} height={120} borderRadius={16} blur={10} opacity={0.3}>
        <span className='text-white text-lg font-medium px-6'>Frosted Glass</span>
      </GlassSurface>
      <GlassSurface width={180} height={100} borderRadius={999} blur={8} opacity={0.2}>
        <span className='text-white text-sm font-medium px-6'>Rounded</span>
      </GlassSurface>
    </div>
  ),
};
