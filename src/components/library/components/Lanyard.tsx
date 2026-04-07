'use client';

export default function Lanyard() {
  return (
    <div className='relative z-0 w-full h-[400px] flex flex-col justify-center items-center bg-[#060010] rounded-lg'>
      <div className='flex flex-col items-center gap-4'>
        <svg
          width='60'
          height='80'
          viewBox='0 0 60 80'
          fill='none'
          className='opacity-40'
        >
          <rect
            x='5'
            y='20'
            width='50'
            height='55'
            rx='4'
            stroke='white'
            strokeWidth='1.5'
          />
          <circle cx='30' cy='40' r='10' stroke='white' strokeWidth='1.5' />
          <line
            x1='30'
            y1='10'
            x2='30'
            y2='20'
            stroke='white'
            strokeWidth='1.5'
          />
          <circle cx='30' cy='8' r='3' stroke='white' strokeWidth='1.5' />
          <rect
            x='15'
            y='55'
            width='30'
            height='4'
            rx='1'
            fill='white'
            fillOpacity='0.2'
          />
          <rect
            x='20'
            y='62'
            width='20'
            height='3'
            rx='1'
            fill='white'
            fillOpacity='0.15'
          />
        </svg>
        <p className='text-white/30 text-xs'>
          Lanyard Badge with Physics Simulation
        </p>
      </div>
    </div>
  );
}
