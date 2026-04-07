export const liveStepCodes: Record<string, string> = {
  // blur-text
  'blur-text-final': `<BlurText text="Crafted with care" animateBy="words" delay={0.05} className="text-4xl font-bold" />`,
  'blur-text-step3': `<BlurText text="Each word fades in" animateBy="words" delay={0.05} className="text-3xl font-bold" />`,
  'blur-text-step4': `<BlurText text="Timing is everything in animation" animateBy="words" delay={0.05} direction="bottom" className="text-2xl font-bold" />`,

  // electric-border
  'electric-border-final': `<ElectricBorder color="#4af" duration={2} borderWidth={2} borderRadius="16px">
  <div className="px-8 py-6 bg-zinc-900 text-white rounded-[16px]">
    <p className="text-lg font-bold">Premium Plan</p>
    <p className="text-sm text-white/60">Everything included</p>
  </div>
</ElectricBorder>`,
  'electric-border-step3': `<ElectricBorder color="#ffffff" duration={3} borderWidth={2} borderRadius="12px">
  <div className="px-12 py-8 bg-black text-white text-lg">Electric Border Effect</div>
</ElectricBorder>`,
  'electric-border-step4': `<ElectricBorder color="#3b82f6" duration={4} borderRadius="9999px" borderWidth={3}>
  <div className="px-8 py-3 bg-zinc-900 text-white text-sm rounded-full">Rounded with blue</div>
</ElectricBorder>`,

  // tilted-card
  'tilted-card-final': `<TiltedCard maxTilt={15} scale={1.05} perspective={1000} glareEnable={true} glareMaxOpacity={0.2} className="w-64 h-80 bg-zinc-900 rounded-2xl flex items-center justify-center">
  <span className="text-white text-lg">Hover me</span>
</TiltedCard>`,
  'tilted-card-step3': `<TiltedCard maxTilt={25} scale={1.08} glareEnable={true} glareMaxOpacity={0.3} className="w-56 h-72 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center">
  <span className="text-white text-lg font-bold">Dramatic</span>
</TiltedCard>`,

  // line-waves
  'line-waves-final': `<div style={{ width: "100%", height: "300px" }}>
  <LineWaves lineCount={8} lineColor="#000" amplitude={40} frequency={0.02} speed={0.02} />
</div>`,
  'line-waves-step2': `<div style={{ width: "100%", height: "250px" }}>
  <LineWaves lineCount={5} lineColor="#e5e5e5" amplitude={30} />
</div>`,
  'line-waves-step4': `<div style={{ width: "100%", height: "300px", background: "#000" }}>
  <LineWaves lineCount={12} lineColor="#333" amplitude={60} speed={0.02} />
</div>`,

  // =============================================
  // TEXT ANIMATIONS
  // =============================================

  // animated-list
  'animated-list-final': `<AnimatedList items={["Design the interface", "Build the components", "Write the tests", "Deploy to production", "Ship it"]} showGradients={true} enableArrowNavigation={true} />`,

  // antigravity
  'antigravity-final': `<div style={{ width: "100%", height: "400px" }}>
  <Antigravity count={200} color="#5227FF" autoAnimate={true} particleSize={2} />
</div>`,

  // ascii-text
  'ascii-text-final': `<div style={{ width: "100%", height: "300px", background: "#000" }}>
  <ASCIIText text="Hello" asciiFontSize={8} textFontSize={200} textColor="#fdf9f3" enableWaves={true} />
</div>`,

  // circular-text
  'circular-text-final': `<CircularText text="CIRCULAR TEXT * SPINNING * " spinDuration={10} onHover="speedUp" className="text-black" />`,

  // curved-loop
  'curved-loop-final': `<div style={{ width: "100%", height: "200px", background: "#000", overflow: "hidden", display: "flex", alignItems: "center" }}>
  <CurvedLoop marqueeText="CURVED LOOP * FLOWING TEXT * " speed={3} className="text-white" curveAmount={300} />
</div>`,

  // decrypted-text
  'decrypted-text-final': `<DecryptedText text="Hover to decrypt this text" className="text-4xl font-bold text-black" encryptedClassName="text-4xl font-bold text-gray-300" animateOn="hover" speed={60} sequential={true} />`,

  // falling-text
  'falling-text-final': `<div style={{ width: "100%", height: "300px" }}>
  <FallingText text="Click or hover to interact with falling words" trigger="auto" gravity={0.8} fontSize="1.2rem" />
</div>`,

  // glitch-text
  'glitch-text-final': `<GlitchText text="SYSTEM ERROR" speed={500} enableShadow={true} className="text-5xl font-bold text-black" />`,

  // rotating-text
  'rotating-text-final': `<div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "2rem", fontWeight: "bold" }}>
  <span>I build</span>
  <RotatingText texts={["websites", "products", "experiences"]} mainClassName="text-white bg-black px-3 py-1 rounded-lg" rotationInterval={2000} />
</div>`,

  // scrambled-text
  'scrambled-text-final': `<div style={{ background: "#000", padding: "3rem", display: "flex", justifyContent: "center" }}>
  <ScrambledText className="!m-0 !text-4xl text-white font-bold" scrambleChars=".:">
    Hover to scramble
  </ScrambledText>
</div>`,

  // scroll-float
  'scroll-float-final': `<ScrollFloat containerClassName="!my-0" textClassName="!text-4xl text-black">
  Scroll Float Effect
</ScrollFloat>`,

  // scroll-reveal
  'scroll-reveal-final': `<ScrollReveal containerClassName="!my-0" textClassName="!text-2xl text-black">
  Words reveal progressively as you scroll through the page
</ScrollReveal>`,

  // scroll-velocity
  'scroll-velocity-final': `<ScrollVelocity texts={["Scroll Velocity", "Speed Changes"]} velocity={80} className="text-black text-3xl font-bold" />`,

  // shiny-text
  'shiny-text-final': `<ShinyText text="Premium Shiny Effect" className="text-5xl font-bold" color="#888" shineColor="#000" speed={2.5} />`,

  // shuffle
  'shuffle-final': `<Shuffle text="SHUFFLE UP" className="text-4xl font-bold text-black" shuffleDirection="up" loop={true} loopDelay={2} />`,

  // split-text
  'split-text-final': `<SplitText text="Characters split apart" className="text-4xl font-bold text-black" splitType="chars" duration={1} delay={30} />`,

  // text-pressure
  'text-pressure-final': `<div style={{ width: "100%", height: "150px" }}>
  <TextPressure text="Pressure" textColor="#000000" minFontSize={36} />
</div>`,

  // text-type
  'text-type-final': `<TextType text={["Hello, World!", "Welcome to the demo", "Type it out..."]} className="text-4xl font-bold text-black" typingSpeed={55} pauseDuration={2000} />`,

  // true-focus
  'true-focus-final': `<TrueFocus sentence="Only one word is sharp" blurAmount={5} borderColor="black" glowColor="rgba(0,0,0,0.5)" animationDuration={0.4} pauseBetweenAnimations={1} />`,

  // =============================================
  // ANIMATIONS
  // =============================================

  // crosshair
  'crosshair-final': `<div style={{ width: "100%", height: "300px", background: "#000", position: "relative", overflow: "hidden" }}>
  <Crosshair color="white" />
</div>`,

  // glare-hover
  'glare-hover-final': `<GlareHover width="280px" height="180px" background="#111" borderRadius="16px" glareColor="#ffffff" glareOpacity={0.6}>
  <span className="text-white text-lg font-medium">Hover me</span>
</GlareHover>`,

  // logo-loop
  'logo-loop-final': `<LogoLoop logos={[{ node: <span className="text-black font-bold text-2xl">React</span> }, { node: <span className="text-black font-bold text-2xl">Next.js</span> }, { node: <span className="text-black font-bold text-2xl">TypeScript</span> }, { node: <span className="text-black font-bold text-2xl">Tailwind</span> }]} speed={100} logoHeight={36} pauseOnHover />`,

  // magic-rings
  'magic-rings-final': `<div style={{ width: "100%", height: "400px" }}>
  <MagicRings color="#5227FF" colorTwo="#FF9FFC" ringCount={6} followMouse={true} clickBurst={true} />
</div>`,

  // magnet
  'magnet-final': `<Magnet padding={80} magnetStrength={3}>
  <div className="w-28 h-28 bg-black rounded-full flex items-center justify-center">
    <span className="text-white text-sm">Pull me</span>
  </div>
</Magnet>`,

  // meta-balls
  'meta-balls-final': `<div style={{ width: "100%", height: "400px" }}>
  <MetaBalls color="#5227FF" ballCount={8} animationSize={20} enableMouseInteraction={true} enableTransparency={false} />
</div>`,

  // metallic-paint
  'metallic-paint-final': `<div style={{ width: "100%", height: "400px" }}>
  <MetallicPaint imageSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop" />
</div>`,

  // pixel-trail
  'pixel-trail-final': `<div style={{ width: "100%", height: "300px", background: "#000", position: "relative", overflow: "hidden" }}>
  <PixelTrail gridSize={24} trailSize={0.15} color="#ffffff" />
</div>`,

  // shape-blur
  'shape-blur-final': `<div style={{ width: "100%", height: "400px" }}>
  <ShapeBlur variation={0} shapeSize={1.2} roundness={0.4} />
</div>`,

  // target-cursor
  'target-cursor-final': `<div style={{ width: "100%", height: "300px", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
  <TargetCursor hideDefaultCursor={false} />
  <span className="text-black/30 text-xl pointer-events-none">Move cursor here</span>
</div>`,

  // =============================================
  // BACKGROUNDS
  // =============================================

  // color-bends
  'color-bends-final': `<div style={{ width: "100%", height: "400px" }}>
  <ColorBends speed={0.2} rotation={45} />
</div>`,

  // dark-veil
  'dark-veil-final': `<div style={{ width: "100%", height: "400px" }}>
  <DarkVeil speed={0.5} />
</div>`,

  // evil-eye
  'evil-eye-final': `<div style={{ width: "100%", height: "400px", background: "#000" }}>
  <EvilEye eyeColor="#FF6F37" intensity={1.5} />
</div>`,

  // light-pillar
  'light-pillar-final': `<div style={{ width: "100%", height: "400px", background: "#000" }}>
  <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1.0} />
</div>`,

  // radar
  'radar-final': `<div style={{ width: "100%", height: "400px", background: "#000" }}>
  <Radar color="#00ff88" backgroundColor="#000000" ringCount={10} sweepSpeed={1} />
</div>`,

  // soft-aurora
  'soft-aurora-final': `<div style={{ width: "100%", height: "400px" }}>
  <SoftAurora speed={0.6} scale={1.5} brightness={1.0} />
</div>`,

  // =============================================
  // COMPONENTS
  // =============================================

  // border-glow
  'border-glow-final': `<BorderGlow glowColor="40 80 60" className="w-56 h-36 flex items-center justify-center" borderRadius={20}>
  <span className="text-white text-lg font-medium">Glow effect</span>
</BorderGlow>`,

  // circular-gallery
  'circular-gallery-final': `<div style={{ width: "100%", height: "400px" }}>
  <CircularGallery items={[{ image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600", text: "Mountains" }, { image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600", text: "Forest" }, { image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600", text: "Beach" }]} bend={2} textColor="#fff" borderRadius={0.06} />
</div>`,

  // dock
  'dock-final': `<div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", width: "100%", height: "200px", paddingBottom: "1rem" }}>
  <Dock items={[{ icon: <span className="text-2xl">H</span>, label: "Home", onClick: () => {} }, { icon: <span className="text-2xl">S</span>, label: "Search", onClick: () => {} }, { icon: <span className="text-2xl">P</span>, label: "Projects", onClick: () => {} }, { icon: <span className="text-2xl">M</span>, label: "Mail", onClick: () => {} }]} baseItemSize={56} magnification={80} panelHeight={68} />
</div>`,

  // dome-gallery
  'dome-gallery-final': `<div style={{ width: "100%", height: "400px" }}>
  <DomeGallery images={["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600", "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600", "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600"]} fit={1.2} grayscale={false} />
</div>`,

  // elastic-slider
  'elastic-slider-final': `<ElasticSlider defaultValue={50} maxValue={100} leftIcon={<span>-</span>} rightIcon={<span>+</span>} />`,

  // flowing-menu
  'flowing-menu-final': `<div style={{ width: "100%", height: "400px" }}>
  <FlowingMenu items={[{ link: "#", text: "Design", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600" }, { link: "#", text: "Develop", image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600" }, { link: "#", text: "Deploy", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600" }]} />
</div>`,

  // fluid-glass
  'fluid-glass-final': `<div style={{ width: "100%", height: "400px" }}>
  <FluidGlass />
</div>`,

  // folder
  'folder-final': `<div style={{ display: "flex", gap: "3rem", justifyContent: "center" }}>
  <Folder color="#5227FF" size={1.5} items={[null, null, null]} />
  <Folder color="#FF9FFC" size={1.5} items={[null, null, null]} />
</div>`,

  // glass-surface
  'glass-surface-final': `<div style={{ width: "100%", height: "300px", background: "linear-gradient(135deg, #60a5fa, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
  <GlassSurface width={220} height={120} borderRadius={16} blur={10} opacity={0.3}>
    <span className="text-white text-lg font-medium px-6">Frosted Glass</span>
  </GlassSurface>
</div>`,

  // infinite-menu
  'infinite-menu-final': `<div style={{ width: "100%", height: "400px" }}>
  <InfiniteMenu items={[{ image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", link: "#", title: "Mountains", description: "Alpine views" }, { image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400", link: "#", title: "Forest", description: "Into the woods" }, { image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400", link: "#", title: "Beach", description: "Coastal escape" }]} />
</div>`,

  // lanyard
  'lanyard-final': `<div style={{ width: "100%", height: "400px", background: "#060010" }}>
  <Lanyard />
</div>`,

  // magic-bento
  'magic-bento-final': `<div style={{ width: "100%", height: "400px" }}>
  <MagicBento enableStars={true} enableSpotlight={true} particleCount={12} />
</div>`,

  // pixel-card
  'pixel-card-final': `<div style={{ display: "flex", gap: "2rem", justifyContent: "center" }}>
  <PixelCard variant="default" className="w-48 h-64">
    <span className="text-black text-lg font-medium relative z-10">Default</span>
  </PixelCard>
  <PixelCard variant="blue" className="w-48 h-64">
    <span className="text-black text-lg font-medium relative z-10">Blue</span>
  </PixelCard>
</div>`,

  // reflective-card
  'reflective-card-final': `<div style={{ display: "flex", justifyContent: "center", padding: "3rem", background: "#111827" }}>
  <ReflectiveCard className="w-64 h-80 rounded-2xl" />
</div>`,

  // scroll-stack
  'scroll-stack-final': `<div style={{ width: "100%", height: "400px", overflow: "auto" }}>
  <ScrollStack useWindowScroll={false}>
    <ScrollStackItem itemClassName="bg-black text-white flex items-center justify-center rounded-2xl">
      <span className="text-2xl">First Card</span>
    </ScrollStackItem>
    <ScrollStackItem itemClassName="bg-[#5227FF] text-white flex items-center justify-center rounded-2xl">
      <span className="text-2xl">Second Card</span>
    </ScrollStackItem>
  </ScrollStack>
</div>`,

  // =============================================
  // BLOCKS
  // =============================================

  // circling-elements
  'circling-elements-final': `<CirclingElements radius={120} duration={8} pauseOnHover>
  <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white font-bold">1</div>
  <div className="w-14 h-14 rounded-full bg-[#5227FF] flex items-center justify-center text-white font-bold">2</div>
  <div className="w-14 h-14 rounded-full bg-[#FF9FFC] flex items-center justify-center text-black font-bold">3</div>
  <div className="w-14 h-14 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">4</div>
</CirclingElements>`,

  // macbook-scroll
  'macbook-scroll-final': `<MacbookScroll src="/projects/teckit.svg" title="Scroll to open" />`,

  // marquee-svg-path
  'marquee-svg-path-final': `<div style={{ width: "100%", height: "200px", overflow: "hidden" }}>
  <MarqueeAlongSvgPath path="M 50,150 Q 250,50 450,150 Q 650,250 850,150" viewBox="0 0 900 300" width="100%" height="100%" baseVelocity={40}>
    <span className="text-black font-bold text-lg mx-6">Design</span>
    <span className="text-gray-500 text-lg mx-6">Build</span>
    <span className="text-black font-bold text-lg mx-6">Ship</span>
  </MarqueeAlongSvgPath>
</div>`,

  // terminal
  'terminal-final': `<Terminal commands={["git clone repo", "cd repo && npm install", "npm run dev"]} outputs={{ 0: ["Cloning into repo...", "Receiving objects: 100%"], 1: ["added 312 packages in 4.2s"], 2: ["ready - started on localhost:3000"] }} typingSpeed={45} title="bash" />`,

  // world-map
  'world-map-final': `<div style={{ width: "100%", height: "400px" }}>
  <WorldMap dots={[{ lat: 52.37, lng: 4.9, label: "Amsterdam" }, { lat: 51.51, lng: -0.13, label: "London" }, { lat: 40.71, lng: -74.01, label: "New York" }, { lat: 35.68, lng: 139.65, label: "Tokyo" }]} arcs={[{ from: { lat: 52.37, lng: 4.9 }, to: { lat: 51.51, lng: -0.13 } }, { from: { lat: 52.37, lng: 4.9 }, to: { lat: 40.71, lng: -74.01 } }]} />
</div>`,
};
