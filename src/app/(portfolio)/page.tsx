'use client';

import Image from 'next/image';
import TiltedCard from '@/components/tilted-card/TiltedCard';
import { motion } from 'motion/react';
import VariableProximity from '@/components/proximity-text/ProximityText';
import ContactForm from '@/components/ContactForm';
import Carousel from '@/components/Carousel';
import Modal from '@/components/modal/Modal';
import { RefObject, useRef, useState } from 'react';
import CollapseStack from '@/components/collapse-stack/CollapseStack';

interface Project {
  title: string;
  description: string;
  media: {
    type: 'image' | 'video';
    src: string;
    alt?: string;
  };
  content: {
    description: string;
    technologies: string[];
    features: string[];
    link: string | null;
  };
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<
    (typeof projects)[0] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProjectClick = (project: (typeof projects)[0]) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const projects = [
    {
      title: 'Wakeup',
      image: '/projects/wakeup-not-rounded.svg',
      description: 'Competitive screentime tracking app',
      media: {
        type: 'image' as const,
        src: '/projects/wakeup-not-rounded.svg',
        alt: 'Wakeup app interface',
      },
      content: {
        description: `
      The idea for <strong>WakeUp</strong> began with the realization that too many people, including myself, spend an excessive amount of time on their screens. You see it everywhere, at festivals, in social settings, even among young children. I wanted to create something that could genuinely help people break free from this growing <strong>addiction</strong>.
      As I developed the app, I discovered that <strong>phone addiction</strong> is even more serious and widespread than I initially thought. To understand it better, I started talking to people who felt they struggled with it, asking what they believed was at the root of their problem and what they had already tried to overcome it.
      I've been documenting the entire creation process on <strong>social media</strong>, and WakeUp is still in <strong>active development</strong>. Through this project, I've learned a great deal about <strong>problem validation</strong>, <strong>user behavior</strong>, and the importance of designing <strong>meaningful experiences</strong>.
      `,
        technologies: [
          'React Native',
          'Expo',
          'TypeScript',
          'Tailwind CSS',
          'Supabase',
          'Figma',
        ],
        features: [
          'Screentime tracking of friends',
          'Personal screentime tracking',
          'Custom challenges to reduce screentime',
          'Dark/light mode support',
          'Evolving avatars to reflect your screentime',
        ],
        link: 'https://www.getwakeup.app',
      },
    },
    {
      title: 'Teckit',
      image: '/projects/teckit.svg',
      description: 'A comprehensive toolkit application for event managers.',
      media: {
        type: 'video' as const,
        src: '/projects/teckit_recording_one.mp4',
        alt: 'Teckit application demo',
      },
      content: {
        description: `
<strong>Teckit</strong> started as a <strong>passion project</strong> between me and four friends who shared a deep interest in the <strong>event industry</strong>. We wanted to create a modern, <strong>all-in-one platform</strong> that made managing events easier for both organizers and visitors. Over time, we built a complete <strong>business dashboard</strong>, a <strong>client-side interface</strong>, and even a <strong>mobile scanner app</strong> to verify tickets on-site.
We worked on Teckit <strong>full-time</strong> for about two years, putting a lot of energy into <strong>design</strong>, <strong>functionality</strong>, and <strong>user experience</strong>. Unfortunately, we eventually decided not to launch it due to the overwhelming <strong>competition</strong> in the market. Even though it was difficult to cut our losses after so much work, the experience was incredibly valuable, and it truly marked the beginning of my journey into <strong>frontend development</strong> and <strong>product design</strong>. Through Teckit, I learned the importance of creating interfaces that are both <strong>functional</strong> and <strong>visually engaging</strong>, and it sparked my passion for building <strong>digital experiences</strong>.
`,
        technologies: [
          'React',
          'TypeScript',
          'NextJs',
          'NestJS',
          'Tailwind CSS',
          'React Native',
          'Prisma ORM',
          'Figma',
        ],
        features: [
          'Business dashboard',
          'Client-side interface',
          'Mobile scanner app',
          'Real-time',
          'Ticket verification',
          'Ticket management',
          'Event management',
          'Customer Contact',
        ],
        link: 'https://github.com/tekcit/repo',
      },
    },
    {
      title: 'EarnIt',
      image: '/projects/earnit.svg',
      description: 'The job platform for internationals',
      media: {
        type: 'image' as const,
        src: '/projects/earnit.svg',
        alt: 'EarnIt platform interface',
      },
      content: {
        description: `
With <strong>EarnIt</strong>, our goal was to build a <strong>client dashboard</strong> for <strong>international students</strong> to easily register themselves and log their <strong>working hours</strong>. These entries were then <strong>automatically forwarded</strong> to the correct departments with proper <strong>invoicing</strong>, streamlining a process that was previously done <strong>manually</strong>.
The project was a <strong>collaboration</strong> with a <strong>real company</strong>, and it challenged us to combine <strong>technical precision</strong> with <strong>real-world usability</strong>. In the end, our solution worked so effectively that we received the award for <strong>Best Project</strong> within the university, a recognition that made the experience even more rewarding.
`,
        technologies: [
          'React',
          'Java',
          'Spring Boot',
          'PostgreSQL',
          'Tailwind CSS',
          'Figma',
        ],
        features: [
          'Gamified learning experience',
          'Point and badge system',
          'Progress tracking',
          'Social learning features',
          'Payment integration for premium content',
        ],
        link: null,
      },
    },
    {
      title: 'Othello Game',
      image: '/projects/othello.png',
      description: 'A classic board game implementation with AI opponent.',
      media: {
        type: 'image' as const,
        src: '/projects/othello.png',
        alt: 'Othello game board',
      },
      content: {
        description: `
For this project, we developed a <strong>multiplayer</strong> version of the game <strong>Othello</strong>. The main goal was to gain a deeper understanding of <strong>device connectivity</strong> and <strong>network communication</strong>. We designed our own <strong>custom protocol</strong> for sending packets, which included implementing a <strong>handshake system</strong> and <strong>message forwarding</strong> to ensure data reached the correct endpoints.
We built both the <strong>client</strong> and <strong>server</strong> from scratch, with the server managing communication between two active players. Through this project, I gained a strong grasp of the principles of <strong>object-oriented programming (OOP)</strong> and a better understanding of how <strong>networked systems</strong> communicate in <strong>real time</strong>. Additionally we had to make a <strong>MinMax algorithm</strong> to make the <strong>AI opponent</strong>.
`,
        technologies: [
          'Java',
          'Java Socket',
          'Tailwind CSS',
          'Minimax Algorithm',
        ],
        features: [
          'AI opponent with multiple difficulty levels',
          'Move validation and game rules enforcement',
          'Score tracking and game statistics',
          'Responsive design for mobile and desktop',
          'Online multiplayer support',
        ],
        link: null,
      },
    },
    {
      title: 'Iron Man Helmet',
      image: '/projects/iron-man-helmet.svg',
      description: 'A 3D printed, moving Iron Man helmet with LED integration.',
      media: {
        type: 'video' as const,
        src: '/projects/iron_man_video_working.mp4',
        alt: '3D printed Iron Man helmet',
      },
      content: {
        description: `
        During the <strong>COVID-19 lockdown</strong>, I built an <strong>Iron Man helmet</strong> completely from scratch. I started by finding <strong>3D models</strong> online, then <strong>printed</strong> and <strong>assembled</strong> all the parts myself. I coded the <strong>electronics</strong> so the helmet could respond to <strong>motion</strong> and open on command, combining both <strong>hardware</strong> and <strong>software</strong> elements into one <strong>functional prototype</strong>.
        There were many moments when I considered giving up, but this project ultimately taught me one of the most important lessons: <strong>persistence</strong>. Never stop just before the finish line, because that's often when you're closest to achieving something great.
        `,
        technologies: [
          '3D Modeling',
          'Arduino',
          'C++',
          'LED Programming',
          '3D Printing',
        ],
        features: [
          'Screen-accurate 3D model',
          'Custom LED lighting system',
          'Arduino-based controls',
          'Modular design for easy assembly',
          'Detailed documentation and build guide',
        ],
        link: null,
      },
    },
    {
      title: 'Bird CRM',
      image: '/projects/bird.svg',
      description: 'A CRM for University of Twente',
      media: {
        type: 'image' as const,
        src: '/projects/bird.svg',
        alt: 'Bird CRM',
      },
      content: {
        description: `
We developed a Relationship Management System for the University of Twente to help manage partnerships with external universities. The platform allows staff to register and track contact moments between individuals from different institutions, creating a clear overview of ongoing collaborations.
The system gives the internal office a better understanding of existing connections — who is involved, how they are linked, and the nature of each relationship. This project provided valuable insight into building structured data systems that improve transparency and coordination across organizations.
`,
        technologies: [
          'React',
          'TypeScript',
          'Next.js',
          'Tailwind CSS',
          'Figma',
        ],
        features: [
          'CRM for University of Twente',
          'Ability for the internal office to track and manage relationships',
          'Role based access control',
        ],
      },
    },
  ];
  return (
    <div className='flex flex-col gap-20'>
      {/* Hero section */}
      <section className='relative flex flex-col justify-center items-center h-screen overflow-hidden'>
        {/* Container for name and image */}
        <div className='relative flex flex-col items-center text-center'>
          {/* Image overlapping in the center */}
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 1.2,
              delay: 0.8,
              ease: 'easeOut',
            }}
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20'
          >
            <Image
              src='/dirck_mulder_organge_light.jpg'
              alt='Dirck Mulder'
              className='w-20 h-30 sm:w-24 sm:h-36 md:w-28 md:h-42 lg:w-32 lg:h-48 xl:w-36 xl:h-54 object-cover rounded-t-full rounded-b-full shadow-2xl'
              width={160}
              height={240}
            />
          </motion.div>

          {/* Large serif text */}
          <motion.h1
            initial={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{
              duration: 1,
              delay: 0.2,
              ease: 'easeOut',
            }}
            className='text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-primary font-serif tracking-wider leading-none select-none'
          >
            DIRCK
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{
              duration: 1,
              delay: 0.4,
              ease: 'easeOut',
            }}
            className='text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-primary font-serif tracking-wider leading-none select-none'
          >
            MULDER
          </motion.h1>
        </div>
      </section>

      {/* Projects section */}
      <section
        id='projects'
        className='px-16 w-full flex justify-center items-center'
      >
        <div className='grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 justify-center gap-18 items-center'>
          {projects.map(project => (
            <TiltedCard
              key={project.title}
              imageSrc={project.image}
              altText={project.title}
              captionText={'click me'}
              rotateAmplitude={15}
              scaleOnHover={1.1}
              showMobileWarning={false}
              showTooltip={true}
              displayOverlayContent={true}
              onClick={() => handleProjectClick(project)}
              overlayContent={
                <div className='p-6'>
                  <div className='bg-black/20 px-4 py-2 text-xl rounded-md backdrop-blur-sm'>
                    <p className='tilted-card-demo-text !text-white'>
                      {project.title}
                    </p>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      </section>

      <section id='experience' className='w-full'>
        <CollapseStack />
      </section>
      {/* Skills section with 3D model carousel */}
      <section id='skills' className='w-full'>
        <div className='w-full mx-auto'>
          <Carousel speed={1} className='h-64 -mt-10' />
        </div>
      </section>
      {/* <section id='image-trail' className='w-full h-40 pb-20 relative'>
        <ImageTrail
          key={1}
          items={[
            '/projects/wakeup-not-rounded.svg',
            '/projects/othello.png',
            '/projects/teckit.svg',
            '/wakeup.svg',
            '/dirck_mulder_organge_light.jpg',
            '/next.svg',
            '/vercel.svg',
            '/file.svg',
            '/globe.svg',
            '/window.svg',
          ]}
          variant={2}
        />
      </section> */}
      <section
        id='about'
        className='flex justify-center items-start px-8 md:px-20 py-10'
      >
        <div className='flex flex-col md:flex-row gap-4 md:gap-10 max-w-4xl'>
          <div
            ref={containerRef}
            className='flex flex-col gap-10 justify-start items-start'
          >
            <VariableProximity
              label={'About Me'}
              className={
                'variable-proximity-demo text-primary text-4xl font-bold tracking-wide leading-none'
              }
              fromFontVariationSettings="'wght' 400, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              containerRef={containerRef as RefObject<HTMLElement>}
              radius={100}
              falloff='linear'
            />
            {/* <Image
                src='/boot_bouwen.jpg'
                alt='Dirck Mulder'
                fill
                className='object-cover'
              /> */}
          </div>
          <div ref={containerRef} className='h-full'>
            <VariableProximity
              label='
              Hi, I’m Dirck. I’ve been creating things my whole life. When I was young, I got my first Arduino, and from that moment on, building and experimenting became my passion. I’ve always loved discovering new ideas, tools, and skills to unlock. At just 14 or 15, I started my first small business making recycled bracelets because I wanted to experience what it’s like to make real business decisions and see an idea come to life. Right now, I’m finishing my bachelor’s degree in Computer Science. Over the past few years, I’ve learned a lot—not only about technology, but also about problem-solving and persistence. The biggest lesson for me has been that with enough dedication, any problem can be solved. Sometimes the odds are against you, but it’s up to you to turn that around. Now, I’m looking forward to new challenges that will help me grow, learn, and keep creating.'
              className='variable-proximity-demo text-lg h-full'
              fromFontVariationSettings="'wght' 400, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              containerRef={containerRef as RefObject<HTMLElement>}
              radius={100}
              falloff='linear'
            />
          </div>
        </div>
      </section>
      {/* Music section
      <section id='music' className='w-full'>
        <div className='relative isolate overflow-hidden'>
          <ThreeDCarousel />
        </div>
      </section> */}

      {/* Contact Form */}
      <ContactForm />

      <section
        id='socials'
        className='flex justify-center items-center w-full pb-20 px-10'
      >
        <div className='flex flex-row gap-20 justify-around items-center'>
          <a
            href='https://www.linkedin.com/in/dirck-mulder-1b2716222/'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:scale-110 transition-transform duration-300'
          >
            <Image
              className='filter brightness-0 saturate-100'
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(27%) sepia(100%) saturate(2000%) hue-rotate(200deg) brightness(100%) contrast(100%)',
              }}
              src='/socials/linkedin.png'
              alt='LinkedIn'
              width={80}
              height={80}
            />
          </a>
          <a
            href='https://www.instagram.com/dirckmulder/'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:scale-110 transition-transform duration-300'
          >
            <Image
              className='filter brightness-0 saturate-100'
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(17%) sepia(99%) saturate(7404%) hue-rotate(300deg) brightness(95%) contrast(101%)',
              }}
              src='/socials/instagram.png'
              alt='Instagram'
              width={80}
              height={80}
            />
          </a>
          <a
            href='https://www.youtube.com/@DirckMulder'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:scale-110 transition-transform duration-300'
          >
            <Image
              className='filter brightness-0 saturate-100'
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(14%) sepia(100%) saturate(7500%) hue-rotate(0deg) brightness(100%) contrast(100%)',
              }}
              src='/socials/youtube.png'
              alt='YouTube'
              width={100}
              height={80}
            />
          </a>
        </div>
      </section>

      {/* Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        project={selectedProject as Project}
      />
    </div>
  );
}
