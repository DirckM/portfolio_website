# Full Demos for All Components

## Problem

50 out of 63 registered components are missing `fullDemos` entries in `src/lib/component-previews.tsx`. When visiting a component detail page (`/components/[slug]`), these show placeholder text "Live demo: {name}" instead of a rendered component.

## Solution

Add `fullDemos` entries for all 50 missing components in `component-previews.tsx`, following the established pattern.

## Design Pattern

Each full demo should:

- Show **2-3 variations** of the component with different prop configurations (sizes, colors, speeds, modes)
- Be styled for the **60vh hero section** with generous spacing (`p-12`, `gap-8`, centered)
- Use the project's design language (black/white/gray palette, `font-instrument-serif` for display text where appropriate)
- Components needing dark backgrounds (pixel-trail, crosshair, meta-balls, etc.) get a dark container
- WebGL/dynamic components use their existing `dynamic()` imports with `ssr: false`

## Components to Add

### Text Animations (15)

| Slug | Notes |
|------|-------|
| split-text | Show chars vs words split modes |
| circular-text | Show different speeds/sizes |
| shuffle | Show different directions (up/down) |
| text-pressure | Full-width pressure demo |
| curved-loop | Dark bg, show different curve amounts |
| falling-text | Show different gravity/font-size configs |
| decrypted-text | Show sequential vs random, hover vs view triggers |
| true-focus | Show different blur amounts |
| scroll-float | Needs scroll context |
| scroll-reveal | Needs scroll context |
| ascii-text | Dark bg, WebGL, show different text/sizes |
| scrambled-text | Dark bg, show different scramble chars |
| variable-proximity | Needs containerRef, show different weight ranges |
| scroll-velocity | Show different speeds/text |
| letter-swap | No component file exists -- skip (add placeholder note) |

### Animations (10)

| Slug | Notes |
|------|-------|
| glare-hover | Show multiple cards with different colors |
| antigravity | Show different particle counts/colors |
| logo-loop | Show tech logos at different speeds |
| target-cursor | Full container, hide default cursor |
| magnet | Show different strengths |
| pixel-trail | Dark bg, show different pixel sizes |
| metallic-paint | Show with image |
| shape-blur | Full container |
| crosshair | Dark bg, full container |
| meta-balls | Show different ball counts/colors |

### Components (14)

| Slug | Notes |
|------|-------|
| animated-list | Show with gradient and items |
| scroll-stack | Needs scroll context, show stacking cards |
| magic-bento | Show with stars/spotlight |
| circular-gallery | Show with unsplash images |
| reflective-card | Dark bg |
| fluid-glass | Full container |
| glass-surface | Gradient bg, show multiple surfaces |
| dome-gallery | Show with images |
| lanyard | Dark bg |
| dock | Show at bottom with icons |
| pixel-card | Show multiple variants |
| border-glow | Show different glow colors |
| flowing-menu | Show with items |
| infinite-menu | Show with image items |

### Backgrounds (6)

| Slug | Notes |
|------|-------|
| soft-aurora | Full container, WebGL |
| color-bends | Full container, WebGL |
| dark-veil | Full container, WebGL |
| light-pillar | Dark bg, WebGL |
| evil-eye | Dark bg, WebGL |
| radar | Dark bg |

### Blocks (5)

| Slug | Notes |
|------|-------|
| circling-elements | Show orbiting elements |
| marquee-svg-path | No cardPreview, use MarqueeAlongSvgPath import |
| pixel-trail-block | No component file exists -- skip |
| parallax-floating | Show floating elements with depth |
| world-map | Show with dots and arcs |

## Components to Skip (2)

- **letter-swap**: No component implementation file exists in `src/components/library/`
- **pixel-trail-block**: No component implementation file exists in `src/components/library/`

These need their component files created first before demos can be added.

## Implementation Scope

- **Single file change**: `src/lib/component-previews.tsx`
- **48 new entries** in the `fullDemos` object (50 minus 2 skipped)
- No new imports needed -- all components are already imported at top of file
- No architectural changes

## Grouping for Implementation

To keep changes manageable, implement in batches by category:
1. Text animations (14 entries)
2. Animations (10 entries)
3. Components (14 entries)
4. Backgrounds (6 entries)
5. Blocks (3 entries + marquee-svg-path which has import but no cardPreview)
