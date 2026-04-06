import BlurText from '@/components/library/text-animations/BlurText';
import GlitchText from '@/components/library/text-animations/GlitchText';
import ElectricBorder from '@/components/library/animations/ElectricBorder';
import TiltedCard from '@/components/library/components/TiltedCard';
import LineWaves from '@/components/library/backgrounds/LineWaves';
import MacbookScroll from '@/components/library/blocks/MacbookScroll';

export const cardPreviews: Record<string, React.ReactNode> = {
  'blur-text': (
    <BlurText text='Hello World' className='text-2xl font-bold text-black' />
  ),
  'glitch-text': (
    <GlitchText text='GLITCH' className='text-3xl font-bold text-black' />
  ),
  'electric-border': (
    <ElectricBorder color='#000' duration={2}>
      <div className='px-6 py-4 bg-black text-white text-sm rounded-xl'>
        Electric
      </div>
    </ElectricBorder>
  ),
  'tilted-card': (
    <TiltedCard className='w-32 h-24 bg-black rounded-lg flex items-center justify-center'>
      <span className='text-white text-xs'>Hover me</span>
    </TiltedCard>
  ),
  'line-waves': (
    <div className='w-full h-full'>
      <LineWaves lineCount={5} amplitude={20} />
    </div>
  ),
  'macbook-scroll': (
    <div className='w-24 h-16 bg-[#010101] rounded-md flex items-center justify-center'>
      <span className='text-white text-[8px]'>MacBook</span>
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
};
