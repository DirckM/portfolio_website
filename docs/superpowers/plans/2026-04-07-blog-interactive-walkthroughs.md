# Blog Interactive Walkthroughs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add syntax-highlighted code blocks to all blog posts and build an interactive LiveStep playground component for 4 pilot walkthrough posts.

**Architecture:** Shiki runs server-side at build time for static code highlighting (zero client JS). react-live powers the interactive LiveStep playground (client component). A PropControls component renders color/slider/select/toggle inputs that update the live code. Four blog posts are rewritten as step-by-step walkthroughs.

**Tech Stack:** shiki (syntax highlighting), react-live (live code editor + preview), Next.js 15 with MDXRemote RSC, Tailwind CSS

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/lib/shiki.ts` | Create and cache shiki highlighter instance |
| `src/components/shell/CodeBlock.tsx` | Modify: accept highlighted HTML, render dark-bg code block with copy button |
| `src/components/shell/LiveStep.tsx` | Create: interactive code editor + live preview + prop controls |
| `src/components/shell/PropControls.tsx` | Create: renders control inputs (color, slider, select, toggle) from config |
| `src/app/(library)/blog/[slug]/page.tsx` | Modify: add `pre`/`code` to mdxComponents, add LiveStep + component scope |
| `src/content/blog/blur-text.mdx` | Rewrite: walkthrough with LiveStep stages |
| `src/content/blog/tilted-card.mdx` | Rewrite: walkthrough with LiveStep stages |
| `src/content/blog/electric-border.mdx` | Rewrite: walkthrough with LiveStep stages |
| `src/content/blog/line-waves.mdx` | Rewrite: walkthrough with LiveStep stages |

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install shiki and react-live**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && pnpm add shiki react-live
```

- [ ] **Step 2: Verify installation**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && node -e "require('shiki'); require('react-live'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add package.json pnpm-lock.yaml
git commit -m "Add shiki and react-live dependencies"
```

---

### Task 2: Shiki highlighter utility

**Files:**
- Create: `src/lib/shiki.ts`

- [ ] **Step 1: Create the shiki highlighter module**

This module creates a cached shiki highlighter instance for server-side use. It uses the `one-dark-pro` theme to match a code-editor look.

```ts
import { createHighlighter, type Highlighter } from 'shiki';

let highlighter: Highlighter | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['one-dark-pro'],
      langs: ['tsx', 'typescript', 'bash', 'css', 'json', 'html'],
    });
  }
  return highlighter;
}

export async function highlightCode(
  code: string,
  lang: string = 'tsx'
): Promise<string> {
  const hl = await getHighlighter();
  const supportedLangs = hl.getLoadedLanguages();
  const language = supportedLangs.includes(lang as any) ? lang : 'tsx';
  return hl.codeToHtml(code, {
    lang: language,
    theme: 'one-dark-pro',
  });
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/lib/shiki.ts
git commit -m "Add shiki highlighter utility with one-dark-pro theme"
```

---

### Task 3: Upgrade CodeBlock to support highlighted HTML

**Files:**
- Modify: `src/components/shell/CodeBlock.tsx`

- [ ] **Step 1: Rewrite CodeBlock to accept highlighted HTML**

Replace the entire file. The new version accepts either a `code` string (plain text, for copy button) and `highlightedHtml` (shiki output), or just `code` for fallback rendering.

```tsx
'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  highlightedHtml?: string;
}

export default function CodeBlock({
  code,
  language = 'tsx',
  highlightedHtml,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className='relative rounded-lg bg-[#282c34] overflow-hidden my-6'>
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
      {highlightedHtml ? (
        <div
          className='p-4 overflow-x-auto text-sm leading-relaxed [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!text-sm [&_code]:font-[family-name:var(--font-jetbrains-mono)]'
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre className='p-4 overflow-x-auto'>
          <code className='text-sm text-white/90 font-[family-name:var(--font-jetbrains-mono)] leading-relaxed'>
            {code}
          </code>
        </pre>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build compiles**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/components/shell/CodeBlock.tsx
git commit -m "Upgrade CodeBlock to render shiki-highlighted HTML"
```

---

### Task 4: Wire shiki into MDX code blocks

**Files:**
- Modify: `src/app/(library)/blog/[slug]/page.tsx`

- [ ] **Step 1: Add highlighted pre/code components to mdxComponents**

The blog page uses `MDXRemote` from `next-mdx-remote/rsc` which is an async server component. We can call the async `highlightCode` function directly in the component.

However, since `mdxComponents` can't be async functions directly, we need a server component wrapper for `pre`. Create a `HighlightedPre` server component inline and add it to `mdxComponents`.

Replace the entire file content:

```tsx
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllBlogPosts, getBlogPost } from '@/lib/blog-utils';
import { highlightCode } from '@/lib/shiki';
import BlogPostLayout from '@/components/shell/BlogPostLayout';
import CodeBlock from '@/components/shell/CodeBlock';

import { fullDemos } from '@/lib/component-previews';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: 'Not Found' };

  return {
    title: `${post.title} | Dirck Mulder`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

async function HighlightedPre({
  children,
  ...props
}: React.HTMLAttributes<HTMLPreElement> & { children?: React.ReactNode }) {
  const codeElement = children as React.ReactElement<{
    className?: string;
    children?: string;
  }>;

  if (!codeElement?.props) {
    return <pre {...props}>{children}</pre>;
  }

  const className = codeElement.props.className || '';
  const lang = className.replace('language-', '') || 'tsx';
  const code = typeof codeElement.props.children === 'string'
    ? codeElement.props.children.trim()
    : '';

  if (!code) {
    return <pre {...props}>{children}</pre>;
  }

  const highlightedHtml = await highlightCode(code, lang);

  return <CodeBlock code={code} language={lang} highlightedHtml={highlightedHtml} />;
}

const mdxComponents = {
  pre: HighlightedPre,
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className='text-2xl font-[family-name:var(--font-instrument-serif)] mt-12 mb-4'>
      {children}
    </h2>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className='text-black/80 leading-relaxed mb-4'>{children}</p>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className='text-black/80 leading-relaxed'>{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className='font-semibold text-black'>{children}</strong>
  ),
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className='pt-32 text-center'>
        <h1 className='text-2xl font-[family-name:var(--font-instrument-serif)]'>
          Post not found
        </h1>
      </div>
    );
  }

  return (
    <BlogPostLayout post={post} demo={fullDemos[post.componentSlug]}>
      <MDXRemote source={post.content} components={mdxComponents} />
    </BlogPostLayout>
  );
}
```

- [ ] **Step 2: Build and verify code blocks are highlighted**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -10
```

Expected: Build succeeds. All blog pages generate without errors.

- [ ] **Step 3: Start dev server and spot-check**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next dev
```

Visit `/blog/blur-text` in browser. Code blocks should have dark background (#282c34) with colored syntax highlighting, language label, and copy button.

- [ ] **Step 4: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/app/\(library\)/blog/\[slug\]/page.tsx
git commit -m "Wire shiki syntax highlighting into MDX code blocks"
```

---

### Task 5: PropControls component

**Files:**
- Create: `src/components/shell/PropControls.tsx`

- [ ] **Step 1: Create PropControls**

This component renders a row of controls from a config array. Each control updates a value and calls `onChange` with the full values map.

```tsx
'use client';

import { useState, useCallback } from 'react';

export interface ControlConfig {
  prop: string;
  label?: string;
  type: 'color' | 'slider' | 'select' | 'toggle';
  default: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

interface PropControlsProps {
  controls: ControlConfig[];
  values: Record<string, string | number | boolean>;
  onChange: (prop: string, value: string | number | boolean) => void;
}

export default function PropControls({
  controls,
  values,
  onChange,
}: PropControlsProps) {
  return (
    <div className='flex flex-wrap gap-4 px-4 py-3 bg-[#1e1e1e] border-t border-white/10 rounded-b-lg'>
      {controls.map(ctrl => (
        <div key={ctrl.prop} className='flex items-center gap-2'>
          <label className='text-xs text-white/50 font-[family-name:var(--font-jetbrains-mono)]'>
            {ctrl.label || ctrl.prop}
          </label>
          {ctrl.type === 'color' && (
            <input
              type='color'
              value={values[ctrl.prop] as string}
              onChange={e => onChange(ctrl.prop, e.target.value)}
              className='w-7 h-7 rounded border border-white/20 bg-transparent cursor-pointer'
            />
          )}
          {ctrl.type === 'slider' && (
            <div className='flex items-center gap-2'>
              <input
                type='range'
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                value={values[ctrl.prop] as number}
                onChange={e => onChange(ctrl.prop, parseFloat(e.target.value))}
                className='w-24 accent-[#5227FF]'
              />
              <span className='text-xs text-white/40 font-[family-name:var(--font-jetbrains-mono)] w-10'>
                {values[ctrl.prop]}
              </span>
            </div>
          )}
          {ctrl.type === 'select' && (
            <select
              value={values[ctrl.prop] as string}
              onChange={e => onChange(ctrl.prop, e.target.value)}
              className='text-xs bg-[#2d2d2d] text-white/80 border border-white/20 rounded px-2 py-1 font-[family-name:var(--font-jetbrains-mono)]'
            >
              {ctrl.options?.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
          {ctrl.type === 'toggle' && (
            <button
              onClick={() => onChange(ctrl.prop, !values[ctrl.prop])}
              className={`w-9 h-5 rounded-full transition-colors ${
                values[ctrl.prop] ? 'bg-[#5227FF]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  values[ctrl.prop] ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/components/shell/PropControls.tsx
git commit -m "Add PropControls component for interactive playground inputs"
```

---

### Task 6: LiveStep playground component

**Files:**
- Create: `src/components/shell/LiveStep.tsx`

- [ ] **Step 1: Create LiveStep**

This is the interactive playground component. It uses react-live for editable code + live preview, and PropControls for the interactive inputs.

```tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import PropControls, { type ControlConfig } from './PropControls';

interface LiveStepProps {
  code: string;
  scope?: Record<string, any>;
  controls?: ControlConfig[];
  previewClassName?: string;
  previewBg?: string;
}

function updateCodeWithValues(
  code: string,
  values: Record<string, string | number | boolean>
): string {
  let updated = code;
  for (const [prop, value] of Object.entries(values)) {
    if (typeof value === 'string') {
      const regex = new RegExp(`${prop}=\\{?["'][^"']*["']\\}?`, 'g');
      updated = updated.replace(regex, `${prop}="${value}"`);
      const regex2 = new RegExp(`${prop}="[^"]*"`, 'g');
      updated = updated.replace(regex2, `${prop}="${value}"`);
    } else if (typeof value === 'number') {
      const regex = new RegExp(`${prop}=\\{[^}]*\\}`, 'g');
      updated = updated.replace(regex, `${prop}={${value}}`);
    } else if (typeof value === 'boolean') {
      const regex = new RegExp(`${prop}=\\{[^}]*\\}`, 'g');
      updated = updated.replace(regex, `${prop}={${value}}`);
    }
  }
  return updated;
}

export default function LiveStep({
  code: initialCode,
  scope = {},
  controls = [],
  previewClassName = '',
  previewBg = 'bg-library-cream',
}: LiveStepProps) {
  const defaultValues = useMemo(() => {
    const vals: Record<string, string | number | boolean> = {};
    controls.forEach(c => {
      vals[c.prop] = c.default;
    });
    return vals;
  }, [controls]);

  const [controlValues, setControlValues] = useState(defaultValues);
  const [code, setCode] = useState(initialCode.trim());

  const handleControlChange = useCallback(
    (prop: string, value: string | number | boolean) => {
      setControlValues(prev => {
        const next = { ...prev, [prop]: value };
        setCode(prevCode => updateCodeWithValues(prevCode, { [prop]: value }));
        return next;
      });
    },
    []
  );

  return (
    <div className='my-8 rounded-lg overflow-hidden border border-white/10'>
      <LiveProvider code={code} scope={scope} noInline={false}>
        <div className='grid grid-cols-1 lg:grid-cols-2'>
          <div className='bg-[#282c34] overflow-auto max-h-[400px]'>
            <div className='px-4 py-2 border-b border-white/10'>
              <span className='text-xs text-white/40 font-[family-name:var(--font-jetbrains-mono)]'>
                Editable
              </span>
            </div>
            <LiveEditor
              className='!font-[family-name:var(--font-jetbrains-mono)] !text-sm !leading-relaxed'
              style={{
                fontFamily: 'var(--font-jetbrains-mono)',
                fontSize: '0.875rem',
                lineHeight: '1.625',
                background: 'transparent',
              }}
              onChange={setCode}
            />
          </div>
          <div
            className={`${previewBg} min-h-[200px] flex items-center justify-center p-6 ${previewClassName}`}
          >
            <LivePreview />
          </div>
        </div>
        <LiveError className='bg-red-900/50 text-red-200 text-xs p-3 font-[family-name:var(--font-jetbrains-mono)]' />
        {controls.length > 0 && (
          <PropControls
            controls={controls}
            values={controlValues}
            onChange={handleControlChange}
          />
        )}
      </LiveProvider>
    </div>
  );
}
```

- [ ] **Step 2: Verify build compiles**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/components/shell/LiveStep.tsx
git commit -m "Add LiveStep interactive playground component with react-live"
```

---

### Task 7: Wire LiveStep into blog MDX pipeline

**Files:**
- Modify: `src/app/(library)/blog/[slug]/page.tsx`

- [ ] **Step 1: Add LiveStep and component imports to the blog page**

Add LiveStep and the 4 pilot component imports to the blog page, and pass them into `mdxComponents`. Since LiveStep is a client component and the components are client components, they can be passed directly.

At the top of the file, add these imports after the existing ones:

```tsx
import LiveStep from '@/components/shell/LiveStep';
import BlurText from '@/components/library/text-animations/BlurText';
import TiltedCard from '@/components/library/components/TiltedCard';
import ElectricBorder from '@/components/library/animations/ElectricBorder';
import LineWaves from '@/components/library/backgrounds/LineWaves';
```

In the `mdxComponents` object, add `LiveStep` as a passthrough so MDX can use it. Also add the component scope mapping:

Add to `mdxComponents`:

```tsx
  LiveStep: (props: any) => (
    <LiveStep
      {...props}
      scope={{
        BlurText,
        TiltedCard,
        ElectricBorder,
        LineWaves,
        ...props.scope,
      }}
    />
  ),
```

- [ ] **Step 2: Build and verify**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/app/\(library\)/blog/\[slug\]/page.tsx
git commit -m "Wire LiveStep and pilot component imports into MDX pipeline"
```

---

### Task 8: Rewrite blur-text blog post

**Files:**
- Modify: `src/content/blog/blur-text.mdx`

- [ ] **Step 1: Rewrite with walkthrough stages**

Replace the entire file:

```mdx
---
title: "Build a Blur Text Animation in React"
description: "Create a smooth blur-to-sharp text reveal effect using Framer Motion. Each word or character fades from blurred to crisp on scroll."
date: "2026-04-06"
category: "Text Animations"
componentSlug: "blur-text"
---

A plain fade-in is fine. A blur-to-sharp reveal is something else entirely. It gives the impression that the text is materializing out of thin air.

## The final result

Play with the controls to see how the component behaves with different settings:

<LiveStep
  code={`<BlurText text="Crafted with care" animateBy="words" delay={0.05} className="text-4xl font-bold" />`}
  controls={[
    { prop: 'animateBy', type: 'select', options: ['words', 'characters'], default: 'words', label: 'animate by' },
    { prop: 'delay', type: 'slider', min: 0.01, max: 0.2, step: 0.01, default: 0.05, label: 'delay' },
  ]}
/>

## Setting up

This one is lightweight. You only need Framer Motion.

```tsx
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
```

## Step 1: Define the props

The key decision is whether you split by words or characters. We keep the API minimal.

```tsx
interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'characters';
  direction?: 'top' | 'bottom';
}
```

## Step 2: Split text and detect viewport

Split the text string based on `animateBy`, then use `useInView` to trigger when the element scrolls into view.

```tsx
const segments = animateBy === 'words' ? text.split(' ') : text.split('');
const ref = useRef<HTMLDivElement>(null);
const isInView = useInView(ref, { once: true, margin: '-50px' });
```

## Step 3: Animate each segment

Each segment gets its own `motion.span`. The blur, opacity, and y-offset animate together for a rich reveal. Try switching between words and characters:

<LiveStep
  code={`<BlurText text="Each word fades in" animateBy="words" delay={0.05} className="text-3xl font-bold" />`}
  controls={[
    { prop: 'animateBy', type: 'select', options: ['words', 'characters'], default: 'words', label: 'animate by' },
  ]}
/>

The motion values that make this work:

```tsx
<motion.span
  initial={{ opacity: 0, filter: 'blur(12px)', y: yOffset }}
  animate={
    isInView
      ? { opacity: 1, filter: 'blur(0px)', y: 0 }
      : { opacity: 0, filter: 'blur(12px)', y: yOffset }
  }
  transition={{
    duration: 0.5,
    delay: i * delay,
    ease: [0.25, 0.1, 0.25, 1],
  }}
/>
```

## Step 4: Fine-tune the timing

The delay between segments controls the feel. Low values (0.02) feel like a wave, high values (0.15) feel deliberate. Play with it:

<LiveStep
  code={`<BlurText text="Timing is everything in animation" animateBy="words" delay={0.05} direction="bottom" className="text-2xl font-bold" />`}
  controls={[
    { prop: 'delay', type: 'slider', min: 0.01, max: 0.2, step: 0.01, default: 0.05, label: 'delay' },
    { prop: 'direction', type: 'select', options: ['top', 'bottom'], default: 'bottom', label: 'direction' },
    { prop: 'animateBy', type: 'select', options: ['words', 'characters'], default: 'words', label: 'animate by' },
  ]}
/>

## Key takeaways

- Animating `filter: blur()` along with `opacity` and `y` creates a much richer reveal than opacity alone.
- Framer Motion's `useInView` hook keeps the trigger logic simple and declarative.
- The stagger delay is the single most impactful parameter to tune.
```

- [ ] **Step 2: Build and verify**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -10
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/content/blog/blur-text.mdx
git commit -m "Rewrite blur-text blog post as interactive walkthrough"
```

---

### Task 9: Rewrite electric-border blog post

**Files:**
- Modify: `src/content/blog/electric-border.mdx`

- [ ] **Step 1: Rewrite with walkthrough stages**

Replace the entire file:

```mdx
---
title: "Build an Electric Border Animation in React"
description: "Animate a current of light traveling along a border to make UI cards and containers feel alive."
date: "2026-04-07"
category: "Animations"
componentSlug: "electric-border"
---

Borders are boring. They sit there, static, doing the minimum. Give that border a moving pulse of light and suddenly your card feels powered on.

## The final result

The whole thing is pure CSS under the hood. Try changing the color and speed:

<LiveStep
  code={`<ElectricBorder color="#4af" duration={2} borderWidth={2} borderRadius="16px">
  <div className="px-8 py-6 bg-zinc-900 text-white rounded-[16px]">
    <p className="text-lg font-bold">Premium Plan</p>
    <p className="text-sm text-white/60">Everything included</p>
  </div>
</ElectricBorder>`}
  previewBg="bg-black"
  controls={[
    { prop: 'color', type: 'color', default: '#4444ff', label: 'color' },
    { prop: 'duration', type: 'slider', min: 0.5, max: 6, step: 0.5, default: 2, label: 'speed (s)' },
    { prop: 'borderWidth', type: 'slider', min: 1, max: 6, step: 1, default: 2, label: 'width' },
  ]}
/>

## Setting up

No dependencies beyond React. The component uses inline styles and a `<style>` tag for the keyframe.

```tsx
interface ElectricBorderProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  color?: string;
  borderRadius?: string;
  borderWidth?: number;
}
```

## Step 1: The spinning gradient

The trick is a conic-gradient. Only a narrow band is visible, the rest is transparent. Spinning it traces a pulse around the element:

```tsx
background: `conic-gradient(from 0deg, transparent 0%, ${color} 10%, transparent 20%)`
```

## Step 2: The mask trick

Without a mask, the gradient fills the entire rectangle. The CSS mask subtracts the content box, leaving only the border strip:

```tsx
WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
WebkitMaskComposite: 'xor',
maskComposite: 'exclude',
```

## Step 3: The animation

A simple infinite rotation makes the pulse travel. Try different speeds:

<LiveStep
  code={`<ElectricBorder color="#ffffff" duration={3} borderWidth={2} borderRadius="12px">
  <div className="px-12 py-8 bg-black text-white text-lg">
    Electric Border Effect
  </div>
</ElectricBorder>`}
  previewBg="bg-black"
  controls={[
    { prop: 'color', type: 'color', default: '#ffffff', label: 'color' },
    { prop: 'duration', type: 'slider', min: 0.5, max: 6, step: 0.5, default: 3, label: 'speed (s)' },
  ]}
/>

The keyframe is just a rotation:

```tsx
@keyframes electric-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## Step 4: Try different looks

Blue with a thick border, or a subtle white glow. The same component handles both:

<LiveStep
  code={`<ElectricBorder color="#3b82f6" duration={4} borderRadius="9999px" borderWidth={3}>
  <div className="px-8 py-3 bg-zinc-900 text-white text-sm rounded-full">
    Rounded with blue
  </div>
</ElectricBorder>`}
  previewBg="bg-black"
  controls={[
    { prop: 'color', type: 'color', default: '#3b82f6', label: 'color' },
    { prop: 'duration', type: 'slider', min: 0.5, max: 6, step: 0.5, default: 4, label: 'speed (s)' },
    { prop: 'borderWidth', type: 'slider', min: 1, max: 6, step: 1, default: 3, label: 'width' },
  ]}
/>

## Key takeaways

- The conic-gradient plus CSS mask technique produces a true border ring with zero canvas or SVG overhead.
- `maskComposite: 'exclude'` is the key that cuts out the interior.
- Duration between 1.5s and 3s hits the sweet spot.
```

- [ ] **Step 2: Build and verify**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/content/blog/electric-border.mdx
git commit -m "Rewrite electric-border blog post as interactive walkthrough"
```

---

### Task 10: Rewrite tilted-card blog post

**Files:**
- Modify: `src/content/blog/tilted-card.mdx`

- [ ] **Step 1: Rewrite with walkthrough stages**

Replace the entire file:

```mdx
---
title: "Build a 3D Tilted Card in React"
description: "Create a card that rotates in 3D space based on cursor position, giving it a physical, interactive quality."
date: "2026-04-07"
category: "Components"
componentSlug: "tilted-card"
---

Flat cards sit on a page. Tilted cards reach out from it. The moment a card responds to your cursor in three dimensions, it stops feeling like a UI element and starts feeling like an object.

## The final result

Hover over the card and move your cursor around. Adjust the tilt intensity and glare:

<LiveStep
  code={`<TiltedCard maxTilt={15} scale={1.05} perspective={1000} glareEnable={true} glareMaxOpacity={0.2} className="w-64 h-80 bg-zinc-900 rounded-2xl flex items-center justify-center">
  <span className="text-white text-lg">Hover me</span>
</TiltedCard>`}
  controls={[
    { prop: 'maxTilt', type: 'slider', min: 5, max: 40, step: 1, default: 15, label: 'tilt' },
    { prop: 'scale', type: 'slider', min: 1, max: 1.2, step: 0.01, default: 1.05, label: 'scale' },
    { prop: 'glareEnable', type: 'toggle', default: true, label: 'glare' },
    { prop: 'glareMaxOpacity', type: 'slider', min: 0, max: 0.5, step: 0.05, default: 0.2, label: 'glare opacity' },
  ]}
/>

## Setting up

This component uses only React built-ins:

```tsx
import { useRef, useState } from 'react';
```

## Step 1: Define the props

```tsx
interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  perspective?: number;
  glareEnable?: boolean;
  glareMaxOpacity?: number;
}
```

## Step 2: Track the cursor angle

On `mousemove`, calculate where the cursor is relative to the card center, then map to rotation values. X maps to `rotateY` and vice versa:

```tsx
function handleMouseMove(e: React.MouseEvent) {
  if (!cardRef.current) return;
  const rect = cardRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const halfW = rect.width / 2;
  const halfH = rect.height / 2;

  const rotateX = ((y - halfH) / halfH) * -maxTilt;
  const rotateY = ((x - halfW) / halfW) * maxTilt;

  setTransform(
    `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
  );
}
```

## Step 3: Add the glare overlay

A linear gradient rotates to follow the cursor, creating a light sweep effect:

```tsx
const angle = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI) + 180;
setGlareStyle({
  opacity: glareMaxOpacity,
  background: `linear-gradient(${angle}deg, rgba(255,255,255,${glareMaxOpacity}) 0%, transparent 80%)`,
});
```

Try different tilt intensities:

<LiveStep
  code={`<TiltedCard maxTilt={25} scale={1.08} glareEnable={true} glareMaxOpacity={0.3} className="w-56 h-72 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center">
  <span className="text-white text-lg font-bold">Dramatic</span>
</TiltedCard>`}
  controls={[
    { prop: 'maxTilt', type: 'slider', min: 5, max: 40, step: 1, default: 25, label: 'tilt' },
    { prop: 'glareMaxOpacity', type: 'slider', min: 0, max: 0.5, step: 0.05, default: 0.3, label: 'glare opacity' },
  ]}
/>

## Step 4: Reset on mouse leave

Both transform and glare reset smoothly thanks to CSS transitions:

```tsx
function handleMouseLeave() {
  setTransform('');
  setGlareStyle({ opacity: 0, background: '' });
}
```

## Key takeaways

- Putting `perspective()` inside the `transform` string means each card has its own vanishing point.
- CSS transitions handle the return animation automatically, no spring library needed.
- `overflow-hidden` on the wrapper keeps the glare gradient contained.
```

- [ ] **Step 2: Build and verify**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/content/blog/tilted-card.mdx
git commit -m "Rewrite tilted-card blog post as interactive walkthrough"
```

---

### Task 11: Rewrite line-waves blog post

**Files:**
- Modify: `src/content/blog/line-waves.mdx`

- [ ] **Step 1: Rewrite with walkthrough stages**

Replace the entire file:

```mdx
---
title: "Build Animated Line Waves in React"
description: "Create a hypnotic animated line wave background using canvas and sine curves that flow in real time."
date: "2026-04-07"
category: "Backgrounds"
componentSlug: "line-waves"
---

Static backgrounds feel static. Softly undulating lines of color feel alive. This component draws sine curves on a canvas and animates them frame by frame.

## The final result

Adjust the number of lines, amplitude, and color to see how different configurations feel:

<LiveStep
  code={`<div style={{ width: '100%', height: '300px' }}>
  <LineWaves lineCount={8} lineColor="#000" amplitude={40} frequency={0.02} speed={0.02} />
</div>`}
  controls={[
    { prop: 'lineCount', type: 'slider', min: 2, max: 20, step: 1, default: 8, label: 'lines' },
    { prop: 'amplitude', type: 'slider', min: 10, max: 100, step: 5, default: 40, label: 'amplitude' },
    { prop: 'lineColor', type: 'color', default: '#000000', label: 'color' },
  ]}
/>

## Setting up

No external dependencies. Just canvas and requestAnimationFrame.

```tsx
import { useRef, useEffect } from 'react';
```

## Step 1: Canvas setup with retina support

The canvas needs to respect device pixel ratio so lines stay sharp on retina screens:

```tsx
function resize() {
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}
```

## Step 2: The sine wave drawing loop

Each line is positioned at an even vertical spacing. The sine function offsets each point, and each line gets a different phase so they oscillate out of sync:

```tsx
for (let i = 1; i <= lineCount; i++) {
  const baseY = spacing * i;
  for (let x = 0; x <= w; x++) {
    const y = baseY +
      Math.sin(x * frequency + offset + i * 0.8) *
        amplitude *
        (1 - Math.abs(i - lineCount / 2) / lineCount);
  }
}
```

The `i * 0.8` phase offset is what makes the waves look organic. The amplitude modifier scales waves down at the edges.

Try different line counts and amplitudes:

<LiveStep
  code={`<div style={{ width: '100%', height: '250px' }}>
  <LineWaves lineCount={5} lineColor="#e5e5e5" amplitude={30} />
</div>`}
  controls={[
    { prop: 'lineCount', type: 'slider', min: 2, max: 20, step: 1, default: 5, label: 'lines' },
    { prop: 'amplitude', type: 'slider', min: 10, max: 100, step: 5, default: 30, label: 'amplitude' },
    { prop: 'lineColor', type: 'color', default: '#e5e5e5', label: 'color' },
  ]}
/>

## Step 3: Animation loop

The offset advances each frame, creating continuous horizontal motion:

```tsx
offsetRef.current += speed;
animationRef.current = requestAnimationFrame(draw);
```

Keep speed low (0.01 to 0.03) for a calm feel behind content.

## Step 4: Put it together

Drop it inside any positioned container:

<LiveStep
  code={`<div style={{ width: '100%', height: '300px', background: '#000' }}>
  <LineWaves lineCount={12} lineColor="#333" amplitude={60} speed={0.02} />
</div>`}
  previewBg="bg-black"
  controls={[
    { prop: 'lineCount', type: 'slider', min: 2, max: 20, step: 1, default: 12, label: 'lines' },
    { prop: 'amplitude', type: 'slider', min: 10, max: 100, step: 5, default: 60, label: 'amplitude' },
    { prop: 'lineColor', type: 'color', default: '#333333', label: 'color' },
  ]}
/>

## Key takeaways

- The `devicePixelRatio` scale call is essential for crisp lines on high-DPI screens.
- Varying the phase offset per line (`i * 0.8`) makes the waves look organic.
- Keeping speed low keeps the motion calm and readable behind content.
```

- [ ] **Step 2: Build and verify**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
git add src/content/blog/line-waves.mdx
git commit -m "Rewrite line-waves blog post as interactive walkthrough"
```

---

### Task 12: Final verification

**Files:**
- Read: all modified files

- [ ] **Step 1: Full build**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next build --no-lint 2>&1 | tail -20
```

Expected: Build succeeds with all pages generated.

- [ ] **Step 2: Start dev server and spot-check**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website && npx next dev
```

Check these pages:

1. `/blog/blur-text` -- should have highlighted code blocks AND interactive LiveStep playgrounds with controls
2. `/blog/electric-border` -- LiveStep with color picker, dark preview bg
3. `/blog/tilted-card` -- LiveStep with tilt slider, hover interaction works in preview
4. `/blog/line-waves` -- LiveStep with animated canvas in preview
5. `/blog/animated-list` -- should have highlighted code blocks (static, not interactive yet) -- verifies shiki works for non-pilot posts

- [ ] **Step 3: Check a non-pilot blog post has syntax highlighting**

Visit any non-pilot blog post (e.g. `/blog/animated-list`). Code blocks should have dark background with colored syntax highlighting, language label, and copy button. No interactive playground (that's expected).
