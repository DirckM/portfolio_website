# Component Library & Blog - Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the component library shell (hero, grid, detail pages), blog system, and 6 sample components to prove the end-to-end system works.

**Architecture:** New routes `/components` and `/blog` within the existing Next.js portfolio app, using nested layouts so they get the Abhijit-inspired monochrome design while the existing portfolio pages remain untouched. Components are registered in a centralized data file. Blog posts use MDX with embedded live demos. SEO metadata is generated per page.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4, Framer Motion, MDX (next-mdx-remote), TypeScript, Instrument Serif + Inter + JetBrains Mono

**Scope:** This is Phase 1 of 3. Phase 2 covers building the remaining ~55 components. Phase 3 covers writing all blog posts. This plan delivers a fully working system with 6 sample components and 1 sample blog post.

---

## File Structure

```
src/
  app/
    (portfolio)/                    # Route group for existing portfolio
      layout.tsx                    # Wraps with existing Header/Footer
      page.tsx                      # Existing home page (moved here)
    (library)/                      # Route group for component library + blog
      layout.tsx                    # New minimal monochrome layout
      components/
        page.tsx                    # Component library landing
        [slug]/
          page.tsx                  # Component detail page
      blog/
        page.tsx                    # Blog listing
        [slug]/
          page.tsx                  # Blog post
    layout.tsx                      # Root layout (fonts only, no header/footer)
    globals.css                     # Updated with new design tokens
  components/
    library/                        # The actual library components
      text-animations/
        BlurText.tsx
        GlitchText.tsx
      animations/
        ElectricBorder.tsx
      components/
        TiltedCard.tsx
      backgrounds/
        LineWaves.tsx
      blocks/
        MacbookScroll.tsx
    shell/                          # Library UI shell components
      LibraryHeader.tsx
      LibraryFooter.tsx
      Hero3DCarousel.tsx
      ComponentCard.tsx
      ComponentGrid.tsx
      FilterBar.tsx
      GlassmorphicOverlay.tsx
      BlogPostLayout.tsx
      CodeBlock.tsx
  lib/
    components-registry.ts          # All component metadata
    blog-utils.ts                   # MDX loading utilities
  content/
    blog/
      blur-text.mdx                 # Sample blog post
```

---

## Task 1: Restructure routes with route groups

The existing site has layout.tsx wrapping everything with Header/Footer. We need route groups so `/components` and `/blog` get a different layout.

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/(portfolio)/layout.tsx`
- Move: `src/app/page.tsx` -> `src/app/(portfolio)/page.tsx`
- Create: `src/app/(library)/layout.tsx`

- [ ] **Step 1: Create the portfolio route group directory**

```bash
mkdir -p src/app/\(portfolio\)
```

- [ ] **Step 2: Move the existing page.tsx into the portfolio route group**

```bash
mv src/app/page.tsx src/app/\(portfolio\)/page.tsx
```

- [ ] **Step 3: Create the portfolio layout that wraps with Header/Footer**

Create `src/app/(portfolio)/layout.tsx`:

```tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Update root layout.tsx to only handle fonts and html shell**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dirck Mulder',
  description: 'Designer & Developer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Create the library route group directories**

```bash
mkdir -p src/app/\(library\)/components/\[slug\]
mkdir -p src/app/\(library\)/blog/\[slug\]
```

- [ ] **Step 6: Create a placeholder library layout**

Create `src/app/(library)/layout.tsx`:

```tsx
export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black font-[family-name:var(--font-inter)]">
      {children}
    </div>
  );
}
```

- [ ] **Step 7: Create placeholder pages to verify routing works**

Create `src/app/(library)/components/page.tsx`:

```tsx
export default function ComponentsPage() {
  return <div className="p-20 text-center">Components Library</div>;
}
```

Create `src/app/(library)/blog/page.tsx`:

```tsx
export default function BlogPage() {
  return <div className="p-20 text-center">Blog</div>;
}
```

- [ ] **Step 8: Verify the app builds and both routes work**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
pnpm dev
```

Visit `localhost:3000` (portfolio with Header/Footer should still work), `localhost:3000/components` (should show placeholder), `localhost:3000/blog` (should show placeholder).

- [ ] **Step 9: Commit**

```bash
git add src/app/
git commit -m "Restructure routes with route groups for component library"
```

---

## Task 2: Design system - update Tailwind config and globals.css

Add the monochrome design tokens alongside the existing ones (don't break the portfolio).

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Extend Tailwind config with library design tokens**

Add these to the `extend.colors` object in `tailwind.config.ts`, after the existing colors:

```ts
library: {
  white: '#ffffff',
  cream: '#f5f5f0',
  black: '#000000',
  gray: '#6b6b6b',
  border: '#e5e5e5',
  code: '#1a1a1a',
},
```

- [ ] **Step 2: Add JetBrains Mono to the fontFamily config**

In the `extend.fontFamily` object in `tailwind.config.ts`, add:

```ts
mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
```

- [ ] **Step 3: Add library-specific CSS custom properties to globals.css**

Add at the end of `src/app/globals.css`:

```css
/* Component Library Design Tokens */
.library-theme {
  --lib-bg-primary: #ffffff;
  --lib-bg-secondary: #f5f5f0;
  --lib-bg-dark: #000000;
  --lib-text-primary: #000000;
  --lib-text-secondary: #6b6b6b;
  --lib-border: #e5e5e5;
  --lib-code-bg: #1a1a1a;
}
```

- [ ] **Step 4: Verify build succeeds**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "Add monochrome design tokens for component library"
```

---

## Task 3: Library header and footer

Minimal header/footer inspired by Abhijit's site. Header: name top-left, contextual info top-right. Footer: simple links.

**Files:**
- Create: `src/components/shell/LibraryHeader.tsx`
- Create: `src/components/shell/LibraryFooter.tsx`
- Modify: `src/app/(library)/layout.tsx`

- [ ] **Step 1: Create the shell directory**

```bash
mkdir -p src/components/shell
```

- [ ] **Step 2: Create LibraryHeader**

Create `src/components/shell/LibraryHeader.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LibraryHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-sm">
      <Link
        href="/"
        className="text-sm font-[family-name:var(--font-inter)] tracking-wide text-black no-underline"
      >
        Dirck Mulder
      </Link>
      <nav className="flex gap-8 text-sm font-[family-name:var(--font-inter)]">
        <Link
          href="/components"
          className={`no-underline transition-colors ${
            pathname.startsWith('/components')
              ? 'text-black'
              : 'text-library-gray hover:text-black'
          }`}
        >
          Components
        </Link>
        <Link
          href="/blog"
          className={`no-underline transition-colors ${
            pathname.startsWith('/blog')
              ? 'text-black'
              : 'text-library-gray hover:text-black'
          }`}
        >
          Blog
        </Link>
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: Create LibraryFooter**

Create `src/components/shell/LibraryFooter.tsx`:

```tsx
import Link from 'next/link';

export default function LibraryFooter() {
  return (
    <footer className="border-t border-library-border px-6 py-8 flex items-center justify-between text-sm text-library-gray font-[family-name:var(--font-inter)]">
      <span>Dirck Mulder</span>
      <div className="flex gap-6">
        <Link href="/" className="no-underline text-library-gray hover:text-black transition-colors">
          Portfolio
        </Link>
        <Link href="/components" className="no-underline text-library-gray hover:text-black transition-colors">
          Components
        </Link>
        <Link href="/blog" className="no-underline text-library-gray hover:text-black transition-colors">
          Blog
        </Link>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Update library layout to use the new header/footer**

Replace `src/app/(library)/layout.tsx` with:

```tsx
import LibraryHeader from '@/components/shell/LibraryHeader';
import LibraryFooter from '@/components/shell/LibraryFooter';

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="library-theme min-h-screen bg-white text-black font-[family-name:var(--font-inter)]">
      <LibraryHeader />
      <main>{children}</main>
      <LibraryFooter />
    </div>
  );
}
```

- [ ] **Step 5: Verify the library pages render with the new header/footer**

```bash
pnpm dev
```

Visit `localhost:3000/components` - should show minimal header with "Dirck Mulder" left, "Components | Blog" right, and footer at the bottom.

- [ ] **Step 6: Commit**

```bash
git add src/components/shell/ src/app/\(library\)/layout.tsx
git commit -m "Add minimal monochrome header and footer for library pages"
```

---

## Task 4: Component registry

A centralized data file that holds all component metadata: name, slug, category, description, source reference.

**Files:**
- Create: `src/lib/components-registry.ts`

- [ ] **Step 1: Create the component registry**

Create `src/lib/components-registry.ts`:

```ts
export type ComponentCategory =
  | 'text'
  | 'animations'
  | 'components'
  | 'backgrounds'
  | 'blocks';

export interface ComponentEntry {
  name: string;
  slug: string;
  category: ComponentCategory;
  description: string;
  sourceRef: string;
  featured: boolean;
}

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  text: 'Text',
  animations: 'Animations',
  components: 'Components',
  backgrounds: 'Backgrounds',
  blocks: 'Blocks',
};

export const componentRegistry: ComponentEntry[] = [
  // Text Animations
  {
    name: 'Split Text',
    slug: 'split-text',
    category: 'text',
    description: 'Text that splits apart and animates character by character',
    sourceRef: 'reactbits.dev/text-animations/split-text',
    featured: false,
  },
  {
    name: 'Blur Text',
    slug: 'blur-text',
    category: 'text',
    description: 'Text that fades in with a blur effect',
    sourceRef: 'reactbits.dev/text-animations/blur-text',
    featured: true,
  },
  {
    name: 'Circular Text',
    slug: 'circular-text',
    category: 'text',
    description: 'Text arranged in a circular path with rotation',
    sourceRef: 'reactbits.dev/text-animations/circular-text',
    featured: false,
  },
  {
    name: 'Text Type',
    slug: 'text-type',
    category: 'text',
    description: 'Typewriter effect that types text character by character',
    sourceRef: 'reactbits.dev/text-animations/text-type',
    featured: false,
  },
  {
    name: 'Shuffle',
    slug: 'shuffle',
    category: 'text',
    description: 'Text that shuffles through random characters before revealing',
    sourceRef: 'reactbits.dev/text-animations/shuffle',
    featured: false,
  },
  {
    name: 'Shiny Text',
    slug: 'shiny-text',
    category: 'text',
    description: 'Text with a shimmering light sweep effect',
    sourceRef: 'reactbits.dev/text-animations/shiny-text',
    featured: false,
  },
  {
    name: 'Text Pressure',
    slug: 'text-pressure',
    category: 'text',
    description: 'Text that reacts to cursor pressure and proximity',
    sourceRef: 'reactbits.dev/text-animations/text-pressure',
    featured: false,
  },
  {
    name: 'Curved Loop',
    slug: 'curved-loop',
    category: 'text',
    description: 'Text flowing along a curved looping path',
    sourceRef: 'reactbits.dev/text-animations/curved-loop',
    featured: false,
  },
  {
    name: 'Falling Text',
    slug: 'falling-text',
    category: 'text',
    description: 'Characters that fall and stack with physics',
    sourceRef: 'reactbits.dev/text-animations/falling-text',
    featured: false,
  },
  {
    name: 'Decrypted Text',
    slug: 'decrypted-text',
    category: 'text',
    description: 'Text that decrypts from scrambled characters',
    sourceRef: 'reactbits.dev/text-animations/decrypted-text',
    featured: false,
  },
  {
    name: 'True Focus',
    slug: 'true-focus',
    category: 'text',
    description: 'Only the focused word is sharp, rest is blurred',
    sourceRef: 'reactbits.dev/text-animations/true-focus',
    featured: false,
  },
  {
    name: 'Scroll Float',
    slug: 'scroll-float',
    category: 'text',
    description: 'Text that floats upward as you scroll',
    sourceRef: 'reactbits.dev/text-animations/scroll-float',
    featured: false,
  },
  {
    name: 'Scroll Reveal',
    slug: 'scroll-reveal',
    category: 'text',
    description: 'Text revealed progressively on scroll',
    sourceRef: 'reactbits.dev/text-animations/scroll-reveal',
    featured: false,
  },
  {
    name: 'ASCII Text',
    slug: 'ascii-text',
    category: 'text',
    description: 'Text rendered in ASCII art style',
    sourceRef: 'reactbits.dev/text-animations/ascii-text',
    featured: false,
  },
  {
    name: 'Scrambled Text',
    slug: 'scrambled-text',
    category: 'text',
    description: 'Text that scrambles and unscrambles on hover',
    sourceRef: 'reactbits.dev/text-animations/scrambled-text',
    featured: false,
  },
  {
    name: 'Rotating Text',
    slug: 'rotating-text',
    category: 'text',
    description: 'Text that rotates through multiple words',
    sourceRef: 'reactbits.dev/text-animations/rotating-text',
    featured: false,
  },
  {
    name: 'Glitch Text',
    slug: 'glitch-text',
    category: 'text',
    description: 'Text with a digital glitch distortion effect',
    sourceRef: 'reactbits.dev/text-animations/glitch-text',
    featured: true,
  },
  {
    name: 'Variable Proximity',
    slug: 'variable-proximity',
    category: 'text',
    description: 'Font weight changes based on cursor distance',
    sourceRef: 'reactbits.dev/text-animations/variable-proximity',
    featured: false,
  },
  {
    name: 'Scroll Velocity',
    slug: 'scroll-velocity',
    category: 'text',
    description: 'Marquee text that speeds up with scroll velocity',
    sourceRef: 'reactbits.dev/text-animations/scroll-velocity',
    featured: false,
  },
  {
    name: 'Letter Swap',
    slug: 'letter-swap',
    category: 'text',
    description: 'Letters swap positions with smooth animation on hover',
    sourceRef: 'fancycomponents.dev',
    featured: false,
  },

  // Animations
  {
    name: 'Electric Border',
    slug: 'electric-border',
    category: 'animations',
    description: 'An electric current effect that travels along a border',
    sourceRef: 'reactbits.dev/animations/electric-border',
    featured: true,
  },
  {
    name: 'Glare Hover',
    slug: 'glare-hover',
    category: 'animations',
    description: 'A glare light effect that follows cursor on hover',
    sourceRef: 'reactbits.dev/animations/glare-hover',
    featured: false,
  },
  {
    name: 'Antigravity',
    slug: 'antigravity',
    category: 'animations',
    description: 'Elements that float upward defying gravity',
    sourceRef: 'reactbits.dev/animations/antigravity',
    featured: false,
  },
  {
    name: 'Logo Loop',
    slug: 'logo-loop',
    category: 'animations',
    description: 'Continuous looping logo animation',
    sourceRef: 'reactbits.dev/animations/logo-loop',
    featured: false,
  },
  {
    name: 'Target Cursor',
    slug: 'target-cursor',
    category: 'animations',
    description: 'A crosshair target that follows the cursor',
    sourceRef: 'reactbits.dev/animations/target-cursor',
    featured: false,
  },
  {
    name: 'Magic Rings',
    slug: 'magic-rings',
    category: 'animations',
    description: 'Concentric rings with magical animation effects',
    sourceRef: 'reactbits.dev/animations/magic-rings',
    featured: false,
  },
  {
    name: 'Magnet',
    slug: 'magnet',
    category: 'animations',
    description: 'Element that attracts toward the cursor like a magnet',
    sourceRef: 'reactbits.dev/animations/magnet',
    featured: false,
  },
  {
    name: 'Pixel Trail',
    slug: 'pixel-trail',
    category: 'animations',
    description: 'Pixelated trail effect that follows cursor movement',
    sourceRef: 'reactbits.dev/animations/pixel-trail',
    featured: false,
  },
  {
    name: 'Metallic Paint',
    slug: 'metallic-paint',
    category: 'animations',
    description: 'A metallic paint shader effect on surfaces',
    sourceRef: 'reactbits.dev/animations/metallic-paint',
    featured: false,
  },
  {
    name: 'Shape Blur',
    slug: 'shape-blur',
    category: 'animations',
    description: 'Shapes that blur and morph dynamically',
    sourceRef: 'reactbits.dev/animations/shape-blur',
    featured: false,
  },
  {
    name: 'Crosshair',
    slug: 'crosshair',
    category: 'animations',
    description: 'Precision crosshair cursor effect',
    sourceRef: 'reactbits.dev/animations/crosshair',
    featured: false,
  },
  {
    name: 'Meta Balls',
    slug: 'meta-balls',
    category: 'animations',
    description: 'Organic metaball shapes that merge on proximity',
    sourceRef: 'reactbits.dev/animations/meta-balls',
    featured: false,
  },

  // Components
  {
    name: 'Animated List',
    slug: 'animated-list',
    category: 'components',
    description: 'List items that animate in with staggered timing',
    sourceRef: 'reactbits.dev/components/animated-list',
    featured: false,
  },
  {
    name: 'Scroll Stack',
    slug: 'scroll-stack',
    category: 'components',
    description: 'Cards that stack and scale as you scroll',
    sourceRef: 'reactbits.dev/components/scroll-stack',
    featured: false,
  },
  {
    name: 'Magic Bento',
    slug: 'magic-bento',
    category: 'components',
    description: 'Bento grid layout with interactive hover effects',
    sourceRef: 'reactbits.dev/components/magic-bento',
    featured: false,
  },
  {
    name: 'Circular Gallery',
    slug: 'circular-gallery',
    category: 'components',
    description: 'Image gallery arranged in a circular formation',
    sourceRef: 'reactbits.dev/components/circular-gallery',
    featured: false,
  },
  {
    name: 'Reflective Card',
    slug: 'reflective-card',
    category: 'components',
    description: 'Card with a realistic light reflection effect',
    sourceRef: 'reactbits.dev/components/reflective-card',
    featured: false,
  },
  {
    name: 'Fluid Glass',
    slug: 'fluid-glass',
    category: 'components',
    description: 'Glassmorphic surface with fluid motion',
    sourceRef: 'reactbits.dev/components/fluid-glass',
    featured: false,
  },
  {
    name: 'Tilted Card',
    slug: 'tilted-card',
    category: 'components',
    description: '3D card that tilts based on cursor position',
    sourceRef: 'reactbits.dev/components/tilted-card',
    featured: true,
  },
  {
    name: 'Glass Surface',
    slug: 'glass-surface',
    category: 'components',
    description: 'Frosted glass material surface effect',
    sourceRef: 'reactbits.dev/components/glass-surface',
    featured: false,
  },
  {
    name: 'Dome Gallery',
    slug: 'dome-gallery',
    category: 'components',
    description: 'Gallery with a dome-shaped 3D perspective',
    sourceRef: 'reactbits.dev/components/dome-gallery',
    featured: false,
  },
  {
    name: 'Folder',
    slug: 'folder',
    category: 'components',
    description: 'Interactive folder component that opens on click',
    sourceRef: 'reactbits.dev/components/folder',
    featured: false,
  },
  {
    name: 'Lanyard',
    slug: 'lanyard',
    category: 'components',
    description: 'ID badge on a lanyard with physics simulation',
    sourceRef: 'reactbits.dev/components/lanyard',
    featured: false,
  },
  {
    name: 'Dock',
    slug: 'dock',
    category: 'components',
    description: 'macOS-style dock with magnification on hover',
    sourceRef: 'reactbits.dev/components/dock',
    featured: false,
  },
  {
    name: 'Pixel Card',
    slug: 'pixel-card',
    category: 'components',
    description: 'Card with a pixelated reveal animation',
    sourceRef: 'reactbits.dev/components/pixel-card',
    featured: false,
  },
  {
    name: 'Border Glow',
    slug: 'border-glow',
    category: 'components',
    description: 'Card border that glows following the cursor',
    sourceRef: 'reactbits.dev/components/border-glow',
    featured: false,
  },
  {
    name: 'Flowing Menu',
    slug: 'flowing-menu',
    category: 'components',
    description: 'Navigation menu with flowing animation between items',
    sourceRef: 'reactbits.dev/components/flowing-menu',
    featured: false,
  },
  {
    name: 'Elastic Slider',
    slug: 'elastic-slider',
    category: 'components',
    description: 'Slider with elastic snap-back animation',
    sourceRef: 'reactbits.dev/components/elastic-slider',
    featured: false,
  },
  {
    name: 'Infinite Menu',
    slug: 'infinite-menu',
    category: 'components',
    description: 'Infinitely scrolling circular menu',
    sourceRef: 'reactbits.dev/components/infinite-menu',
    featured: false,
  },

  // Backgrounds
  {
    name: 'Line Waves',
    slug: 'line-waves',
    category: 'backgrounds',
    description: 'Animated wavy lines as a background effect',
    sourceRef: 'reactbits.dev/backgrounds/line-waves',
    featured: true,
  },

  // Blocks
  {
    name: 'Circling Elements',
    slug: 'circling-elements',
    category: 'blocks',
    description: 'Elements orbiting in a circle around a center point',
    sourceRef: 'fancycomponents.dev',
    featured: false,
  },
  {
    name: 'Marquee SVG Path',
    slug: 'marquee-svg-path',
    category: 'blocks',
    description: 'Content flowing along a custom SVG path',
    sourceRef: 'fancycomponents.dev',
    featured: false,
  },
  {
    name: 'Pixel Trail Block',
    slug: 'pixel-trail-block',
    category: 'blocks',
    description: 'Full-page pixel trail background with content overlay',
    sourceRef: 'fancycomponents.dev',
    featured: false,
  },
  {
    name: 'Parallax Floating',
    slug: 'parallax-floating',
    category: 'blocks',
    description: 'Images floating with parallax depth on mouse move',
    sourceRef: 'fancycomponents.dev',
    featured: false,
  },
  {
    name: 'MacBook Scroll',
    slug: 'macbook-scroll',
    category: 'blocks',
    description: 'MacBook opening animation driven by scroll',
    sourceRef: 'ui.aceternity.com/components',
    featured: true,
  },
  {
    name: 'Terminal',
    slug: 'terminal',
    category: 'blocks',
    description: 'Animated terminal window with typing effect',
    sourceRef: 'ui.aceternity.com/components/terminal',
    featured: false,
  },
  {
    name: 'World Map',
    slug: 'world-map',
    category: 'blocks',
    description: 'Interactive dotted world map with connections',
    sourceRef: 'ui.aceternity.com/components/world-map',
    featured: false,
  },
];

export function getComponentBySlug(slug: string): ComponentEntry | undefined {
  return componentRegistry.find(c => c.slug === slug);
}

export function getComponentsByCategory(
  category: ComponentCategory
): ComponentEntry[] {
  return componentRegistry.filter(c => c.category === category);
}

export function getFeaturedComponents(): ComponentEntry[] {
  return componentRegistry.filter(c => c.featured);
}
```

- [ ] **Step 2: Verify the registry compiles**

```bash
pnpm type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/components-registry.ts
git commit -m "Add centralized component registry with all 60+ entries"
```

---

## Task 5: Component card with 3D tilt and glassmorphic overlay

The card used in both the hero carousel and the grid. Shows a live component preview, tilts on hover, shows a glassmorphic overlay with the name.

**Files:**
- Create: `src/components/shell/ComponentCard.tsx`
- Create: `src/components/shell/GlassmorphicOverlay.tsx`

- [ ] **Step 1: Create the glassmorphic overlay**

Create `src/components/shell/GlassmorphicOverlay.tsx`:

```tsx
import { type ComponentCategory, CATEGORY_LABELS } from '@/lib/components-registry';

interface GlassmorphicOverlayProps {
  name: string;
  category: ComponentCategory;
  visible: boolean;
}

export default function GlassmorphicOverlay({
  name,
  category,
  visible,
}: GlassmorphicOverlayProps) {
  return (
    <div
      className={`absolute inset-x-4 bottom-4 rounded-lg bg-black/60 backdrop-blur-md px-4 py-3 transition-all duration-300 ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <p className="text-white text-sm font-medium">{name}</p>
      <p className="text-white/60 text-xs mt-0.5">
        {CATEGORY_LABELS[category]}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create the component card**

Create `src/components/shell/ComponentCard.tsx`:

```tsx
'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import GlassmorphicOverlay from './GlassmorphicOverlay';
import { type ComponentCategory } from '@/lib/components-registry';

interface ComponentCardProps {
  name: string;
  slug: string;
  category: ComponentCategory;
  children: React.ReactNode;
  perspective?: boolean;
}

export default function ComponentCard({
  name,
  slug,
  category,
  children,
  perspective = false,
}: ComponentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current || !perspective) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(((y - centerY) / centerY) * -8);
    setRotateY(((x - centerX) / centerX) * 8);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  }

  return (
    <Link href={`/components/${slug}`} className="no-underline">
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden rounded-xl border border-library-border bg-library-cream aspect-[4/3] cursor-pointer transition-shadow duration-300 hover:shadow-xl"
        style={{
          transform: perspective
            ? `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
            : undefined,
          transition: 'transform 0.15s ease-out, box-shadow 0.3s ease',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-4">
          {children}
        </div>
        <GlassmorphicOverlay
          name={name}
          category={category}
          visible={isHovered}
        />
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Verify the files compile**

```bash
pnpm type-check
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shell/ComponentCard.tsx src/components/shell/GlassmorphicOverlay.tsx
git commit -m "Add component card with 3D tilt and glassmorphic overlay"
```

---

## Task 6: Hero 3D carousel

The Abhijit-inspired horizontal row of 3D perspective-tilted cards. Full viewport height with tagline and scroll prompt.

**Files:**
- Create: `src/components/shell/Hero3DCarousel.tsx`

- [ ] **Step 1: Create the hero carousel**

Create `src/components/shell/Hero3DCarousel.tsx`:

```tsx
'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import ComponentCard from './ComponentCard';
import { getFeaturedComponents } from '@/lib/components-registry';

interface Hero3DCarouselProps {
  componentPreviews: Record<string, React.ReactNode>;
}

export default function Hero3DCarousel({
  componentPreviews,
}: Hero3DCarouselProps) {
  const featured = getFeaturedComponents();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative h-screen flex flex-col justify-between overflow-hidden">
      {/* Top bar */}
      <div className="h-20" />

      {/* Center: 3D card row */}
      <div className="flex-1 flex items-center">
        <div
          ref={scrollRef}
          className="flex gap-6 px-12 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none' }}
        >
          {featured.map((component, i) => (
            <motion.div
              key={component.slug}
              className="shrink-0 w-[280px]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              style={{
                transform: `perspective(1200px) rotateY(${(i - Math.floor(featured.length / 2)) * 4}deg)`,
              }}
            >
              <ComponentCard
                name={component.name}
                slug={component.slug}
                category={component.category}
                perspective
              >
                {componentPreviews[component.slug] || (
                  <div className="text-library-gray text-sm">
                    {component.name}
                  </div>
                )}
              </ComponentCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-end justify-between px-6 pb-6">
        <p className="font-[family-name:var(--font-instrument-serif)] italic text-lg text-black">
          A collection of components I find beautiful
        </p>
        <button
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
          }
          className="text-sm text-library-gray hover:text-black transition-colors flex items-center gap-1"
        >
          Scroll & explore
          <span className="text-xs">&#8595;</span>
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
pnpm type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shell/Hero3DCarousel.tsx
git commit -m "Add hero 3D carousel component"
```

---

## Task 7: Filter bar and component grid

Sticky filter bar with category toggles, and a responsive grid of component cards.

**Files:**
- Create: `src/components/shell/FilterBar.tsx`
- Create: `src/components/shell/ComponentGrid.tsx`

- [ ] **Step 1: Create the filter bar**

Create `src/components/shell/FilterBar.tsx`:

```tsx
'use client';

import {
  type ComponentCategory,
  CATEGORY_LABELS,
} from '@/lib/components-registry';

interface FilterBarProps {
  active: ComponentCategory | 'all';
  onChange: (category: ComponentCategory | 'all') => void;
}

const categories: (ComponentCategory | 'all')[] = [
  'all',
  'text',
  'animations',
  'components',
  'backgrounds',
  'blocks',
];

export default function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="sticky top-[68px] z-40 bg-white/80 backdrop-blur-sm border-b border-library-border">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex gap-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`text-sm transition-colors pb-1 border-b-2 ${
              active === cat
                ? 'text-black border-black'
                : 'text-library-gray border-transparent hover:text-black'
            }`}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the component grid**

Create `src/components/shell/ComponentGrid.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ComponentCard from './ComponentCard';
import FilterBar from './FilterBar';
import {
  type ComponentCategory,
  type ComponentEntry,
} from '@/lib/components-registry';

interface ComponentGridProps {
  components: ComponentEntry[];
  componentPreviews: Record<string, React.ReactNode>;
}

export default function ComponentGrid({
  components,
  componentPreviews,
}: ComponentGridProps) {
  const [filter, setFilter] = useState<ComponentCategory | 'all'>('all');

  const filtered =
    filter === 'all'
      ? components
      : components.filter(c => c.category === filter);

  return (
    <section>
      <FilterBar active={filter} onChange={setFilter} />
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map(component => (
              <motion.div
                key={component.slug}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ComponentCard
                  name={component.name}
                  slug={component.slug}
                  category={component.category}
                >
                  {componentPreviews[component.slug] || (
                    <div className="text-library-gray text-sm text-center">
                      {component.name}
                    </div>
                  )}
                </ComponentCard>
                <div className="mt-3">
                  <p className="text-sm font-medium text-black">
                    {component.name}
                  </p>
                  <p className="text-xs text-library-gray uppercase tracking-wider mt-0.5">
                    {component.category}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify both compile**

```bash
pnpm type-check
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shell/FilterBar.tsx src/components/shell/ComponentGrid.tsx
git commit -m "Add filter bar and component grid"
```

---

## Task 8: Component library landing page

Wire up the hero, filter bar, and grid into the `/components` page.

**Files:**
- Modify: `src/app/(library)/components/page.tsx`

- [ ] **Step 1: Add Instrument Serif CSS variable to the root layout**

In `src/app/layout.tsx`, we need the Instrument Serif font available as a CSS variable. Since it's a local font loaded via `@font-face` in globals.css, add a CSS variable for it. Add to the end of `src/app/globals.css`:

```css
:root {
  --font-instrument-serif: 'Instrument Serif', serif;
}
```

Note: if `:root` already exists in the file, add this variable inside it instead of creating a duplicate.

- [ ] **Step 2: Create the components landing page**

Replace `src/app/(library)/components/page.tsx` with:

```tsx
import { Metadata } from 'next';
import { componentRegistry } from '@/lib/components-registry';
import Hero3DCarousel from '@/components/shell/Hero3DCarousel';
import ComponentGrid from '@/components/shell/ComponentGrid';

export const metadata: Metadata = {
  title: 'Component Library | Dirck Mulder',
  description:
    'A curated collection of beautiful, interactive React components. Text animations, 3D effects, glassmorphism, and more.',
};

// Placeholder previews - will be replaced with actual components
const componentPreviews: Record<string, React.ReactNode> = {};

export default function ComponentsPage() {
  return (
    <>
      <Hero3DCarousel componentPreviews={componentPreviews} />
      <ComponentGrid
        components={componentRegistry}
        componentPreviews={componentPreviews}
      />
    </>
  );
}
```

- [ ] **Step 3: Verify the page renders**

```bash
pnpm dev
```

Visit `localhost:3000/components`. Should see the hero with featured cards (showing placeholder names), scroll down to see the filter bar and grid with all 60+ components listed.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(library\)/components/page.tsx src/app/globals.css
git commit -m "Wire up component library landing page with hero and grid"
```

---

## Task 9: Component detail page

Dynamic route that renders a full-page live demo for a single component.

**Files:**
- Create: `src/app/(library)/components/[slug]/page.tsx`

- [ ] **Step 1: Create the dynamic component detail page**

Create `src/app/(library)/components/[slug]/page.tsx`:

```tsx
import { Metadata } from 'next';
import Link from 'next/link';
import {
  componentRegistry,
  getComponentBySlug,
  getComponentsByCategory,
  CATEGORY_LABELS,
} from '@/lib/components-registry';
import ComponentCard from '@/components/shell/ComponentCard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return componentRegistry.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const component = getComponentBySlug(slug);
  if (!component) return { title: 'Not Found' };

  return {
    title: `${component.name} | Component Library | Dirck Mulder`,
    description: component.description,
  };
}

// Placeholder - will be replaced with actual component rendering
const componentPreviews: Record<string, React.ReactNode> = {};

export default async function ComponentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const component = getComponentBySlug(slug);

  if (!component) {
    return (
      <div className="pt-32 text-center">
        <h1 className="text-2xl font-[family-name:var(--font-instrument-serif)]">
          Component not found
        </h1>
      </div>
    );
  }

  const related = getComponentsByCategory(component.category)
    .filter(c => c.slug !== slug)
    .slice(0, 3);

  return (
    <div className="pt-24">
      {/* Demo area */}
      <section className="w-full min-h-[60vh] flex items-center justify-center bg-library-cream border-b border-library-border">
        {componentPreviews[slug] || (
          <div className="text-library-gray">
            Live demo: {component.name}
          </div>
        )}
      </section>

      {/* Info */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <h1 className="text-4xl font-[family-name:var(--font-instrument-serif)]">
          {component.name}
        </h1>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs text-library-gray uppercase tracking-wider">
            {CATEGORY_LABELS[component.category]}
          </span>
        </div>
        <p className="text-library-gray mt-4 max-w-xl">
          {component.description}
        </p>
        <Link
          href={`/blog/${slug}`}
          className="inline-block mt-6 text-sm text-black underline underline-offset-4 hover:no-underline transition-all"
        >
          Read the blog post
        </Link>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 pb-24">
          <h2 className="text-lg font-[family-name:var(--font-instrument-serif)] mb-8">
            Related components
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map(r => (
              <ComponentCard
                key={r.slug}
                name={r.name}
                slug={r.slug}
                category={r.category}
              >
                {componentPreviews[r.slug] || (
                  <div className="text-library-gray text-sm">{r.name}</div>
                )}
              </ComponentCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify routing works**

```bash
pnpm dev
```

Visit `localhost:3000/components/blur-text`. Should show the detail page with title, description, and related components.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(library\)/components/\[slug\]/page.tsx
git commit -m "Add dynamic component detail page"
```

---

## Task 10: Build sample component - Blur Text

A text component that fades in with a blur-to-sharp animation. This is the first actual library component.

**Files:**
- Create: `src/components/library/text-animations/BlurText.tsx`

- [ ] **Step 1: Create the library directory structure**

```bash
mkdir -p src/components/library/text-animations
mkdir -p src/components/library/animations
mkdir -p src/components/library/components
mkdir -p src/components/library/backgrounds
mkdir -p src/components/library/blocks
```

- [ ] **Step 2: Fetch the source code from reactbits.dev for reference**

Visit `https://reactbits.dev/text-animations/blur-text` and study the component API and behavior. The component animates text by fading each word/character from blurred to sharp.

- [ ] **Step 3: Build the BlurText component**

Create `src/components/library/text-animations/BlurText.tsx`:

```tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'characters';
  direction?: 'top' | 'bottom';
}

export default function BlurText({
  text,
  delay = 0.05,
  className = '',
  animateBy = 'words',
  direction = 'bottom',
}: BlurTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const segments =
    animateBy === 'words' ? text.split(' ') : text.split('');

  const yOffset = direction === 'top' ? -20 : 20;

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      {segments.map((segment, i) => (
        <motion.span
          key={i}
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
          className="inline-block"
        >
          {segment}
          {animateBy === 'words' && i < segments.length - 1 && (
            <span>&nbsp;</span>
          )}
        </motion.span>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Verify it compiles**

```bash
pnpm type-check
```

- [ ] **Step 5: Commit**

```bash
git add src/components/library/text-animations/BlurText.tsx
git commit -m "Add BlurText component"
```

---

## Task 11: Build sample component - Glitch Text

Text with a digital glitch distortion effect using CSS clip-path and pseudo-elements.

**Files:**
- Create: `src/components/library/text-animations/GlitchText.tsx`

- [ ] **Step 1: Build the GlitchText component**

Create `src/components/library/text-animations/GlitchText.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  speed?: number;
  enableShadow?: boolean;
}

export default function GlitchText({
  text,
  className = '',
  speed = 500,
  enableShadow = true,
}: GlitchTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const style = document.createElement('style');
    const id = `glitch-${Math.random().toString(36).slice(2, 8)}`;
    container.setAttribute('data-glitch-id', id);

    style.textContent = `
      [data-glitch-id="${id}"] {
        position: relative;
        display: inline-block;
      }

      [data-glitch-id="${id}"]::before,
      [data-glitch-id="${id}"]::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      [data-glitch-id="${id}"]::before {
        color: #ff0000;
        animation: glitch-before-${id} ${speed}ms infinite linear alternate-reverse;
        clip-path: inset(0 0 60% 0);
        ${enableShadow ? 'text-shadow: -2px 0 #ff0000;' : ''}
      }

      [data-glitch-id="${id}"]::after {
        color: #0000ff;
        animation: glitch-after-${id} ${speed}ms infinite linear alternate-reverse;
        clip-path: inset(40% 0 0 0);
        ${enableShadow ? 'text-shadow: 2px 0 #0000ff;' : ''}
      }

      @keyframes glitch-before-${id} {
        0% { clip-path: inset(0 0 80% 0); transform: translate(-2px, -1px); }
        20% { clip-path: inset(20% 0 60% 0); transform: translate(2px, 1px); }
        40% { clip-path: inset(40% 0 40% 0); transform: translate(-1px, 2px); }
        60% { clip-path: inset(60% 0 20% 0); transform: translate(1px, -2px); }
        80% { clip-path: inset(10% 0 70% 0); transform: translate(-2px, 1px); }
        100% { clip-path: inset(30% 0 50% 0); transform: translate(2px, -1px); }
      }

      @keyframes glitch-after-${id} {
        0% { clip-path: inset(60% 0 0 0); transform: translate(2px, 1px); }
        20% { clip-path: inset(40% 0 20% 0); transform: translate(-2px, -1px); }
        40% { clip-path: inset(20% 0 40% 0); transform: translate(1px, -2px); }
        60% { clip-path: inset(50% 0 10% 0); transform: translate(-1px, 2px); }
        80% { clip-path: inset(70% 0 5% 0); transform: translate(2px, -1px); }
        100% { clip-path: inset(80% 0 0 0); transform: translate(-2px, 1px); }
      }
    `;

    document.head.appendChild(style);
    return () => style.remove();
  }, [speed, enableShadow]);

  return (
    <div ref={containerRef} data-text={text} className={className}>
      {text}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
pnpm type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/library/text-animations/GlitchText.tsx
git commit -m "Add GlitchText component"
```

---

## Task 12: Build sample component - Electric Border

An animated border with an electric current traveling along it.

**Files:**
- Create: `src/components/library/animations/ElectricBorder.tsx`

- [ ] **Step 1: Build the ElectricBorder component**

Create `src/components/library/animations/ElectricBorder.tsx`:

```tsx
'use client';

interface ElectricBorderProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  color?: string;
  borderRadius?: string;
  borderWidth?: number;
}

export default function ElectricBorder({
  children,
  className = '',
  duration = 3,
  color = '#ffffff',
  borderRadius = '12px',
  borderWidth = 2,
}: ElectricBorderProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ borderRadius }}
    >
      {/* Animated border */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <div
          className="absolute inset-0"
          style={{
            borderRadius,
            padding: `${borderWidth}px`,
            background: `conic-gradient(from 0deg, transparent 0%, ${color} 10%, transparent 20%)`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: `electric-spin ${duration}s linear infinite`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative" style={{ borderRadius }}>
        {children}
      </div>

      <style>{`
        @keyframes electric-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
pnpm type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/library/animations/ElectricBorder.tsx
git commit -m "Add ElectricBorder component"
```

---

## Task 13: Build sample component - Tilted Card (library version)

A 3D card that tilts based on cursor position. The portfolio already has a TiltedCard but this is a clean library version.

**Files:**
- Create: `src/components/library/components/TiltedCard.tsx`

- [ ] **Step 1: Build the library TiltedCard**

Create `src/components/library/components/TiltedCard.tsx`:

```tsx
'use client';

import { useRef, useState } from 'react';

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  perspective?: number;
  glareEnable?: boolean;
  glareMaxOpacity?: number;
}

export default function TiltedCard({
  children,
  className = '',
  maxTilt = 15,
  scale = 1.05,
  perspective = 1000,
  glareEnable = true,
  glareMaxOpacity = 0.2,
}: TiltedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [glareStyle, setGlareStyle] = useState({
    opacity: 0,
    background: '',
  });

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

    if (glareEnable) {
      const angle = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI) + 180;
      setGlareStyle({
        opacity: glareMaxOpacity,
        background: `linear-gradient(${angle}deg, rgba(255,255,255,${glareMaxOpacity}) 0%, transparent 80%)`,
      });
    }
  }

  function handleMouseLeave() {
    setTransform('');
    setGlareStyle({ opacity: 0, background: '' });
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-transform duration-200 ease-out ${className}`}
      style={{ transform: transform || undefined }}
    >
      {children}
      {glareEnable && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            opacity: glareStyle.opacity,
            background: glareStyle.background,
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
pnpm type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/library/components/TiltedCard.tsx
git commit -m "Add TiltedCard library component"
```

---

## Task 14: Build sample component - Line Waves

Animated wavy lines as a background effect using canvas.

**Files:**
- Create: `src/components/library/backgrounds/LineWaves.tsx`

- [ ] **Step 1: Build the LineWaves component**

Create `src/components/library/backgrounds/LineWaves.tsx`:

```tsx
'use client';

import { useRef, useEffect } from 'react';

interface LineWavesProps {
  lineCount?: number;
  lineColor?: string;
  lineWidth?: number;
  amplitude?: number;
  frequency?: number;
  speed?: number;
  className?: string;
}

export default function LineWaves({
  lineCount = 8,
  lineColor = '#e5e5e5',
  lineWidth = 1,
  amplitude = 40,
  frequency = 0.02,
  speed = 0.02,
  className = '',
}: LineWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;

      const spacing = h / (lineCount + 1);

      for (let i = 1; i <= lineCount; i++) {
        const baseY = spacing * i;
        ctx.beginPath();

        for (let x = 0; x <= w; x++) {
          const y =
            baseY +
            Math.sin(x * frequency + offsetRef.current + i * 0.8) *
              amplitude *
              (1 - Math.abs(i - lineCount / 2) / lineCount);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      offsetRef.current += speed;
      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [lineCount, lineColor, lineWidth, amplitude, frequency, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
    />
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
pnpm type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/library/backgrounds/LineWaves.tsx
git commit -m "Add LineWaves background component"
```

---

## Task 15: Build sample component - MacBook Scroll

A MacBook that opens as you scroll, revealing content on the screen. Adapted from aceternity.

**Files:**
- Create: `src/components/library/blocks/MacbookScroll.tsx`

- [ ] **Step 1: Build the MacbookScroll component**

Create `src/components/library/blocks/MacbookScroll.tsx`:

```tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface MacbookScrollProps {
  src: string;
  title?: string;
  showGradient?: boolean;
  className?: string;
}

export default function MacbookScroll({
  src,
  title,
  showGradient = true,
  className = '',
}: MacbookScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const scaleX = useTransform(
    scrollYProgress,
    [0, 0.3],
    [1.2, isMobile ? 1 : 1.5]
  );
  const scaleY = useTransform(
    scrollYProgress,
    [0, 0.3],
    [0.6, isMobile ? 1 : 1.5]
  );
  const rotate = useTransform(
    scrollYProgress,
    [0.1, 0.12, 0.3],
    [-28, -28, 0]
  );
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);

  return (
    <div
      ref={ref}
      className={`flex min-h-[200vh] flex-col items-center justify-start py-20 md:py-80 [perspective:800px] ${className}`}
    >
      <motion.h2
        style={{ translateY: textY, opacity: textOpacity }}
        className="mb-20 text-center text-3xl font-bold text-black"
      >
        {title || 'Scroll to reveal'}
      </motion.h2>

      {/* Lid */}
      <div className="relative [perspective:800px]">
        <div
          style={{
            transform: 'perspective(800px) rotateX(-25deg) translateZ(0px)',
            transformOrigin: 'bottom',
            transformStyle: 'preserve-3d',
          }}
          className="relative h-[12rem] w-[32rem] rounded-2xl bg-[#010101] p-2"
        >
          <div
            style={{ boxShadow: '0px 2px 0px 2px #171717 inset' }}
            className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#010101]"
          >
            <span className="text-white text-sm font-medium">DM</span>
          </div>
        </div>

        <motion.div
          style={{
            scaleX,
            scaleY,
            rotateX: rotate,
            transformStyle: 'preserve-3d',
            transformOrigin: 'top',
          }}
          className="absolute inset-0 h-96 w-[32rem] rounded-2xl bg-[#010101] p-2"
        >
          <div className="absolute inset-0 rounded-lg bg-[#272729]" />
          <img
            src={src}
            alt="screen content"
            className="absolute inset-0 h-full w-full rounded-lg object-cover object-left-top"
          />
        </motion.div>
      </div>

      {/* Base */}
      <div className="relative -z-10 h-[22rem] w-[32rem] overflow-hidden rounded-2xl bg-gray-200">
        <div className="relative h-10 w-full">
          <div className="absolute inset-x-0 mx-auto h-4 w-[80%] bg-[#050505]" />
        </div>
        <div className="mx-auto my-1 h-32 w-[40%] rounded-xl" style={{ boxShadow: '0px 0px 1px 1px #00000020 inset' }} />
        <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tl-3xl rounded-tr-3xl bg-gradient-to-t from-[#272729] to-[#050505]" />
        {showGradient && (
          <div className="absolute inset-x-0 bottom-0 h-40 w-full bg-gradient-to-t from-white via-white to-transparent" />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
pnpm type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/library/blocks/MacbookScroll.tsx
git commit -m "Add MacbookScroll block component"
```

---

## Task 16: Wire sample components into the preview system

Create a preview map that connects component slugs to their live React renderings, and use it in both the landing page and detail pages.

**Files:**
- Create: `src/lib/component-previews.tsx`
- Modify: `src/app/(library)/components/page.tsx`
- Modify: `src/app/(library)/components/[slug]/page.tsx`

- [ ] **Step 1: Create the component previews map**

Create `src/lib/component-previews.tsx`:

```tsx
import BlurText from '@/components/library/text-animations/BlurText';
import GlitchText from '@/components/library/text-animations/GlitchText';
import ElectricBorder from '@/components/library/animations/ElectricBorder';
import TiltedCard from '@/components/library/components/TiltedCard';
import LineWaves from '@/components/library/backgrounds/LineWaves';
import MacbookScroll from '@/components/library/blocks/MacbookScroll';

// Mini previews for cards (smaller, contained versions)
export const cardPreviews: Record<string, React.ReactNode> = {
  'blur-text': (
    <BlurText
      text="Hello World"
      className="text-2xl font-bold text-black"
    />
  ),
  'glitch-text': (
    <GlitchText text="GLITCH" className="text-3xl font-bold text-black" />
  ),
  'electric-border': (
    <ElectricBorder color="#000" duration={2}>
      <div className="px-6 py-4 bg-black text-white text-sm rounded-xl">
        Electric
      </div>
    </ElectricBorder>
  ),
  'tilted-card': (
    <TiltedCard className="w-32 h-24 bg-black rounded-lg flex items-center justify-center">
      <span className="text-white text-xs">Hover me</span>
    </TiltedCard>
  ),
  'line-waves': (
    <div className="w-full h-full">
      <LineWaves lineCount={5} amplitude={20} />
    </div>
  ),
  'macbook-scroll': (
    <div className="w-24 h-16 bg-[#010101] rounded-md flex items-center justify-center">
      <span className="text-white text-[8px]">MacBook</span>
    </div>
  ),
};

// Full-size demos for detail pages
export const fullDemos: Record<string, React.ReactNode> = {
  'blur-text': (
    <div className="flex flex-col items-center gap-8 p-12">
      <BlurText
        text="This text fades in with a blur effect"
        className="text-4xl font-bold text-black font-[family-name:var(--font-instrument-serif)]"
        animateBy="words"
      />
      <BlurText
        text="Character by character"
        className="text-2xl text-library-gray"
        animateBy="characters"
        delay={0.03}
      />
    </div>
  ),
  'glitch-text': (
    <div className="flex flex-col items-center gap-8 p-12">
      <GlitchText
        text="DIGITAL GLITCH"
        className="text-5xl font-bold text-black"
      />
      <GlitchText
        text="Subtle version"
        className="text-2xl text-library-gray"
        speed={1000}
        enableShadow={false}
      />
    </div>
  ),
  'electric-border': (
    <div className="flex flex-col items-center gap-8 p-12 bg-black rounded-xl">
      <ElectricBorder color="#ffffff" duration={2}>
        <div className="px-12 py-8 text-white text-lg">
          Electric Border Effect
        </div>
      </ElectricBorder>
      <ElectricBorder color="#3b82f6" duration={4} borderRadius="9999px">
        <div className="px-8 py-3 text-white text-sm">
          Rounded with blue
        </div>
      </ElectricBorder>
    </div>
  ),
  'tilted-card': (
    <div className="flex items-center justify-center gap-8 p-12">
      <TiltedCard className="w-64 h-80 bg-library-cream rounded-2xl border border-library-border flex items-center justify-center shadow-lg">
        <span className="text-black text-lg font-[family-name:var(--font-instrument-serif)]">
          Hover & tilt
        </span>
      </TiltedCard>
    </div>
  ),
  'line-waves': (
    <div className="w-full h-[400px]">
      <LineWaves lineCount={10} lineColor="#000" amplitude={50} />
    </div>
  ),
  'macbook-scroll': (
    <MacbookScroll
      src="/projects/teckit.svg"
      title="Scroll down to open"
    />
  ),
};
```

- [ ] **Step 2: Update the components landing page to use previews**

Replace `src/app/(library)/components/page.tsx` with:

```tsx
import { Metadata } from 'next';
import { componentRegistry } from '@/lib/components-registry';
import Hero3DCarousel from '@/components/shell/Hero3DCarousel';
import ComponentGrid from '@/components/shell/ComponentGrid';
import { cardPreviews } from '@/lib/component-previews';

export const metadata: Metadata = {
  title: 'Component Library | Dirck Mulder',
  description:
    'A curated collection of beautiful, interactive React components. Text animations, 3D effects, glassmorphism, and more.',
};

export default function ComponentsPage() {
  return (
    <>
      <Hero3DCarousel componentPreviews={cardPreviews} />
      <ComponentGrid
        components={componentRegistry}
        componentPreviews={cardPreviews}
      />
    </>
  );
}
```

- [ ] **Step 3: Update the component detail page to use full demos**

In `src/app/(library)/components/[slug]/page.tsx`, replace the placeholder `componentPreviews` with imports from the previews file. Change the import at the top:

```tsx
import { fullDemos, cardPreviews } from '@/lib/component-previews';
```

Replace the demo area section:

```tsx
<section className="w-full min-h-[60vh] flex items-center justify-center bg-library-cream border-b border-library-border">
  {fullDemos[slug] || (
    <div className="text-library-gray">
      Live demo coming soon: {component.name}
    </div>
  )}
</section>
```

And replace related component rendering to use `cardPreviews`:

```tsx
{related.map(r => (
  <ComponentCard
    key={r.slug}
    name={r.name}
    slug={r.slug}
    category={r.category}
  >
    {cardPreviews[r.slug] || (
      <div className="text-library-gray text-sm">{r.name}</div>
    )}
  </ComponentCard>
))}
```

Remove the old `const componentPreviews` placeholder line.

- [ ] **Step 4: Verify everything builds**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/component-previews.tsx src/app/\(library\)/components/page.tsx src/app/\(library\)/components/\[slug\]/page.tsx
git commit -m "Wire sample components into preview system"
```

---

## Task 17: Blog system - MDX setup

Install and configure MDX for blog posts with embedded live component demos.

**Files:**
- Modify: `package.json` (install dependencies)
- Create: `src/lib/blog-utils.ts`
- Create: `src/components/shell/CodeBlock.tsx`
- Create: `src/components/shell/BlogPostLayout.tsx`

- [ ] **Step 1: Install MDX dependencies**

```bash
cd /Users/dirck.mulder/Documents/dirck_projects/portfolio_website
pnpm add next-mdx-remote gray-matter reading-time
pnpm add -D @types/mdx
```

- [ ] **Step 2: Create blog utilities**

Create `src/lib/blog-utils.ts`:

```ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  componentSlug: string;
  readingTime: string;
  content: string;
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));

  return files
    .map(file => {
      const slug = file.replace('.mdx', '');
      return getBlogPost(slug);
    })
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date || new Date().toISOString(),
    category: data.category || 'components',
    componentSlug: data.componentSlug || slug,
    readingTime: stats.text,
    content,
  };
}
```

- [ ] **Step 3: Create the CodeBlock component**

Create `src/components/shell/CodeBlock.tsx`:

```tsx
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
    <div className="relative rounded-lg bg-library-code overflow-hidden my-6">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs text-white/40 font-[family-name:var(--font-jetbrains-mono)]">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-white/40 hover:text-white/80 transition-colors"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-white/90 font-[family-name:var(--font-jetbrains-mono)] leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  );
}
```

- [ ] **Step 4: Create the blog post layout component**

Create `src/components/shell/BlogPostLayout.tsx`:

```tsx
import Link from 'next/link';
import type { BlogPost } from '@/lib/blog-utils';

interface BlogPostLayoutProps {
  post: BlogPost;
  demo?: React.ReactNode;
  children: React.ReactNode;
}

export default function BlogPostLayout({
  post,
  demo,
  children,
}: BlogPostLayoutProps) {
  return (
    <article className="pt-24 pb-20">
      {/* Header */}
      <header className="max-w-[720px] mx-auto px-6 mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-library-gray uppercase tracking-wider">
            {post.category}
          </span>
          <span className="text-library-border">|</span>
          <time className="text-xs text-library-gray">{post.date}</time>
          <span className="text-library-border">|</span>
          <span className="text-xs text-library-gray">{post.readingTime}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-instrument-serif)] text-black leading-tight">
          {post.title}
        </h1>
        <p className="mt-4 text-library-gray text-lg">{post.description}</p>
      </header>

      {/* Live demo */}
      {demo && (
        <section className="w-full bg-library-cream border-y border-library-border mb-12">
          <div className="max-w-[1200px] mx-auto min-h-[300px] flex items-center justify-center py-12">
            {demo}
          </div>
        </section>
      )}

      {/* Content */}
      <div className="max-w-[720px] mx-auto px-6 prose prose-neutral prose-lg">
        {children}
      </div>

      {/* Footer */}
      <footer className="max-w-[720px] mx-auto px-6 mt-16 pt-8 border-t border-library-border">
        <Link
          href={`/components/${post.componentSlug}`}
          className="text-sm text-black underline underline-offset-4 hover:no-underline"
        >
          View {post.title} component
        </Link>
      </footer>
    </article>
  );
}
```

- [ ] **Step 5: Verify everything compiles**

```bash
pnpm type-check
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/blog-utils.ts src/components/shell/CodeBlock.tsx src/components/shell/BlogPostLayout.tsx package.json pnpm-lock.yaml
git commit -m "Set up MDX blog system with code blocks and post layout"
```

---

## Task 18: Blog pages

The blog listing page and individual blog post rendering.

**Files:**
- Modify: `src/app/(library)/blog/page.tsx`
- Create: `src/app/(library)/blog/[slug]/page.tsx`
- Create: `src/content/blog/blur-text.mdx`

- [ ] **Step 1: Create the content directory and sample blog post**

```bash
mkdir -p src/content/blog
```

Create `src/content/blog/blur-text.mdx`:

```mdx
---
title: "Build a Blur Text Animation in React"
description: "Create a smooth blur-to-sharp text reveal effect using Framer Motion. Each word or character fades from blurred to crisp on scroll."
date: "2026-04-06"
category: "Text Animations"
componentSlug: "blur-text"
---

## What it does

The Blur Text component animates text by transitioning each word or character from a blurred, transparent state to sharp and fully visible. The animation triggers when the element scrolls into view.

## How it works

The component splits the input text into segments (words or characters) and wraps each in a `motion.span` from Framer Motion. Each segment starts with `filter: blur(12px)` and `opacity: 0`, then animates to `filter: blur(0px)` and `opacity: 1` with a staggered delay.

The `useInView` hook from Framer Motion detects when the component enters the viewport, triggering the animation only once.

## Key properties

- **text** - The string to animate
- **animateBy** - Split by `words` or `characters`
- **delay** - Stagger delay between each segment (default: 0.05s)
- **direction** - Animate from `top` or `bottom`

## When to use it

This works well for hero headings, section titles, or any text that should feel like it's materializing on screen. The blur effect adds a sense of depth that a simple fade-in lacks.

Keep the delay subtle (0.03-0.08s) for natural reading flow. Going too slow makes users wait; too fast and you lose the effect.
```

- [ ] **Step 2: Create the blog listing page**

Replace `src/app/(library)/blog/page.tsx` with:

```tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog-utils';

export const metadata: Metadata = {
  title: 'Blog | Dirck Mulder',
  description:
    'Tutorials on building beautiful, interactive React components. Text animations, 3D effects, glassmorphism, and more.',
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="pt-24 pb-20 max-w-[720px] mx-auto px-6">
      <h1 className="text-3xl font-[family-name:var(--font-instrument-serif)] mb-16">
        Blog
      </h1>

      {posts.length === 0 ? (
        <p className="text-library-gray">No posts yet.</p>
      ) : (
        <div className="flex flex-col">
          {posts.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group no-underline py-6 border-b border-library-border first:pt-0 last:border-0"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-library-gray uppercase tracking-wider">
                  {post.category}
                </span>
                <span className="text-library-border">|</span>
                <time className="text-xs text-library-gray">{post.date}</time>
              </div>
              <h2 className="text-xl font-[family-name:var(--font-instrument-serif)] text-black group-hover:underline underline-offset-4">
                {post.title}
              </h2>
              <p className="text-sm text-library-gray mt-1">
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create the blog post page**

Create `src/app/(library)/blog/[slug]/page.tsx`:

```tsx
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllBlogPosts, getBlogPost } from '@/lib/blog-utils';
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

const mdxComponents = {
  code: ({ children, className }: { children: string; className?: string }) => {
    const language = className?.replace('language-', '') || 'tsx';
    return <CodeBlock code={children} language={language} />;
  },
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-[family-name:var(--font-instrument-serif)] mt-12 mb-4">
      {children}
    </h2>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-black/80 leading-relaxed mb-4">{children}</p>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-black/80 leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-black">{children}</strong>
  ),
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className="pt-32 text-center">
        <h1 className="text-2xl font-[family-name:var(--font-instrument-serif)]">
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

- [ ] **Step 4: Verify the blog builds**

```bash
pnpm build
```

Visit `localhost:3000/blog` (should show the blur-text post), and `localhost:3000/blog/blur-text` (should show the full blog post with live demo).

- [ ] **Step 5: Commit**

```bash
git add src/content/blog/ src/app/\(library\)/blog/
git commit -m "Add blog listing and post pages with sample blur-text post"
```

---

## Task 19: SEO foundations

Add sitemap, robots.txt, and proper metadata.

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Modify: `src/app/layout.tsx` (metadata)

- [ ] **Step 1: Create the sitemap generator**

Create `src/app/sitemap.ts`:

```ts
import { MetadataRoute } from 'next';
import { componentRegistry } from '@/lib/components-registry';
import { getAllBlogPosts } from '@/lib/blog-utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dirckmulder.com';

  const componentPages = componentRegistry.map(c => ({
    url: `${baseUrl}/components/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const blogPosts = getAllBlogPosts().map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/components`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...componentPages,
    ...blogPosts,
  ];
}
```

- [ ] **Step 2: Create robots.txt**

Create `src/app/robots.ts`:

```ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://dirckmulder.com/sitemap.xml',
  };
}
```

- [ ] **Step 3: Update root metadata**

In `src/app/layout.tsx`, update the metadata:

```ts
export const metadata: Metadata = {
  title: {
    default: 'Dirck Mulder | Designer & Developer',
    template: '%s | Dirck Mulder',
  },
  description:
    'Designer and developer building beautiful interactive experiences. Component library, blog, and portfolio.',
  metadataBase: new URL('https://dirckmulder.com'),
};
```

- [ ] **Step 4: Verify build**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts src/app/layout.tsx
git commit -m "Add sitemap, robots.txt, and SEO metadata"
```

---

## Task 20: Final integration test

Verify everything works together end-to-end.

- [ ] **Step 1: Run the full build**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Start the production server and verify all routes**

```bash
pnpm start
```

Verify these routes:
- `localhost:3000` - Portfolio (existing, with Header/Footer)
- `localhost:3000/components` - Component library landing (hero + grid, minimal header)
- `localhost:3000/components/blur-text` - Blur Text detail page with live demo
- `localhost:3000/components/glitch-text` - Glitch Text detail page
- `localhost:3000/components/electric-border` - Electric Border detail page
- `localhost:3000/blog` - Blog listing with 1 post
- `localhost:3000/blog/blur-text` - Blog post with embedded demo

- [ ] **Step 3: Verify filter bar works**

On `/components`, click each category filter. Components should filter with smooth animation.

- [ ] **Step 4: Verify 3D card hover effects work**

On `/components`, hover over cards in the hero. They should tilt and show the glassmorphic overlay.

- [ ] **Step 5: Commit final state**

```bash
git add -A
git commit -m "Complete Phase 1: component library shell, 6 sample components, blog system"
```

---

## Summary

**Phase 1 delivers:**
- Route group architecture separating portfolio from library
- Monochrome design system (Abhijit-inspired)
- 3D hero carousel with perspective-tilted cards
- Filterable component grid
- Component detail pages with live demos
- 6 working sample components: BlurText, GlitchText, ElectricBorder, TiltedCard, LineWaves, MacbookScroll
- MDX blog system with 1 sample post
- SEO foundations (sitemap, robots, metadata)

**Phase 2 (separate plan):** Build remaining ~55 components
**Phase 3 (separate plan):** Write all blog posts with SEO optimization
