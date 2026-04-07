'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingTime: string;
}

export default function BlogList({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = Array.from(new Set(posts.map(p => p.category))).sort();

  const filtered = activeCategory
    ? posts.filter(p => p.category === activeCategory)
    : posts;

  const [latest, ...rest] = filtered;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <div className='flex items-center gap-3 mb-12'>
        <div className='relative' ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs rounded-full uppercase tracking-wider transition-colors duration-200 ${
              activeCategory
                ? 'bg-gradient-primary text-white'
                : 'bg-transparent text-library-gray border border-library-border hover:border-primary/30'
            }`}
          >
            {activeCategory || 'Category'}
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className='absolute top-full left-0 mt-2 bg-white border border-library-border rounded-xl py-1 shadow-lg z-10 min-w-[180px]'>
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                  activeCategory === null
                    ? 'text-black font-medium'
                    : 'text-library-gray hover:text-black'
                }`}
              >
                All categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                    activeCategory === cat
                      ? 'text-black font-medium'
                      : 'text-library-gray hover:text-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeCategory && (
          <button
            onClick={() => setActiveCategory(null)}
            className='text-xs text-library-gray hover:text-black transition-colors'
          >
            Clear
          </button>
        )}
      </div>

      {!latest ? (
        <p className='text-library-gray'>No posts in this category.</p>
      ) : (
        <>
          <Link
            href={`/blog/${latest.slug}`}
            className='group no-underline block mb-16'
          >
            <div className='border border-library-border rounded-xl p-8 hover:shadow-lg transition-shadow duration-300'>
              <div className='flex items-center gap-3 mb-4'>
                <span className='text-xs bg-gradient-primary text-white px-2 py-1 rounded-full uppercase tracking-wider'>
                  Latest
                </span>
                <span className='text-xs text-library-gray uppercase tracking-wider'>
                  {latest.category}
                </span>
                <span className='text-library-border'>|</span>
                <time className='text-xs text-library-gray'>{latest.date}</time>
                <span className='text-library-border'>|</span>
                <span className='text-xs text-library-gray'>
                  {latest.readingTime}
                </span>
              </div>
              <h2 className='text-3xl font-[family-name:var(--font-instrument-serif)] text-black group-hover:underline underline-offset-4 decoration-primary/40 leading-tight'>
                {latest.title}
              </h2>
              <p className='text-library-gray mt-3 text-base leading-relaxed'>
                {latest.description}
              </p>
            </div>
          </Link>

          {rest.length > 0 && (
            <div className='flex flex-col'>
              <h2 className='text-lg font-[family-name:var(--font-instrument-serif)] mb-8 text-library-gray'>
                {activeCategory ? `${activeCategory} posts` : 'All posts'}
              </h2>
              {rest.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className='group no-underline py-5 border-b border-library-border first:pt-0 last:border-0'
                >
                  <div className='flex items-center gap-3 mb-1.5'>
                    <span className='text-xs text-library-gray uppercase tracking-wider'>
                      {post.category}
                    </span>
                    <span className='text-library-border'>|</span>
                    <time className='text-xs text-library-gray'>
                      {post.date}
                    </time>
                    <span className='text-library-border'>|</span>
                    <span className='text-xs text-library-gray'>
                      {post.readingTime}
                    </span>
                  </div>
                  <h3 className='text-lg font-[family-name:var(--font-instrument-serif)] text-black group-hover:underline underline-offset-4 decoration-primary/40'>
                    {post.title}
                  </h3>
                  <p className='text-sm text-library-gray mt-1'>
                    {post.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
