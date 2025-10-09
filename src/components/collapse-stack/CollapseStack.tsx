'use client'

import { Job, jobs } from '../../../data/jobs';
import { div } from 'framer-motion/client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

export default function CollapseStack() {
  return (
    // Change this depending on the height of the cards
    <div className='mt-[30vh] mb-[50rem] px-10'>
      {jobs.map((job, index) => (
        <Card key={index} {...job} />
      ))}
    </div>
  );
}

function Card({
  title,
  company,
  location,
  period,
  description,
  responsibilities,
  image,
}: Job) {

  const container  = useRef(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end end']
  })

  const scale = useTransform(scrollYProgress, [0, 1], [2, 1])

  return (
    <div className='h-[100vh] flex justify-center items-center sticky top-0' ref={container}>
      {' '}
      {/* cardContainer */}
      <div className='w-full max-w-[1000px] md:h-[500px] sm:h-[600px] h-full bg-blue-400 rounded-2xl p-6'>
        <div className='flex flex-col md:flex-row gap-6 h-full'>
          {/* title period and company */}
          <div className='flex flex-col justify-between md:w-1/3'>
            <div>
              <h2 className='text-3xl font-bold mb-2'>{title}</h2>
              <h3 className='text-xl font-medium opacity-90'>{company}</h3>
            </div>
            <p className='text-sm opacity-80 mt-4'>{period}</p>
          </div>
          
          {/* description and responsibilities */}
          <div className='md:w-2/3 space-y-8'>
            <p className='text-lg leading-relaxed'>{description}</p>

            <ul className='list-disc list-inside space-y-1 text-base opacity-95'>
              {responsibilities.map((responsibility, index) => (
                <li key={index}>{responsibility}</li>
              ))}
            </ul>
          </div>

          {/*  */}
          <div className='relative w-full md:w-[60%] h-full rounded-2xl overflow-hidden'> {/* imageContainer */}
            <motion.div style={{ scale }} className='w-full h-full'> {/* image inner*/}
              <Image className='object-cover' src={image.src} alt={image.alt} fill />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
