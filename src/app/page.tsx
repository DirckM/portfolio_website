'use client';

import Image from 'next/image';
import TiltedCard from '@/components/tilted-card/TiltedCard';
import { motion } from 'motion/react';
import ThreeDCarousel from '../components/CarouselThreeD/ThreeDCarousel';
import VariableProximity from '../components/proximity-text/ProximityText';
import ScrollStack, {
  ScrollStackItem,
} from '../components/scrollstack/ScrollStack';
import { div } from 'framer-motion/client';
import ImageTrail from '../components/image-trail/ImageTrail';
import ContactForm from '../components/ContactForm';
import Model3DCanvas from '../components/ThreeDObject';
import Carousel from '../components/Carousel';
import ProjectModal from '../components/ProjectModal';
import { RefObject, useRef, useState } from 'react';

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
      description:
        'A productivity app designed to help users wake up and start their day effectively.',
      media: {
        type: 'image' as const,
        src: '/projects/wakeup-not-rounded.svg',
        alt: 'Wakeup app interface',
      },
      content: {
        description:
          'Wakeup is a comprehensive productivity application built with React and Next.js. It features a clean, intuitive interface that helps users establish morning routines and track their daily habits. The app includes customizable alarms, habit tracking, and motivational features to improve morning productivity.',
        technologies: [
          'React',
          'Next.js',
          'TypeScript',
          'Tailwind CSS',
          'Framer Motion',
        ],
        features: [
          'Customizable morning routines',
          'Habit tracking and analytics',
          'Motivational quotes and tips',
          'Dark/light mode support',
          'Responsive design for all devices',
        ],
        link: 'https://github.com/yourusername/wakeup',
      },
    },
    {
      title: 'Teckit',
      image: '/projects/teckit.svg',
      description: 'A comprehensive toolkit application for developers.',
      media: {
        type: 'video' as const,
        src: '/projects/teckit_recording_one.mp4',
        alt: 'Teckit application demo',
      },
      content: {
        description:
          'Teckit is a developer-focused toolkit application that provides essential tools and utilities for software development. Built with modern web technologies, it offers a seamless experience for developers to access various coding tools, converters, and utilities in one place.',
        technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB'],
        features: [
          'Code formatters and validators',
          'API testing tools',
          'Data conversion utilities',
          'Real-time collaboration',
          'Custom tool creation',
        ],
        link: 'https://github.com/yourusername/teckit',
      },
    },
    {
      title: 'EarnIt',
      image: '/projects/earnit.svg',
      description:
        'A gamified learning platform that rewards users for completing educational content.',
      media: {
        type: 'image' as const,
        src: '/projects/earnit.svg',
        alt: 'EarnIt platform interface',
      },
      content: {
        description:
          'EarnIt transforms learning into an engaging, reward-based experience. Users earn points and badges for completing courses, quizzes, and challenges. The platform uses gamification principles to increase user engagement and learning retention.',
        technologies: ['React', 'Redux', 'Node.js', 'PostgreSQL', 'Stripe'],
        features: [
          'Gamified learning experience',
          'Point and badge system',
          'Progress tracking',
          'Social learning features',
          'Payment integration for premium content',
        ],
        link: 'https://github.com/yourusername/earnit',
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
        description:
          'A digital implementation of the classic Othello (Reversi) board game featuring an intelligent AI opponent. The game includes multiple difficulty levels, move validation, and a clean, intuitive interface. Built using vanilla JavaScript and HTML5 Canvas for smooth gameplay.',
        technologies: [
          'JavaScript',
          'HTML5 Canvas',
          'CSS3',
          'Minimax Algorithm',
        ],
        features: [
          'AI opponent with multiple difficulty levels',
          'Move validation and game rules enforcement',
          'Score tracking and game statistics',
          'Responsive design for mobile and desktop',
          'Local multiplayer support',
        ],
        link: 'https://github.com/yourusername/othello-game',
      },
    },
    {
      title: 'Iron Man Helmet',
      image: '/projects/iron-man-helmet.svg',
      description: 'A 3D printed Iron Man helmet with LED integration.',
      media: {
        type: 'image' as const,
        src: '/projects/iron-man-helmet.svg',
        alt: '3D printed Iron Man helmet',
      },
      content: {
        description:
          'A detailed recreation of the iconic Iron Man helmet using 3D printing technology. The project includes custom LED lighting systems, Arduino-based control circuits, and precise modeling to achieve screen-accurate proportions and details.',
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
        link: 'https://github.com/yourusername/iron-man-helmet',
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
              captionText={project.title}
              rotateAmplitude={12}
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

      {/* Experience section */}
      <section id='experience' className='w-full'>
        <ScrollStack useWindowScroll itemStackDistance={20}>
          {/* Freelance Frontend Developer */}
          <ScrollStackItem itemClassName='bg-gray-100'>
            <div className='flex flex-col md:flex-row gap-6 h-full'>
              <div className='flex flex-col justify-between md:w-1/3'>
                <div>
                  <h2 className='text-3xl font-bold mb-2'>
                    Full-Stack Developer
                  </h2>
                  <h3 className='text-xl font-medium opacity-90'>
                    Freelance • Remote
                  </h3>
                </div>
                <p className='text-sm opacity-80 mt-4'>Jan 2023 – Present</p>
              </div>

              <div className='md:w-2/3 space-y-4'>
                <p className='text-lg leading-relaxed'>
                  Working on freelance projects focused on creating engaging and
                  performant web experiences using React, Next.js, and Tailwind
                  CSS. Prioritizing clean design, accessibility, and
                  user-friendly interfaces.
                </p>

                <ul className='list-disc list-inside space-y-1 text-base opacity-95'>
                  <li>
                    Developed and deployed custom websites for clients and small
                    businesses.
                  </li>
                  <li>
                    Built reusable components and responsive layouts for dynamic
                    projects.
                  </li>
                  <li>
                    Handled both technical implementation and client
                    communication.
                  </li>
                </ul>
              </div>
              <div className='md:w-1/4'>
                <Image
                  src='/frontend.svg'
                  alt='Wakeup'
                  className='w-full h-full object-cover rounded-2xl'
                  width={300}
                  height={300}
                />
              </div>
            </div>
          </ScrollStackItem>

          {/* CTI Course Support */}
          <ScrollStackItem itemClassName='bg-gray-100'>
            <div className='flex flex-col md:flex-row gap-6 h-full'>
              <div className='flex flex-col justify-between md:w-1/3'>
                <div>
                  <h2 className='text-3xl font-bold mb-2'>
                    Course Assistant (IT Education)
                  </h2>
                  <h3 className='text-xl font-medium opacity-90'>
                    CTI • Utrecht, NL
                  </h3>
                </div>
                <p className='text-sm opacity-80 mt-4'>Sep 2022 – Jun 2023</p>
              </div>

              <div className='md:w-2/3 space-y-4'>
                <p className='text-lg leading-relaxed'>
                  Supported IT courses for high school students by creating
                  exercises, grading assignments, and helping students
                  understand core computing concepts.
                </p>

                <ul className='list-disc list-inside space-y-1 text-base opacity-95'>
                  <li>
                    Designed and tested programming exercises and digital
                    projects.
                  </li>
                  <li>
                    Reviewed and graded student work, giving constructive
                    feedback.
                  </li>
                  <li>
                    Encouraged curiosity and problem-solving in technology
                    learning.
                  </li>
                </ul>
              </div>
              <div className='md:w-1/4'>
                <Image
                  src='/cti-vaksteunpunt.svg'
                  alt='Wakeup'
                  className='w-full h-full object-cover rounded-2xl'
                  width={300}
                  height={300}
                />
              </div>
            </div>
          </ScrollStackItem>

          {/* Bracelet Business */}
          <ScrollStackItem itemClassName='bg-gray-100'>
            <div className='flex flex-col md:flex-row gap-6 h-full'>
              <div className='flex flex-col justify-between md:w-1/3'>
                <div>
                  <h2 className='text-3xl font-bold mb-2'>Founder & Owner</h2>
                  <h3 className='text-xl font-medium opacity-90'>
                    Ocean Bracelets
                  </h3>
                </div>
                <p className='text-sm opacity-80 mt-4'>2020 – 2022</p>
              </div>

              <div className='md:w-2/3 space-y-4'>
                <p className='text-lg leading-relaxed'>
                  Founded a small business selling handmade bracelets made from
                  recycled fishing nets, promoting sustainability and
                  craftsmanship through both online and local retail.
                </p>

                <ul className='list-disc list-inside space-y-1 text-base opacity-95'>
                  <li>
                    Designed and crafted eco-friendly bracelets using upcycled
                    materials.
                  </li>
                  <li>
                    Sold products through online platforms and local stores.
                  </li>
                  <li>
                    Managed marketing, logistics, and client communication
                    independently.
                  </li>
                </ul>
              </div>
              <div className='md:w-1/4'>
                <Image
                  src='/marinenet.svg'
                  alt='Wakeup'
                  className='w-full h-full object-cover rounded-2xl'
                  width={300}
                  height={300}
                />
              </div>
            </div>
          </ScrollStackItem>

          {/* Restaurant Work */}
          <ScrollStackItem itemClassName='bg-gray-100'>
            <div className='flex flex-col md:flex-row gap-6 h-full'>
              <div className='flex flex-col justify-between md:w-1/3'>
                <div>
                  <h2 className='text-3xl font-bold mb-2'>Service Staff</h2>
                  <h3 className='text-xl font-medium opacity-90'>
                    Restaurant De Haven
                  </h3>
                </div>
                <p className='text-sm opacity-80 mt-4'>2019 – 2021</p>
              </div>

              <div className='md:w-2/3 space-y-4'>
                <p className='text-lg leading-relaxed'>
                  Worked in a small restaurant environment, providing customer
                  service, taking orders, and coordinating with kitchen staff to
                  ensure a great dining experience.
                </p>

                <ul className='list-disc list-inside space-y-1 text-base opacity-95'>
                  <li>
                    Developed strong communication and multitasking skills.
                  </li>
                  <li>
                    Maintained a professional and friendly atmosphere for
                    guests.
                  </li>
                  <li>Learned teamwork and responsibility under pressure.</li>
                </ul>
              </div>
              <div className='md:w-1/4'>
                <Image
                  src='/lekker_aan_de_haven.svg'
                  alt='Wakeup'
                  className='w-full rounded-2xl h-full object-cover'
                  width={300}
                  height={300}
                />
              </div>
            </div>
          </ScrollStackItem>
        </ScrollStack>
      </section>
      {/* Skills section with 3D model carousel */}
      <section id='skills' className='w-full'>
        <div className='w-full mx-auto'>
          <Carousel className='h-64' />
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
        className='flex justify-center items-start px-20 py-10'
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
      {/* Music section */}
      <section>Th</section>

      {/* Contact Form */}
      <ContactForm />

      <section
        id='socials'
        className='flex justify-center items-center w-full pb-20'
      >
        <div className='flex flex-col md:flex-row gap-20 justify-around items-center'>
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
      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        project={selectedProject}
      />
    </div>
  );
}
