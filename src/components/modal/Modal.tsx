'use client';

import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
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
  };
}

const Modal = ({ isOpen, onClose, project }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm'>
      <div
        className='
          relative bg-white rounded-2xl shadow-2xl overflow-hidden
          w-[900px] max-w-[calc(100%-40px)] max-h-[calc(100vh-100px)]
          flex flex-col
        '
        data-lenis-prevent
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <h2 className='text-2xl font-semibold text-primary'>
            {project.title}
          </h2>
          <div className='flex items-center gap-3'>
            {project.content.link && (
              <a
                href={project.content.link}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors'
              >
                View Project
              </a>
            )}
            <button
              onClick={onClose}
              className='text-gray-500 hover:text-gray-800 transition'
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='overflow-y-auto'>
          {project.media.type === 'video' ? (
            /* Video Layout */
            <div className='space-y-6'>
              {/* Video Header */}
              <div className='w-full p-6'>
                <video
                  src={project.media.src}
                  controls
                  autoPlay
                  muted
                  loop
                  className='w-full h-[400px] object-cover'
                />
              </div>

              {/* Description */}
              <div className='px-6'>
                <p
                  className='text-lg text-gray-600 leading-relaxed'
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </div>

              {/* Two Column Layout */}
              <div className='px-6 grid md:grid-cols-2 gap-8'>
                {/* Left Column - About */}
                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold text-gray-900'>About</h3>
                  <p
                    className='text-sm text-gray-700 leading-relaxed'
                    dangerouslySetInnerHTML={{
                      __html: project.content.description,
                    }}
                  />
                </div>

                {/* Right Column - Features */}
                {project.content.features &&
                  project.content.features.length > 0 && (
                    <div className='space-y-2'>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        Features
                      </h3>
                      <ul className='space-y-1'>
                        {project.content.features.map((feature, index) => (
                          <li
                            key={index}
                            className='text-sm text-gray-700 flex items-start'
                          >
                            <span className='text-blue-500 mr-2'>•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              {/* Technologies */}
              {project.content.technologies &&
                project.content.technologies.length > 0 && (
                  <div className='px-6 py-4 space-y-3'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Technologies
                    </h3>
                    <div className='flex flex-wrap justify-start gap-2'>
                      {project.content.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className='px-3 py-2 bg-accent text-white text-sm rounded-full font-medium'
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            /* Image Layout */
            <div className='p-6'>
              <div className='grid md:grid-cols-2 gap-8'>
                {/* Left Column - Text Content */}
                <div className='flex flex-col space-y-6'>
                  {/* Description */}
                  <p
                    className='text-lg text-gray-600 leading-relaxed'
                    dangerouslySetInnerHTML={{ __html: project.description }}
                  />

                  {/* Features/Bullet Points */}
                  {project.content.features &&
                    project.content.features.length > 0 && (
                      <div className='space-y-2'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          Features
                        </h3>
                        <ul className='space-y-1'>
                          {project.content.features.map((feature, index) => (
                            <li
                              key={index}
                              className='text-sm text-gray-700 flex items-start'
                            >
                              <span className='text-accent mr-2'>•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Content Description */}
                  <div className='space-y-2'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      About
                    </h3>
                    <p
                      className='text-sm text-gray-700 leading-relaxed'
                      dangerouslySetInnerHTML={{
                        __html: project.content.description,
                      }}
                    />
                  </div>

                  {/* Technologies */}
                  {project.content.technologies &&
                    project.content.technologies.length > 0 && (
                      <div className='space-y-3'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          Technologies
                        </h3>
                        <div className='flex flex-wrap justify-start gap-2'>
                          {project.content.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className='px-3 py-2 bg-accent text-white text-sm rounded-full font-medium'
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Right Column - Image */}
                <div className='flex justify-center items-start'>
                  <Image
                    src={project.media.src}
                    alt={project.media.alt || project.title}
                    width={450}
                    height={300}
                    className='rounded-lg object-cover max-h-[500px] w-full shadow-xl'
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
