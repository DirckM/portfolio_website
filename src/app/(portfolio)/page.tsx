'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import VariableProximity from '@/components/proximity-text/ProximityText';
import ContactForm from '@/components/ContactForm';
import Modal from '@/components/modal/Modal';
import { RefObject, useRef, useState } from 'react';
import BlurText from '@/components/library/text-animations/BlurText';
import Magnet from '@/components/library/animations/Magnet';

interface Project {
  title: string;
  description: string;
  image: string;
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const projects: Project[] = [
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
        description:
          'The idea for <strong>WakeUp</strong> began with the realization that too many people, including myself, spend an excessive amount of time on their screens. You see it everywhere, at festivals, in social settings, even among young children. I wanted to create something that could genuinely help people break free from this growing <strong>addiction</strong>.',
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
      description: 'All-in-one platform for event managers',
      media: {
        type: 'video' as const,
        src: '/projects/teckit_recording_one.mp4',
        alt: 'Teckit application demo',
      },
      content: {
        description:
          '<strong>Teckit</strong> started as a <strong>passion project</strong> between me and four friends who shared a deep interest in the <strong>event industry</strong>. We built a complete <strong>business dashboard</strong>, a <strong>client-side interface</strong>, and a <strong>mobile scanner app</strong> to verify tickets on-site.',
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
          'Real-time ticket verification',
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
        description:
          'With <strong>EarnIt</strong>, our goal was to build a <strong>client dashboard</strong> for <strong>international students</strong> to easily register themselves and log their <strong>working hours</strong>. We received the award for <strong>Best Project</strong> within the university.',
        technologies: [
          'React',
          'Java',
          'Spring Boot',
          'PostgreSQL',
          'Tailwind CSS',
          'Figma',
        ],
        features: [
          'Student registration',
          'Hour logging',
          'Automatic invoicing',
          'Role-based access',
        ],
        link: null,
      },
    },
    {
      title: 'Othello Game',
      image: '/projects/othello.png',
      description: 'Multiplayer board game with AI opponent',
      media: {
        type: 'image' as const,
        src: '/projects/othello.png',
        alt: 'Othello game board',
      },
      content: {
        description:
          'We developed a <strong>multiplayer</strong> version of <strong>Othello</strong> with our own <strong>custom protocol</strong> for sending packets, a <strong>handshake system</strong>, and a <strong>Minimax algorithm</strong> for the AI opponent.',
        technologies: ['Java', 'Java Socket', 'Minimax Algorithm'],
        features: [
          'AI opponent',
          'Custom network protocol',
          'Online multiplayer',
        ],
        link: null,
      },
    },
    {
      title: 'Iron Man Helmet',
      image: '/projects/iron-man-helmet.svg',
      description: '3D printed, motorized Iron Man helmet',
      media: {
        type: 'video' as const,
        src: '/projects/iron_man_video_working.mp4',
        alt: '3D printed Iron Man helmet',
      },
      content: {
        description:
          'During the <strong>COVID-19 lockdown</strong>, I built an <strong>Iron Man helmet</strong> from scratch. I 3D printed all parts, coded the <strong>electronics</strong> so the helmet opens on command.',
        technologies: [
          '3D Modeling',
          'Arduino',
          'C++',
          'LED Programming',
          '3D Printing',
        ],
        features: [
          'Motion-responsive',
          'Custom LED system',
          'Arduino-controlled',
        ],
        link: null,
      },
    },
    {
      title: 'Bird CRM',
      image: '/projects/bird.svg',
      description: 'Relationship management for University of Twente',
      media: {
        type: 'image' as const,
        src: '/projects/bird.svg',
        alt: 'Bird CRM',
      },
      content: {
        description:
          'A Relationship Management System for the University of Twente to help manage partnerships with external universities.',
        technologies: [
          'React',
          'TypeScript',
          'Next.js',
          'Tailwind CSS',
          'Figma',
        ],
        features: [
          'Contact tracking',
          'Relationship mapping',
          'Role-based access control',
        ],
        link: null,
      },
    },
  ];

  return (
    <div className='flex flex-col'>
      {/* Hero */}
      <section className='relative flex flex-col justify-center items-center h-screen overflow-hidden'>
        <div className='relative flex flex-col items-center text-center'>
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
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

          <motion.h1
            initial={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className='text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-black font-[family-name:var(--font-inter)] font-bold tracking-wider leading-none select-none'
          >
            DIRCK
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
            className='text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-black font-[family-name:var(--font-instrument-serif)] italic tracking-wider leading-none select-none'
          >
            MULDER
          </motion.h1>
        </div>

        <div className='mt-8'>
          <BlurText
            text='Designer & Developer'
            delay={0.08}
            className='text-lg sm:text-xl text-library-gray font-[family-name:var(--font-inter)] tracking-[0.3em] uppercase justify-center'
            animateBy='characters'
            direction='bottom'
          />
        </div>
      </section>

      {/* Selected Work - 3D perspective cards like hero carousel */}
      <section id='projects' className='py-32 overflow-hidden'>
        <div className='max-w-5xl mx-auto px-6 md:px-16 mb-16'>
          <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-inter)] font-bold text-black tracking-tight'>
            Selected{' '}
            <span className='font-[family-name:var(--font-instrument-serif)] italic font-normal'>
              Work
            </span>
          </h2>
        </div>

        <div
          className='w-full flex items-center overflow-hidden'
          style={{
            maskImage:
              'linear-gradient(to right, rgba(0,0,0,0) 0%, rgb(0,0,0) 10%, rgb(0,0,0) 90%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, rgba(0,0,0,0) 0%, rgb(0,0,0) 10%, rgb(0,0,0) 90%, rgba(0,0,0,0) 100%)',
          }}
        >
          <div className='flex items-center gap-0 justify-center w-full px-[5vw]'>
            {projects.map((project, _i) => (
              <figure
                key={project.title}
                className='shrink-0 relative cursor-pointer'
                onClick={() => handleProjectClick(project)}
                style={{
                  width: '240px',
                  height: '340px',
                  margin: '0',
                  transform: 'perspective(1143px) rotateY(-50deg) skewY(20deg)',
                  transition: 'opacity 0.3s ease, transform 0.4s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform =
                    'perspective(1143px) rotateY(-30deg) skewY(12deg) scale(1.08) translateY(-15px)';
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                  (e.currentTarget as HTMLElement).style.zIndex = '10';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform =
                    'perspective(1143px) rotateY(-50deg) skewY(20deg)';
                  (e.currentTarget as HTMLElement).style.opacity = '0.85';
                  (e.currentTarget as HTMLElement).style.zIndex = '0';
                }}
              >
                <div className='relative w-full h-full overflow-hidden bg-library-cream'>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className='object-contain p-8'
                  />
                  {/* Hover overlay with project info */}
                  <div className='absolute inset-0 bg-black/0 hover:bg-black/60 transition-colors duration-300 flex flex-col justify-end p-5 opacity-0 hover:opacity-100'>
                    <h3 className='text-white text-lg font-semibold'>
                      {project.title}
                    </h3>
                    <p className='text-white/60 text-xs mt-1'>
                      {project.description}
                    </p>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Experience - centered grid */}
      <section id='experience' className='py-32'>
        <div className='max-w-5xl mx-auto px-6 md:px-16'>
          <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-inter)] font-bold text-black tracking-tight mb-16'>
            My{' '}
            <span className='font-[family-name:var(--font-instrument-serif)] italic font-normal'>
              Experience
            </span>
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {[
              {
                title: 'Full-Stack Developer',
                company: 'Freelance',
                period: 'Jan 2023 - Present',
                desc: 'Building digital products for clients across Europe. From concept to deployment.',
              },
              {
                title: 'Co-Founder',
                company: 'Teckit',
                period: '2022 - 2024',
                desc: 'Built an all-in-one event management platform with a team of four.',
              },
              {
                title: 'Course Assistant',
                company: 'Co-Teach',
                period: 'Sep 2022 - Jun 2023',
                desc: 'Guided students through web development fundamentals at university.',
              },
              {
                title: 'Founder',
                company: 'MarineNet',
                period: '2020 - 2022',
                desc: 'Created a marketplace for marine equipment. My first real venture at 17.',
              },
            ].map((job, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className='group relative border border-library-border rounded-xl p-8 hover:border-black/20 transition-colors duration-300'
              >
                <div className='flex justify-between items-start mb-6'>
                  <p className='text-[10px] uppercase tracking-widest text-library-gray'>
                    {job.period}
                  </p>
                  <div className='w-2 h-2 rounded-full bg-library-border group-hover:bg-black transition-colors' />
                </div>
                <h3 className='text-xl font-[family-name:var(--font-instrument-serif)] italic text-black mb-1'>
                  {job.title}
                </h3>
                <p className='text-sm text-library-gray mb-4'>{job.company}</p>
                <p className='text-sm text-library-gray leading-relaxed'>
                  {job.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id='skills' className='py-32'>
        <div className='max-w-5xl mx-auto px-6 md:px-16 mb-16'>
          <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-inter)] font-bold text-black tracking-tight'>
            My{' '}
            <span className='font-[family-name:var(--font-instrument-serif)] italic font-normal'>
              Skills
            </span>
          </h2>
        </div>
        <div
          className='relative h-[300px] overflow-hidden'
          style={{
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
          }}
        >
          <div className='absolute inset-0 flex flex-col items-center animate-[skillScroll_20s_linear_infinite]'>
            {[
              'React',
              'TypeScript',
              'Next.js',
              'Tailwind CSS',
              'Node.js',
              'Figma',
              'React Native',
              'PostgreSQL',
              'Three.js',
              'Framer Motion',
              'Java',
              'Python',
              'Git',
              'Supabase',
              'REST APIs',
              'UI/UX Design',
              'React',
              'TypeScript',
              'Next.js',
              'Tailwind CSS',
              'Node.js',
              'Figma',
              'React Native',
              'PostgreSQL',
              'Three.js',
              'Framer Motion',
              'Java',
              'Python',
              'Git',
              'Supabase',
              'REST APIs',
              'UI/UX Design',
            ].map((skill, idx) => (
              <span
                key={idx}
                className='text-2xl md:text-4xl font-[family-name:var(--font-instrument-serif)] italic text-black/80 py-3 leading-relaxed'
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes skillScroll {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
        `}</style>
      </section>

      {/* About */}
      <section
        id='about'
        className='flex justify-center items-start px-6 md:px-16 py-32'
      >
        <div className='flex flex-col gap-12 max-w-5xl w-full'>
          <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-inter)] font-bold text-black tracking-tight'>
            About{' '}
            <span className='font-[family-name:var(--font-instrument-serif)] italic font-normal'>
              Me
            </span>
          </h2>

          <div
            ref={containerRef}
            className='flex flex-col md:flex-row gap-8 md:gap-16'
          >
            <div className='md:w-2/3'>
              <VariableProximity
                label="Hi, I'm Dirck. I've been creating things my whole life. When I was young, I got my first Arduino, and from that moment on, building and experimenting became my passion. I've always loved discovering new ideas, tools, and skills to unlock. At just 14 or 15, I started my first small business making recycled bracelets because I wanted to experience what it's like to make real business decisions and see an idea come to life. Right now, I'm finishing my bachelor's degree in Computer Science. Over the past few years, I've learned a lot, not only about technology, but also about problem-solving and persistence. The biggest lesson for me has been that with enough dedication, any problem can be solved. Sometimes the odds are against you, but it's up to you to turn that around. Now, I'm looking forward to new challenges that will help me grow, learn, and keep creating."
                className='variable-proximity-demo text-lg leading-relaxed'
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={containerRef as RefObject<HTMLElement>}
                radius={100}
                falloff='linear'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id='contact' className='py-32'>
        <div className='max-w-5xl mx-auto px-6 md:px-16 mb-12'>
          <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-inter)] font-bold text-black tracking-tight'>
            Get In{' '}
            <span className='font-[family-name:var(--font-instrument-serif)] italic font-normal'>
              Touch
            </span>
          </h2>
        </div>
        <ContactForm />
      </section>

      {/* Socials */}
      <section className='flex justify-center items-center w-full pb-32 px-10'>
        <div className='flex flex-row gap-16 items-center'>
          {[
            {
              href: 'https://www.linkedin.com/in/dirck-mulder-1b2716222/',
              src: '/socials/linkedin.png',
              alt: 'LinkedIn',
              size: 60,
            },
            {
              href: 'https://www.instagram.com/dirckmulder/',
              src: '/socials/instagram.png',
              alt: 'Instagram',
              size: 60,
            },
            {
              href: 'https://www.youtube.com/@DirckMulder',
              src: '/socials/youtube.png',
              alt: 'YouTube',
              size: 75,
            },
          ].map(social => (
            <Magnet key={social.alt} padding={60} magnetStrength={2}>
              <a
                href={social.href}
                target='_blank'
                rel='noopener noreferrer'
                className='block hover:scale-110 transition-transform duration-300'
              >
                <Image
                  src={social.src}
                  alt={social.alt}
                  width={social.size}
                  height={social.size}
                  style={{ filter: 'brightness(0)' }}
                />
              </a>
            </Magnet>
          ))}
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        project={selectedProject as Project}
      />
    </div>
  );
}
