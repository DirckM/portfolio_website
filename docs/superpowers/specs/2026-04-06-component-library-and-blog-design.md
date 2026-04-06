# Component Library & Blog - Design Spec

## Overview

A commercial component library and SEO-optimized blog, integrated as routes within the existing portfolio website at dirckmulder.com. Components are rebuilt from scratch based on curated references from reactbits.dev, aceternity, and fancycomponents.dev. The house style is inspired by [abhijitrout.in](https://www.abhijitrout.in/) - clean monochrome minimalism with bold motion, 3D perspective, and generous whitespace.

## Goals

1. Showcase 60+ interactive React components in a polished, unified design
2. Drive organic traffic via SEO-optimized blog posts (one per component)
3. Establish Dirck as a designer/developer through the quality of the library
4. Prepare for future monetization (code view paywall - deferred)

## Routes

```
dirckmulder.com/
  /components                    -> Component library landing (hero + filterable grid)
  /components/[slug]             -> Individual component detail page (live demo)
  /blog                          -> Blog listing page
  /blog/[slug]                   -> Individual blog post (SEO-optimized tutorial)
```

## Tech Stack

- Next.js (existing portfolio app)
- Tailwind CSS
- Framer Motion / Motion for animations
- TypeScript
- Instrument Serif + Inter + JetBrains Mono (code)
- MDX for blog content (allows embedding live component demos within posts)
- next-mdx-remote or @next/mdx for MDX rendering

## Design System

### Colors

| Token            | Value     | Usage                                      |
|------------------|-----------|--------------------------------------------|
| bg-primary       | `#ffffff` | Main background                            |
| bg-secondary     | `#f5f5f0` | Alternating sections, card backgrounds     |
| bg-dark          | `#000000` | Dark sections, some component demo areas   |
| text-primary     | `#000000` | Headings, body text                        |
| text-secondary   | `#6b6b6b` | Descriptions, metadata, muted text         |
| border           | `#e5e5e5` | Subtle borders on cards, dividers          |
| code-bg          | `#1a1a1a` | Code block backgrounds in blog posts       |

No accent color. Purely monochrome. The components themselves provide color.

### Typography

| Role        | Font             | Usage                                          |
|-------------|------------------|-------------------------------------------------|
| Display     | Instrument Serif | Hero text (italic), section titles, blog titles |
| Body/UI     | Inter            | Navigation, descriptions, filters, blog body    |
| Code        | JetBrains Mono   | Code snippets in blog posts                     |

### Spacing

- Generous whitespace throughout
- Max content width: ~1200px, centered
- Section gaps: 120-160px vertical
- Filter bar: sticky on scroll
- Blog body: max 720px single column

### Card Style

- White or off-white background with subtle `#e5e5e5` border
- Live component preview running inside
- Component name in Inter below the preview
- Category tag in small caps
- Hover: subtle lift + shadow, 3D tilt toward cursor
- Glassmorphic overlay on hover with name + category (dark frosted glass with backdrop blur)

## Page Designs

### /components - Landing Page

#### Hero (Full Viewport Height)

- **Top-left:** Brand name / site identity
- **Top-right:** Tagline or contextual info
- **Center:** Horizontal row of 8-10 3D perspective-tilted cards
  - Each card shows a live mini-preview of a featured component
  - Cards are slightly rotated in 3D with soft shadows on white background
  - Horizontal scroll or drag interaction
  - Hover: card tilts toward cursor, glassmorphic overlay appears with component name + category
  - Click: navigates to `/components/[slug]`
- **Bottom-left:** Tagline in Instrument Serif italic (e.g. "A collection of components I find beautiful")
- **Bottom-right:** "Scroll & explore" with down arrow

#### Filter Bar

- Appears below the hero as user scrolls
- Sticky horizontal bar
- Categories: "All", "Text", "Animations", "Components", "Backgrounds", "Blocks"
- Clean Inter text, underline or bold on active filter
- No colored pills - just minimal text toggles

#### Component Grid

- 2-3 column responsive grid (3 on desktop, 2 on tablet, 1 on mobile)
- Each cell: live component demo in a contained card
- Component name + category below each card
- Consistent aspect ratio across cards
- Smooth filter transitions (fade/scale)

### /components/[slug] - Component Detail Page

- Full-width live demo area (component runs at full scale, interactive)
- Title in Instrument Serif
- Category tag + one-line description in Inter below
- "Read the blog post" link to the corresponding blog entry
- Related components section at the bottom (3-4 cards from the same category)

### /blog - Blog Listing

- Clean editorial list layout (not a grid)
- Each entry: title in Instrument Serif, date + category in muted Inter, one-line excerpt
- Sorted by date, filterable by component category
- Minimal, magazine-index feel

### /blog/[slug] - Blog Post

- Single column, max 720px centered
- **Hero area:** Component name in large Instrument Serif, category tag, publication date
- **Live demo** embedded at the top of the post
- **Body:** Tutorial-style content
  - What the component does
  - How it's built (technical walkthrough)
  - Design decisions and use cases
  - Code snippets with syntax highlighting
- **Code blocks:** Dark background (`#1a1a1a`), syntax highlighted, copy button
- **Footer:** Link back to `/components/[slug]`, related posts, author credit

### SEO Strategy

- **Title format:** "Build a [Component Name] in React | Dirck Mulder"
- **Meta descriptions:** Unique per post, targeting specific search terms
- **Keywords:** Each post targets a specific phrase (e.g. "react glitch text effect", "animated card component tailwind")
- **Open Graph images:** Auto-generated showing the component
- **Schema markup:** Article/Tutorial structured data
- **Sitemap:** Auto-generated by Next.js
- **Internal linking:** Component pages link to blog posts and vice versa

## Component Inventory

### Text Animations (~17)

| Component          | Source Reference                                    |
|--------------------|-----------------------------------------------------|
| Split Text         | reactbits.dev/text-animations/split-text            |
| Blur Text          | reactbits.dev/text-animations/blur-text             |
| Circular Text      | reactbits.dev/text-animations/circular-text         |
| Text Type          | reactbits.dev/text-animations/text-type             |
| Shuffle            | reactbits.dev/text-animations/shuffle               |
| Shiny Text         | reactbits.dev/text-animations/shiny-text            |
| Text Pressure      | reactbits.dev/text-animations/text-pressure         |
| Curved Loop        | reactbits.dev/text-animations/curved-loop           |
| Falling Text       | reactbits.dev/text-animations/falling-text          |
| Decrypted Text     | reactbits.dev/text-animations/decrypted-text        |
| True Focus         | reactbits.dev/text-animations/true-focus            |
| Scroll Float       | reactbits.dev/text-animations/scroll-float          |
| Scroll Reveal      | reactbits.dev/text-animations/scroll-reveal         |
| ASCII Text         | reactbits.dev/text-animations/ascii-text            |
| Scrambled Text     | reactbits.dev/text-animations/scrambled-text        |
| Rotating Text      | reactbits.dev/text-animations/rotating-text         |
| Glitch Text        | reactbits.dev/text-animations/glitch-text           |
| Variable Proximity | reactbits.dev/text-animations/variable-proximity    |
| Scroll Velocity    | reactbits.dev/text-animations/scroll-velocity       |
| Letter Swap        | fancycomponents.dev (letter-swap-forward/pingpong)  |

### Animations (~13)

| Component       | Source Reference                              |
|-----------------|-----------------------------------------------|
| Electric Border | reactbits.dev/animations/electric-border      |
| Glare Hover     | reactbits.dev/animations/glare-hover          |
| Antigravity     | reactbits.dev/animations/antigravity          |
| Logo Loop       | reactbits.dev/animations/logo-loop            |
| Target Cursor   | reactbits.dev/animations/target-cursor        |
| Magic Rings     | reactbits.dev/animations/magic-rings          |
| Magnet          | reactbits.dev/animations/magnet               |
| Pixel Trail     | reactbits.dev/animations/pixel-trail          |
| Metallic Paint  | reactbits.dev/animations/metallic-paint       |
| Shape Blur      | reactbits.dev/animations/shape-blur           |
| Crosshair       | reactbits.dev/animations/crosshair            |
| Meta Balls      | reactbits.dev/animations/meta-balls           |

### Components (~17)

| Component        | Source Reference                               |
|------------------|------------------------------------------------|
| Animated List    | reactbits.dev/components/animated-list         |
| Scroll Stack     | reactbits.dev/components/scroll-stack          |
| Magic Bento      | reactbits.dev/components/magic-bento           |
| Circular Gallery | reactbits.dev/components/circular-gallery      |
| Reflective Card  | reactbits.dev/components/reflective-card       |
| Fluid Glass      | reactbits.dev/components/fluid-glass           |
| Tilted Card      | reactbits.dev/components/tilted-card           |
| Glass Surface    | reactbits.dev/components/glass-surface         |
| Dome Gallery     | reactbits.dev/components/dome-gallery          |
| Folder           | reactbits.dev/components/folder                |
| Lanyard          | reactbits.dev/components/lanyard               |
| Dock             | reactbits.dev/components/dock                  |
| Pixel Card       | reactbits.dev/components/pixel-card            |
| Border Glow      | reactbits.dev/components/border-glow           |
| Flowing Menu     | reactbits.dev/components/flowing-menu          |
| Elastic Slider   | reactbits.dev/components/elastic-slider        |
| Infinite Menu    | reactbits.dev/components/infinite-menu         |

### Backgrounds (~2)

| Component      | Source Reference                          |
|----------------|-------------------------------------------|
| Line Waves     | reactbits.dev/backgrounds/line-waves      |
| Scroll Velocity| reactbits.dev/text-animations/scroll-velocity (background use) |

### Blocks (~5)

| Component            | Source Reference                        |
|----------------------|-----------------------------------------|
| Circling Elements    | fancycomponents.dev                     |
| Marquee SVG Path     | fancycomponents.dev                     |
| Pixel Trail (Block)  | fancycomponents.dev                     |
| Parallax Floating    | fancycomponents.dev                     |
| MacBook Scroll       | ui.aceternity.com/components            |
| Terminal             | ui.aceternity.com/components/terminal   |
| World Map            | ui.aceternity.com/components/world-map  |

## Deferred Features

- **Code view with paywall:** Slider toggle between "View" and "Code" on component pages, code locked behind payment. Payment provider TBD (Stripe, Lemon Squeezy, etc.)
- **Portfolio restyle:** Applying the same Abhijit-inspired house style to the main portfolio pages (separate follow-up)

## File Structure (within portfolio_website)

```
src/
  app/
    components/
      page.tsx                    -> Component library landing
      [slug]/
        page.tsx                  -> Component detail page
    blog/
      page.tsx                    -> Blog listing
      [slug]/
        page.tsx                  -> Blog post
  components/
    library/
      text-animations/
        SplitText.tsx
        BlurText.tsx
        ...
      animations/
        ElectricBorder.tsx
        GlareHover.tsx
        ...
      components/
        TiltedCard.tsx
        Dock.tsx
        ...
      backgrounds/
        LineWaves.tsx
        ...
      blocks/
        CirclingElements.tsx
        MacbookScroll.tsx
        ...
    ui/
      Hero3DCarousel.tsx          -> The Abhijit-style 3D card carousel
      ComponentCard.tsx           -> Card used in grid and carousel
      FilterBar.tsx               -> Category filter
      GlassmorphicOverlay.tsx     -> Hover overlay for cards
      BlogPostLayout.tsx          -> Blog post template
      CodeBlock.tsx               -> Syntax-highlighted code block
  lib/
    components-data.ts            -> Component metadata (name, slug, category, description)
    blog-data.ts                  -> Blog post metadata or MDX config
  content/
    blog/
      split-text.mdx
      blur-text.mdx
      ...
```
