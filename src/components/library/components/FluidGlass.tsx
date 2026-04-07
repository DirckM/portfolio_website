'use client';

export default function FluidGlass() {
  return (
    <div className='relative w-full h-[400px] flex flex-col justify-center items-center bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] rounded-lg overflow-hidden'>
      <div className='absolute inset-0'>
        <div
          className='absolute w-48 h-48 rounded-full blur-3xl opacity-30'
          style={{
            background:
              'radial-gradient(circle, rgba(100,150,255,0.6), transparent)',
            top: '20%',
            left: '30%',
            animation: 'glassFloat 6s ease-in-out infinite',
          }}
        />
        <div
          className='absolute w-32 h-32 rounded-full blur-3xl opacity-20'
          style={{
            background:
              'radial-gradient(circle, rgba(200,100,255,0.6), transparent)',
            top: '50%',
            left: '55%',
            animation: 'glassFloat 8s ease-in-out infinite reverse',
          }}
        />
      </div>
      <div className='relative z-10 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-10 py-6'>
        <p className='text-white/60 text-sm'>Fluid Glass Surface</p>
      </div>
      <style>{`
        @keyframes glassFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
      `}</style>
    </div>
  );
}
