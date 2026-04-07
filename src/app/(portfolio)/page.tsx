'use client';

import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from 'motion/react';
import VariableProximity from '@/components/proximity-text/ProximityText';
import ContactForm from '@/components/ContactForm';
import Modal from '@/components/modal/Modal';
import { RefObject, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import BlurText from '@/components/library/text-animations/BlurText';
import Magnet from '@/components/library/animations/Magnet';
import ScrollVelocity from '@/components/library/text-animations/ScrollVelocity';
import Folder from '@/components/library/components/Folder';

interface LatestPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingTime: string;
}

interface Project {
  title: string;
  description: string;
  image: string;
  cardBg: string;
  cardTextColor: string;
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
  const [selectedJob, setSelectedJob] = useState<
    (typeof experienceData)[0] | null
  >(null);
  const [latestPosts, setLatestPosts] = useState<LatestPost[]>([]);
  const folderRef = useRef<HTMLDivElement>(null);
  const [folderMounted, setFolderMounted] = useState(false);
  useEffect(() => {
    if (folderRef.current) setFolderMounted(true);
  }, [latestPosts]);
  const { scrollYProgress } = useScroll({
    target: folderMounted ? folderRef : undefined,
    offset: ['start end', 'center center'],
  });
  const folderProgress = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);
  const [scrollProgress, setScrollProgress] = useState(0);
  useMotionValueEvent(folderProgress, 'change', v => {
    setScrollProgress(Math.max(0, Math.min(1, v)));
  });

  const experienceData = [
    {
      title: 'Full-Stack Developer',
      company: 'Freelance',
      period: 'Jan 2023 - Present',
      desc: 'Building digital products for clients across Europe. From concept to deployment.',
      fullDesc:
        'Working as a freelance full-stack developer, I build digital products for clients across Europe. This ranges from web applications and mobile apps to complete design systems. I handle the entire process from initial concept and design through development and deployment. Working directly with clients has taught me how to translate business needs into technical solutions.',
      skills: [
        'React',
        'Next.js',
        'TypeScript',
        'Tailwind CSS',
        'Figma',
        'Node.js',
      ],
    },
    {
      title: 'Co-Founder',
      company: 'Teckit',
      period: '2022 - 2024',
      desc: 'Built an all-in-one event management platform with a team of four.',
      fullDesc:
        'Co-founded Teckit with four friends who shared a passion for the event industry. We built a complete business dashboard, a client-side interface, and a mobile scanner app for on-site ticket verification. After two years of full-time work, we decided not to launch due to heavy market competition. This experience was invaluable and marked the beginning of my journey into frontend development and product design.',
      skills: ['React', 'Next.js', 'NestJS', 'React Native', 'Prisma', 'Figma'],
    },
    {
      title: 'Course Assistant',
      company: 'Co-Teach',
      period: 'Sep 2022 - Jun 2023',
      desc: 'Guided students through web development fundamentals at university.',
      fullDesc:
        'As a course assistant at the University of Twente, I helped guide students through web development fundamentals. This included reviewing code, explaining concepts, and helping debug issues. Teaching others solidified my own understanding and improved my ability to communicate technical ideas clearly.',
      skills: ['JavaScript', 'HTML/CSS', 'React', 'Teaching'],
    },
    {
      title: 'Founder',
      company: 'MarineNet',
      period: '2020 - 2022',
      desc: 'Made bracelets from recycled fishing nets and sold them in 6 shops. My first real venture at 16.',
      fullDesc:
        'At 16, I started MarineNet, a small business making bracelets from recycled fishing nets. I did everything myself, from designing and crafting the bracelets to getting them into 6 local shops. This was my first real business venture and taught me the fundamentals of entrepreneurship, customer validation, and building something from scratch.',
      skills: ['Entrepreneurship', 'Sales', 'Marketing', 'Product Design'],
    },
  ];

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  useEffect(() => {
    fetch('/api/latest-blog-post')
      .then(res => res.json())
      .then(data => setLatestPosts(data))
      .catch(() => {});
  }, []);

  // ESC key closes experience modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedJob(null);
    };
    if (selectedJob) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [selectedJob]);

  const projects: Project[] = [
    {
      title: 'Wakeup',
      image: '/projects/wakeup-not-rounded.svg',
      cardBg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      cardTextColor: '#ffffff',
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
      cardBg: 'linear-gradient(135deg, #0f0f0f 0%, #2d2d2d 100%)',
      cardTextColor: '#ffffff',
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
      cardBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardTextColor: '#ffffff',
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
      cardBg: 'linear-gradient(135deg, #2d3436 0%, #000000 100%)',
      cardTextColor: '#ffffff',
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
      cardBg: 'linear-gradient(135deg, #b71c1c 0%, #880e0e 100%)',
      cardTextColor: '#ffffff',
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
      cardBg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      cardTextColor: '#000000',
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
    {
      title: 'Cash Out',
      image: '/projects/cashout.svg',
      cardBg: 'linear-gradient(135deg, #0a8f08 0%, #064e06 100%)',
      cardTextColor: '#ffffff',
      description: 'Ghost betting app to fight gambling addiction',
      media: {
        type: 'image' as const,
        src: '/projects/cashout.svg',
        alt: 'Cash Out app',
      },
      content: {
        description:
          '<strong>Cash Out</strong> tackles gambling addiction from a completely different angle. Instead of blocking access like traditional systems, it lets people experience the <strong>thrill of betting without real money</strong>. We call it <strong>Ghost Betting</strong>: you predict, feel the tension, see the outcome, but never risk a cent.',
        technologies: [
          'Next.js',
          'TypeScript',
          'Three.js',
          'React Three Fiber',
          'Tailwind CSS',
          'Vitest',
        ],
        features: [
          'Ghost betting without real money',
          'Behavioral insight tracking',
          'Gamified self-control rewards',
        ],
        link: null,
      },
    },
    {
      title: 'Content Engine',
      image: '/projects/content-engine.svg',
      cardBg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      cardTextColor: '#000000',
      description: 'AI-driven content synthesis and video assembly SaaS',
      media: {
        type: 'image' as const,
        src: '/projects/content-engine.svg',
        alt: 'Content Engine',
      },
      content: {
        description:
          'An <strong>AI-driven content synthesis</strong> platform: feed it videos, it transcribes and indexes them, then you can spar with AI to generate new scripts and assemble videos programmatically. Built with a <strong>microservice architecture</strong>.',
        technologies: [
          'Next.js',
          'Python',
          'FastAPI',
          'LangChain',
          'Remotion',
          'Whisper AI',
        ],
        features: [
          'Video ingestion and transcription',
          'AI script generation',
          'Programmatic video assembly',
        ],
        link: null,
      },
    },
    {
      title: 'Financial Overview',
      image: '/projects/financial-overview.svg',
      cardBg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
      cardTextColor: '#000000',
      description: 'Bank transaction analyzer and categorizer',
      media: {
        type: 'image' as const,
        src: '/projects/financial-overview.svg',
        alt: 'Financial Overview',
      },
      content: {
        description:
          'A tool for analyzing and categorizing <strong>Dutch bank CSV exports</strong>. Upload your Rabobank transactions and get automatic categorization, AI-powered suggestions, and visual dashboards of your spending.',
        technologies: [
          'Next.js',
          'TypeScript',
          'Tailwind CSS',
          'Chart.js',
          'AI categorization',
        ],
        features: [
          'CSV upload and parsing',
          'Auto-categorization',
          'Spending visualizations',
          'AI suggestions',
        ],
        link: null,
      },
    },
    {
      title: 'AI Learner',
      image: '/projects/ai-learner.svg',
      cardBg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      cardTextColor: '#000000',
      description: 'Personalized AI-powered learning platform',
      media: {
        type: 'image' as const,
        src: '/projects/ai-learner.svg',
        alt: 'AI Learner',
      },
      content: {
        description:
          'A <strong>personalized learning platform</strong> powered by AI. Students get adaptive content, progress tracking, and an onboarding flow that tailors the experience to their learning style and goals.',
        technologies: [
          'Next.js',
          'TypeScript',
          'Tailwind CSS',
          'Supabase',
          'AI/ML',
        ],
        features: [
          'Adaptive learning paths',
          'Progress tracking',
          'Personalized onboarding',
          'Admin dashboard',
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

      {/* Selected Work - auto-scrolling 3D carousel */}
      <section id='projects' className='py-32 overflow-x-clip'>
        <div className='max-w-5xl mx-auto px-6 md:px-16 mb-16'>
          <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-inter)] font-bold text-black tracking-tight'>
            Selected{' '}
            <span className='font-[family-name:var(--font-instrument-serif)] italic font-normal text-gradient-primary'>
              Work
            </span>
          </h2>
        </div>

        <div
          className='w-full flex items-center overflow-hidden h-[420px] py-8'
          style={{
            maskImage:
              'linear-gradient(to right, rgba(0,0,0,0) 0%, rgb(0,0,0) 12.5%, rgb(0,0,0) 87.5%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, rgba(0,0,0,0) 0%, rgb(0,0,0) 12.5%, rgb(0,0,0) 87.5%, rgba(0,0,0,0) 100%)',
          }}
        >
          <div
            className='flex items-center gap-0 select-none'
            style={{
              animation: `projectScroll ${projects.length * 6}s linear infinite`,
              width: 'fit-content',
            }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLElement).style.animationPlayState =
                'paused')
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLElement).style.animationPlayState =
                'running')
            }
          >
            {[...projects, ...projects].map((project, idx) => (
              <figure
                key={`${project.title}-${idx}`}
                className='shrink-0 relative cursor-pointer group'
                onClick={() => handleProjectClick(project)}
                style={{
                  width: '250px',
                  height: '340px',
                  margin: '0',
                  transform: 'perspective(1143px) rotateY(-50deg) skewY(20deg)',
                  opacity: 0.85,
                  transition: 'opacity 0.3s ease, transform 0.4s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform =
                    'perspective(1143px) rotateY(-30deg) skewY(12deg) scale(1.08) translateY(-15px)';
                  el.style.opacity = '1';
                  el.style.zIndex = '10';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform =
                    'perspective(1143px) rotateY(-50deg) skewY(20deg)';
                  el.style.opacity = '0.85';
                  el.style.zIndex = '0';
                }}
              >
                <div className='relative w-full h-full overflow-hidden bg-library-cream'>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className='object-contain p-6'
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes projectScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* Experience - centered grid with clickable cards */}
      <section id='experience' className='py-32'>
        <div className='max-w-5xl mx-auto px-6 md:px-16'>
          <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-inter)] font-bold text-black tracking-tight mb-16'>
            My{' '}
            <span className='font-[family-name:var(--font-instrument-serif)] italic font-normal text-gradient-primary'>
              Experience
            </span>
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {experienceData.map((job, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onClick={() => setSelectedJob(job)}
                className='group relative border border-library-border rounded-xl p-8 hover:border-primary/30 transition-colors duration-300 cursor-pointer'
              >
                <div className='flex justify-between items-start mb-6'>
                  <p className='text-[10px] uppercase tracking-widest text-library-gray'>
                    {job.period}
                  </p>
                  <svg
                    className='w-4 h-4 text-library-gray group-hover:text-black transition-colors'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
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

        {/* Experience Modal */}
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center px-6'
            onClick={() => setSelectedJob(null)}
          >
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className='relative bg-white rounded-xl max-w-lg w-full p-10 shadow-2xl'
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedJob(null)}
                className='absolute top-4 right-4 text-library-gray hover:text-black transition-colors'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
              <p className='text-[10px] uppercase tracking-widest text-library-gray mb-4'>
                {selectedJob.period}
              </p>
              <h3 className='text-2xl font-[family-name:var(--font-instrument-serif)] italic text-black mb-1'>
                {selectedJob.title}
              </h3>
              <p className='text-sm text-library-gray mb-6'>
                {selectedJob.company}
              </p>
              <p className='text-sm text-black/80 leading-relaxed mb-8'>
                {selectedJob.fullDesc}
              </p>
              <div className='flex flex-wrap gap-2'>
                {selectedJob.skills.map(skill => (
                  <span
                    key={skill}
                    className='px-3 py-1 text-xs bg-black text-white rounded-full'
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* Skills - Scroll Velocity Marquee */}
      <section id='skills' className='py-32 overflow-clip'>
        <div className='max-w-5xl mx-auto px-6 md:px-16 mb-16'>
          <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-inter)] font-bold text-black tracking-tight'>
            My{' '}
            <span className='font-[family-name:var(--font-instrument-serif)] italic font-normal text-gradient-primary'>
              Skills
            </span>
          </h2>
        </div>
        <ScrollVelocity
          texts={[
            'React  ·  TypeScript  ·  Next.js  ·  Tailwind CSS  ·  Node.js  ·  Figma  ·  React Native  ·  PostgreSQL',
          ]}
          velocity={5}
          className='font-[family-name:var(--font-instrument-serif)] italic text-black/80 leading-[1.3] py-2'
          numCopies={4}
        />
        <div className='mt-2'>
          <ScrollVelocity
            texts={[
              'Three.js  ·  Framer Motion  ·  Java  ·  Python  ·  Git  ·  Supabase  ·  REST APIs  ·  UI/UX Design',
            ]}
            velocity={-5}
            className='font-[family-name:var(--font-instrument-serif)] italic text-black/80 leading-[1.3] py-2'
            numCopies={4}
          />
        </div>
      </section>

      {/* Latest Blog Posts */}
      {latestPosts.length > 0 && (
        <section id='blog' className='py-32'>
          <div className='max-w-5xl mx-auto px-6 md:px-16'>
            <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-inter)] font-bold text-black tracking-tight mb-16 text-center'>
              Latest{' '}
              <span className='font-[family-name:var(--font-instrument-serif)] italic font-normal text-gradient-primary'>
                Posts
              </span>
            </h2>

            <div className='flex flex-col items-center'>
              <div ref={folderRef} className='py-20'>
                <Folder
                  color='#000000'
                  size={3}
                  progress={scrollProgress}
                  items={latestPosts.map(post => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      onClick={e => e.stopPropagation()}
                      className='no-underline w-full h-full flex flex-col justify-between p-[10px] overflow-hidden'
                    >
                      <div>
                        <p className='text-[6px] uppercase tracking-widest text-library-gray leading-none m-0'>
                          {post.category}
                        </p>
                        <p className='text-[8px] font-[family-name:var(--font-instrument-serif)] italic text-black leading-tight mt-[4px] m-0 line-clamp-2'>
                          {post.title}
                        </p>
                      </div>
                      <p className='text-[5px] text-library-gray m-0'>
                        {post.date}
                      </p>
                    </Link>
                  ))}
                />
              </div>

              <Link
                href='/blog'
                className='group inline-flex items-center gap-2 text-sm text-black no-underline mt-4 hover:gap-3 transition-all duration-300'
              >
                View all posts
                <svg
                  className='w-4 h-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M17 8l4 4m0 0l-4 4m4-4H3'
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section id='about' className='py-32'>
        <div className='max-w-5xl mx-auto px-6 md:px-16'>
          <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-inter)] font-bold text-black tracking-tight mb-12'>
            About{' '}
            <span className='font-[family-name:var(--font-instrument-serif)] italic font-normal text-gradient-primary'>
              Me
            </span>
          </h2>

          <div ref={containerRef} className='max-w-3xl'>
            <VariableProximity
              label="Hi, I'm Dirck. I've been creating things my whole life. When I was young, I got my first Arduino, and from that moment on, building and experimenting became my passion. I've always loved discovering new ideas, tools, and skills to unlock. At just 16, I started my first small business making bracelets from recycled fishing nets because I wanted to experience what it's like to make real business decisions and see an idea come to life. Right now, I'm finishing my bachelor's degree in Computer Science. Over the past few years, I've learned a lot, not only about technology, but also about problem-solving and persistence. The biggest lesson for me has been that with enough dedication, any problem can be solved. Sometimes the odds are against you, but it's up to you to turn that around. Now, I'm looking forward to new challenges that will help me grow, learn, and keep creating."
              className='variable-proximity-demo text-lg leading-relaxed'
              fromFontVariationSettings="'wght' 400, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              containerRef={containerRef as RefObject<HTMLElement>}
              radius={100}
              falloff='linear'
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id='contact' className='py-32'>
        <div className='max-w-5xl mx-auto px-6 md:px-16 mb-12'>
          <h2 className='text-3xl md:text-4xl font-[family-name:var(--font-inter)] font-bold text-black tracking-tight'>
            Get In{' '}
            <span className='font-[family-name:var(--font-instrument-serif)] italic font-normal text-gradient-primary'>
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
