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
};
