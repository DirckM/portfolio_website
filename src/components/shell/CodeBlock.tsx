'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className='relative rounded-lg bg-library-code overflow-hidden my-6'>
      <div className='flex items-center justify-between px-4 py-2 border-b border-white/10'>
        <span className='text-xs text-white/40 font-[family-name:var(--font-jetbrains-mono)]'>
          {language}
        </span>
        <button
          onClick={handleCopy}
          className='text-xs text-white/40 hover:text-white/80 transition-colors'
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className='p-4 overflow-x-auto'>
        <code className='text-sm text-white/90 font-[family-name:var(--font-jetbrains-mono)] leading-relaxed'>
          {code}
        </code>
      </pre>
    </div>
  );
}
