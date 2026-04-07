# Full Demos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `fullDemos` entries for all 48 components missing live demos on their detail pages.

**Architecture:** All changes go into a single file `src/lib/component-previews.tsx`, adding entries to the existing `fullDemos` Record. Each entry renders 2-3 variations of the component with different prop configurations, styled for the 60vh hero section. All component imports already exist at the top of the file.

**Tech Stack:** React, Next.js, Tailwind CSS. Components use GSAP, Framer Motion, Three.js, Matter.js, OGL, and WebGL shaders internally.

---

### Task 1: Text Animation Demos (Part 1 — 7 components)

**Files:**
- Modify: `src/lib/component-previews.tsx` (add entries to `fullDemos` object, starting at line ~960)

Also add a `VariableProximityFullDemo` helper component near the existing `VariableProximityPreview` (line ~121), since `VariableProximity` requires a `containerRef`.

- [ ] **Step 1: Add VariableProximityFullDemo helper**

Near line 138, after the closing `}` of `VariableProximityPreview`, add:

```tsx
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
```

- [ ] **Step 2: Add fullDemos for split-text, circular-text, shuffle, text-pressure, decrypted-text, true-focus, variable-proximity**

Add these entries inside the `fullDemos` object (before the closing `};`):

```tsx
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
```

- [ ] **Step 3: Verify the app compiles**

Run: `cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -20`

Expected: Build succeeds or at minimum no errors in `component-previews.tsx`.

- [ ] **Step 4: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/lib/component-previews.tsx
git commit -m "Add full demos for text animations part 1: split-text, circular-text, shuffle, text-pressure, decrypted-text, true-focus, variable-proximity"
```

---

### Task 2: Text Animation Demos (Part 2 — 7 components)

**Files:**
- Modify: `src/lib/component-previews.tsx` (add entries to `fullDemos` object)

- [ ] **Step 1: Add fullDemos for curved-loop, falling-text, scroll-float, scroll-reveal, ascii-text, scrambled-text, scroll-velocity**

Add these entries inside the `fullDemos` object:

```tsx
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
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -20`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/lib/component-previews.tsx
git commit -m "Add full demos for text animations part 2: curved-loop, falling-text, scroll-float, scroll-reveal, ascii-text, scrambled-text, scroll-velocity"
```

---

### Task 3: Animation Demos (10 components)

**Files:**
- Modify: `src/lib/component-previews.tsx` (add entries to `fullDemos` object)

- [ ] **Step 1: Add fullDemos for all 10 animation components**

Add these entries inside the `fullDemos` object:

```tsx
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
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -20`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/lib/component-previews.tsx
git commit -m "Add full demos for all 10 animation components: glare-hover, antigravity, logo-loop, target-cursor, magnet, pixel-trail, metallic-paint, shape-blur, crosshair, meta-balls"
```

---

### Task 4: Component Demos (Part 1 — 7 components)

**Files:**
- Modify: `src/lib/component-previews.tsx` (add entries to `fullDemos` object)

- [ ] **Step 1: Add fullDemos for animated-list, scroll-stack, magic-bento, circular-gallery, reflective-card, fluid-glass, glass-surface**

Add these entries inside the `fullDemos` object:

```tsx
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
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -20`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/lib/component-previews.tsx
git commit -m "Add full demos for components part 1: animated-list, scroll-stack, magic-bento, circular-gallery, reflective-card, fluid-glass, glass-surface"
```

---

### Task 5: Component Demos (Part 2 — 7 components)

**Files:**
- Modify: `src/lib/component-previews.tsx` (add entries to `fullDemos` object)

- [ ] **Step 1: Add fullDemos for dome-gallery, lanyard, dock, pixel-card, border-glow, flowing-menu, infinite-menu**

Add these entries inside the `fullDemos` object:

```tsx
  'dome-gallery': (
    <div className='w-full h-full'>
      <DomeGallery
        images={[
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
          'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600',
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',
        ]}
        fit={1.2}
        grayscale={false}
      />
    </div>
  ),
  lanyard: (
    <div className='w-full h-full bg-[#060010]'>
      <Lanyard />
    </div>
  ),
  dock: (
    <div className='flex items-end justify-center w-full h-full pb-12 bg-gradient-to-b from-transparent to-gray-100'>
      <Dock
        items={[
          { icon: <span className='text-2xl'>H</span>, label: 'Home', onClick: () => {} },
          { icon: <span className='text-2xl'>S</span>, label: 'Search', onClick: () => {} },
          { icon: <span className='text-2xl'>P</span>, label: 'Projects', onClick: () => {} },
          { icon: <span className='text-2xl'>M</span>, label: 'Mail', onClick: () => {} },
          { icon: <span className='text-2xl'>C</span>, label: 'Code', onClick: () => {} },
        ]}
        baseItemSize={56}
        magnification={80}
        panelHeight={68}
      />
    </div>
  ),
  'pixel-card': (
    <div className='flex items-center justify-center gap-8 p-12'>
      <PixelCard variant='default' className='w-48 h-64'>
        <span className='text-black text-lg font-medium relative z-10'>Default</span>
      </PixelCard>
      <PixelCard variant='blue' className='w-48 h-64'>
        <span className='text-black text-lg font-medium relative z-10'>Blue</span>
      </PixelCard>
      <PixelCard variant='pink' className='w-48 h-64'>
        <span className='text-black text-lg font-medium relative z-10'>Pink</span>
      </PixelCard>
    </div>
  ),
  'border-glow': (
    <div className='flex items-center justify-center gap-8 p-12'>
      <BorderGlow
        glowColor='40 80 60'
        className='w-56 h-36 flex items-center justify-center'
        borderRadius={20}
      >
        <span className='text-white text-lg font-medium'>Default glow</span>
      </BorderGlow>
      <BorderGlow
        glowColor='270 80 60'
        className='w-56 h-36 flex items-center justify-center'
        borderRadius={20}
        colors={['#5227FF', '#FF9FFC', '#38bdf8']}
      >
        <span className='text-white text-lg font-medium'>Purple glow</span>
      </BorderGlow>
    </div>
  ),
  'flowing-menu': (
    <div className='w-full h-full'>
      <FlowingMenu
        items={[
          { link: '#', text: 'Design', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' },
          { link: '#', text: 'Develop', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600' },
          { link: '#', text: 'Deploy', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' },
          { link: '#', text: 'Iterate', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600' },
        ]}
      />
    </div>
  ),
  'infinite-menu': (
    <div className='w-full h-full'>
      <InfiniteMenu
        items={[
          { image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', link: '#', title: 'Mountains', description: 'Alpine views' },
          { image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400', link: '#', title: 'Forest', description: 'Into the woods' },
          { image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', link: '#', title: 'Beach', description: 'Coastal escape' },
          { image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400', link: '#', title: 'Hiking', description: 'Trail ahead' },
          { image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', link: '#', title: 'Woods', description: 'Deep forest' },
          { image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400', link: '#', title: 'Sunset', description: 'Golden hour' },
        ]}
      />
    </div>
  ),
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -20`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/lib/component-previews.tsx
git commit -m "Add full demos for components part 2: dome-gallery, lanyard, dock, pixel-card, border-glow, flowing-menu, infinite-menu"
```

---

### Task 6: Background Demos (6 components)

**Files:**
- Modify: `src/lib/component-previews.tsx` (add entries to `fullDemos` object)

- [ ] **Step 1: Add fullDemos for all 6 background components**

Add these entries inside the `fullDemos` object:

```tsx
  'soft-aurora': (
    <div className='w-full h-full'>
      <SoftAurora speed={0.6} scale={1.5} brightness={1.0} />
    </div>
  ),
  'color-bends': (
    <div className='w-full h-full'>
      <ColorBends speed={0.2} rotation={45} />
    </div>
  ),
  'dark-veil': (
    <div className='w-full h-full'>
      <DarkVeil speed={0.5} />
    </div>
  ),
  'light-pillar': (
    <div className='w-full h-full bg-black'>
      <LightPillar topColor='#5227FF' bottomColor='#FF9FFC' intensity={1.0} />
    </div>
  ),
  'evil-eye': (
    <div className='w-full h-full bg-black'>
      <EvilEye eyeColor='#FF6F37' intensity={1.5} />
    </div>
  ),
  radar: (
    <div className='w-full h-full bg-black'>
      <Radar color='#00ff88' backgroundColor='#000000' ringCount={10} sweepSpeed={1} />
    </div>
  ),
```

- [ ] **Step 2: Verify the app compiles**

Run: `cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -20`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/lib/component-previews.tsx
git commit -m "Add full demos for all 6 background components: soft-aurora, color-bends, dark-veil, light-pillar, evil-eye, radar"
```

---

### Task 7: Block Demos (4 components) + Fix marquee-along-svg-path cardPreview slug

**Files:**
- Modify: `src/lib/component-previews.tsx` (add entries to `fullDemos` object, fix cardPreview key)

- [ ] **Step 1: Fix the cardPreview slug mismatch**

In the `cardPreviews` object, rename the key `'marquee-along-svg-path'` to `'marquee-svg-path'` to match the registry slug.

Change:
```tsx
  'marquee-along-svg-path': (
```
To:
```tsx
  'marquee-svg-path': (
```

- [ ] **Step 2: Add fullDemos for circling-elements, marquee-svg-path, parallax-floating, world-map**

Add these entries inside the `fullDemos` object:

```tsx
  'circling-elements': (
    <div className='flex items-center justify-center w-full h-full'>
      <CirclingElements radius={120} duration={8} pauseOnHover>
        <div className='w-14 h-14 rounded-full bg-black flex items-center justify-center text-white font-bold'>1</div>
        <div className='w-14 h-14 rounded-full bg-[#5227FF] flex items-center justify-center text-white font-bold'>2</div>
        <div className='w-14 h-14 rounded-full bg-[#FF9FFC] flex items-center justify-center text-black font-bold'>3</div>
        <div className='w-14 h-14 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold'>4</div>
        <div className='w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold'>5</div>
      </CirclingElements>
    </div>
  ),
  'marquee-svg-path': (
    <div className='w-full h-full flex items-center justify-center overflow-hidden'>
      <MarqueeAlongSvgPath
        path='M 50,150 Q 250,50 450,150 Q 650,250 850,150'
        viewBox='0 0 900 300'
        width='100%'
        height='100%'
        baseVelocity={40}
      >
        <span className='text-black font-bold text-lg mx-6'>Design</span>
        <span className='text-[#6b6b6b] text-lg mx-6'>Build</span>
        <span className='text-black font-bold text-lg mx-6'>Ship</span>
        <span className='text-[#6b6b6b] text-lg mx-6'>Iterate</span>
      </MarqueeAlongSvgPath>
    </div>
  ),
  'parallax-floating': (
    <div className='w-full h-full overflow-hidden bg-gray-50 relative'>
      <ParallaxFloating sensitivity={0.5} className='w-full h-full'>
        <FloatingElement depth={0.5} className='absolute top-[10%] left-[10%]'>
          <div className='w-24 h-24 bg-black rounded-2xl' />
        </FloatingElement>
        <FloatingElement depth={1.5} className='absolute top-[15%] right-[20%]'>
          <div className='w-16 h-16 bg-[#5227FF] rounded-full' />
        </FloatingElement>
        <FloatingElement depth={2} className='absolute top-[50%] left-[25%]'>
          <div className='w-32 h-20 bg-gray-300 rounded-xl' />
        </FloatingElement>
        <FloatingElement depth={1} className='absolute top-[60%] right-[15%]'>
          <div className='w-20 h-20 bg-[#FF9FFC] rounded-lg' />
        </FloatingElement>
        <FloatingElement depth={0.8} className='absolute bottom-[15%] left-[45%]'>
          <div className='w-28 h-14 bg-gray-700 rounded-xl' />
        </FloatingElement>
      </ParallaxFloating>
    </div>
  ),
  'world-map': (
    <div className='w-full h-full'>
      <WorldMap
        dots={[
          { lat: 52.3676, lng: 4.9041, label: 'Amsterdam' },
          { lat: 51.5074, lng: -0.1278, label: 'London' },
          { lat: 40.7128, lng: -74.006, label: 'New York' },
          { lat: 35.6762, lng: 139.6503, label: 'Tokyo' },
          { lat: -33.8688, lng: 151.2093, label: 'Sydney' },
        ]}
        arcs={[
          { from: { lat: 52.3676, lng: 4.9041 }, to: { lat: 51.5074, lng: -0.1278 } },
          { from: { lat: 52.3676, lng: 4.9041 }, to: { lat: 40.7128, lng: -74.006 } },
          { from: { lat: 40.7128, lng: -74.006 }, to: { lat: 35.6762, lng: 139.6503 } },
          { from: { lat: 35.6762, lng: 139.6503 }, to: { lat: -33.8688, lng: 151.2093 } },
        ]}
      />
    </div>
  ),
```

- [ ] **Step 3: Verify the app compiles**

Run: `cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -20`

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/lib/component-previews.tsx
git commit -m "Add full demos for blocks: circling-elements, marquee-svg-path, parallax-floating, world-map; fix marquee cardPreview slug mismatch"
```

---

### Task 8: Final Verification

**Files:**
- Read: `src/lib/component-previews.tsx` (verify all entries present)

- [ ] **Step 1: Count fullDemos entries to verify completeness**

Run: `cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && grep -cE "^\s+'[a-z-]+':|\s+[a-z]+:" src/lib/component-previews.tsx` to get a rough count.

Then run a more precise check:

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && node -e "
const fs = require('fs');
const registry = fs.readFileSync('src/lib/components-registry.ts', 'utf8');
const previews = fs.readFileSync('src/lib/component-previews.tsx', 'utf8');
const slugs = [...registry.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
const fullDemoSection = previews.slice(previews.indexOf('export const fullDemos'));
const missing = slugs.filter(s => !fullDemoSection.includes(\"'\" + s + \"'\") && !fullDemoSection.match(new RegExp('\\\\b' + s.replace(/-/g, '') + '\\\\b')));
console.log('Missing fullDemos:', missing.length ? missing.join(', ') : 'NONE (besides skipped)');
"
```

Expected: Only `letter-swap` and `pixel-trail-block` are missing (intentionally skipped -- no component files).

- [ ] **Step 2: Run full build**

Run: `cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -30`

Expected: Build succeeds with no errors.

- [ ] **Step 3: Run dev server and spot-check**

Run: `cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next dev`

Spot-check these pages in browser:
- `/components/split-text` -- should show two text variations
- `/components/antigravity` -- should show two particle fields side by side
- `/components/pixel-card` -- should show three card variants
- `/components/soft-aurora` -- should show full WebGL aurora
- `/components/world-map` -- should show map with Amsterdam connections
