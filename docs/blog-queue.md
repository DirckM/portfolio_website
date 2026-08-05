# Blog queue

The weekly generator (`~/.claude/scripts/weekly-blog-post.sh`) takes the **first
unchecked item** in the Queued list, writes the component and the post, and ticks
it off. Reorder freely. Add anything you want written next at the top.

## Why these topics

The original 63 posts are all rebuilds of components from reactbits.dev (55),
fancycomponents.dev (5) and ui.aceternity.com (3), and every one of them is
JavaScript-driven (framer-motion, GSAP, three, OGL). There is zero CSS-native
coverage.

Scroll-driven animations and the View Transitions API went cross-browser during
2025-2026 (Chrome/Edge 115+, Firefox 132+, Safari 18+, roughly 84% global as of
mid-2026) and are actively replacing framer-motion for exactly this class of
effect.

Most entries below are a "same effect, zero JavaScript" companion to a post that
already gets traffic. **Each new post links to its twin and the twin gets a link
back**, so the pair covers both queries and the internal linking comes for free.
The `twin` column is not decoration, it is the job: if a twin is listed, wire the
cross-link in both directions.

## Queued

- [ ] `scroll-progress-css` — A Scroll Progress Bar with animation-timeline: scroll() — twin: none — simplest entry point to the API. Needs `previewScroll`.
- [ ] `gradient-border-css` — Animated Gradient Borders with @property — twin: `border-glow` — `@property` is the other 2026 win, and this one needs no scrollport.
- [ ] `blur-text-css` — Blur-to-Sharp Text Reveal, CSS only — twin: `blur-text` — direct swap of a framer-motion post. Needs `previewScroll`.
- [ ] `view-transitions` — Page Transitions in Next.js 16 with the View Transitions API — twin: none — highest-demand new API. Check the Next 16.2 config flag at write time, or drive `document.startViewTransition` directly in the demo.
- [ ] `marquee-css` — An Infinite Logo Marquee with No JavaScript — twin: `logo-loop` — most-copied effect on the web.
- [ ] `sticky-stack-css` — Stacking Cards on Scroll, CSS only — twin: `scroll-stack` — drops the Lenis dependency this effect currently carries. Needs `previewScroll`.
- [ ] `text-shimmer-css` — A CSS-Only Shimmer Text Effect — twin: `shiny-text` — doubles as the AI "Thinking..." pattern.
- [ ] `stagger-css` — Stagger a List In on Scroll, CSS only — twin: `animated-list` — replaces the usual IntersectionObserver boilerplate. Needs `previewScroll`.
- [ ] `parallax-css` — Parallax Images with Scroll-Driven CSS — twin: `parallax-floating` — classic effect, native now. Needs `previewScroll`.
- [ ] `counter-css` — Animated Counters with @property — twin: none — counters "always needed JS", now they do not.
- [ ] `anchor-tooltip` — Tooltips with CSS Anchor Positioning — twin: none — removes Floating UI for the simple cases.
- [ ] `scroll-velocity-css` — Scroll Velocity Marquee without JavaScript — twin: `scroll-velocity` — shows off named scroll timelines. Needs `previewScroll`.
- [ ] `tilt-card-css` — A 3D Tilt Card without JavaScript — twin: `tilted-card` — the top-of-funnel card effect.
- [ ] `scroll-snap-gallery` — A Scroll-Snap Gallery with Scroll-Driven Zoom — twin: `circular-gallery` — pairs snap points with timelines. Needs `previewScroll`.
- [ ] `named-timelines` — Named Scroll Timelines: Animate One Element from Another's Scroll — twin: none — the advanced post that earns links.

## Published

<!-- The generator moves items here with the date it shipped them. -->

- [x] 2026-08-05 — `scroll-reveal-css` — Scroll Reveal Text with Zero JavaScript — twin: `scroll-reveal` — `animation-timeline: view()`, the flagship case. Needs `previewScroll`.

## Parked veins

Not dead, just not the current run:

- **AI interface components.** Streaming text with a shimmer state, skeleton
  response panels, collapsible agent plans, auto-anchoring message lists,
  tool-call status chips, streaming markdown that defers code fences. shadcn
  shipped chat components in June 2026 and generative UI is the pattern of the
  year. Nobody in the reactbits-clone crowd covers it, and it can be written from
  real work rather than theory.
- **Extracted from Hub projects.** Infinite pan/zoom canvas (brainstorm-canvas),
  GSAP + Lenis pinned hero (aria-swim), waveform scrubber (music-manager),
  drag-to-reorder queue (social-engine), force-layout relationship graph (Orbit),
  before/after image slider (fotograph-tool). Most defensible originality of the
  three, highest extraction cost.

## Known debt

Running the gate across all 63 posts gives **58 pass, 5 fail**. All five predate
the gate. Expect them until they are fixed by hand:

- **No interactive demo at all** (no `<LiveStep>` in the post, so it is prose plus
  static code blocks): `letter-swap`, `parallax-floating`, `pixel-trail-block`,
  `variable-proximity`
- **Broken external font, live right now**: `text-pressure` loads
  `res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2`,
  which returns **404**. The variable-font effect that the whole post is about
  does not work in production. Self-host the woff2 in `public/fonts/` to fix it.

The "11 posts have no `fullDemos` entry" note that used to sit here was wrong on
both halves, corrected 2026-08-05 while writing `scroll-reveal-css`:

- **No post rendered a hero, not 11.** `blog/[slug]/page.tsx` is a server
  component and it read `fullDemos` straight out of `component-previews.tsx`,
  which is `'use client'`. A server component importing a client module gets a
  client reference proxy, so every lookup came back undefined and the
  `{demo && ...}` guard in `BlogPostLayout` was never true. `/components/[slug]`
  was unaffected because it goes through the client `<FullDemo>` wrapper. Fixed
  by reading the map from `<BlogHeroDemo>`, same trick. 62 of 64 posts now show
  a hero.
- **Only 2 posts genuinely lack an entry**: `letter-swap` and
  `pixel-trail-block`. The other 9 on the old list have entries all along,
  written with unquoted keys (`antigravity:` rather than `'antigravity':`).

That second point was a gate bug, **fixed 2026-08-05**. `check-post.mjs` looked
for the fullDemos entry with `demosBlock.includes("'<slug>'")`, quotes included,
so any slug that is a valid JS identifier and was written unquoted read as
missing and failed `--strict`. It now parses the keys and accepts both forms.

Re-run the sweep any time with:

```bash
pnpm build && pnpm start --port 3111 &
for s in $(ls src/content/blog | sed 's/.mdx//'); do
  BASE_URL=http://localhost:3111 node scripts/check-post.mjs "$s"
done
```
