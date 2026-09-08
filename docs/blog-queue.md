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
- [ ] `media-state-css` — A Video Player UI Built on :playing, :paused and :buffering — twin: none — the `:playing`/`:paused`/`:seeking`/`:buffering`/`:stalled`/`:muted` pseudo-classes reached Baseline newly available in **August 2026**, so player chrome that used to need `timeupdate`/`waiting` listeners is now pure CSS state. Interop 2026 focus area.
- [ ] `sibling-fan-menu` — Fan-Out Radial Menus with sibling-index() and sibling-count() — twin: `circling-elements` — `sibling-index()`/`sibling-count()` hit Baseline newly available in **August 2026** when Firefox 154 shipped (18 Aug 2026); Chrome 138 and Safari 26.2 already had it. Per-item angle and delay come from the index, so no `nth-child` ladder and no JS index prop.
- [ ] `animation-trigger` — Scroll-Triggered Animations with animation-trigger, No IntersectionObserver — twin: `scroll-float` — Chrome 146 (10 Mar 2026) is the first browser to ship `animation-trigger` plus `timeline-trigger-name`/`timeline-trigger-source` and `trigger-scope`. This is the *other* half of scroll CSS: a normal time-based animation fired once at a scroll boundary, not scrubbed by scroll like `animation-timeline`. Needs `previewScroll`.
- [ ] `text-fit` — Headlines That Auto-Fit Their Box with CSS text-fit — twin: `text-pressure` — the `text-fit` property shipped in Chrome 150 (30 Jun 2026) and scales font size to exactly fill the container width, which is what every fitty/textFit script was for. Worth pairing: the `text-pressure` twin's variable font is currently a 404 in production.
- [ ] `gap-decorations` — Animated Grid Dividers with CSS Gap Decorations — twin: `magic-bento` — Chrome 149 (2 Jun 2026) shipped CSS Gap Decorations: `column-rule`/`row-rule` now paint inside grid and flex gaps, with `column-rule-inset` and animatable rule width and colour. Bento grid separators with zero divider elements.
- [ ] `focusgroup` — Arrow-Key Navigation for Free with the focusgroup Attribute — twin: `dock` — the `focusgroup` HTML attribute shipped in Chrome 150 (30 Jun 2026) and gives a toolbar arrow-key navigation, a single guaranteed tab stop and last-focused memory declaratively. Deletes the roving-tabindex hook every dock/tablist component carries.
- [ ] `animate-view` — Shared-Element Morph Transitions with Motion's AnimateView — twin: none — Motion made `animateView()` free in the core library on 30 Jun 2026 and `<AnimateView>` for React (motion@12.34.0+, latest 13.2.0) fixes the View Transitions rough edges: spring easing, interruption queueing instead of snapping, and `.add()` to assign `view-transition-name` from a selector. The library-side companion to the queued `view-transitions` post.
- [ ] `contrast-color` — Labels That Pick Their Own Colour with contrast-color() — twin: `color-bends` — `contrast-color()` reached Baseline newly available in **April 2026** (Chrome 147, Firefox 146, Safari 26.0), so a swatch grid over arbitrary generated colours no longer needs a JS luminance helper. One of the few entries in this queue that is already all-three-engines.
- [ ] `field-sizing-textarea` — Auto-Growing Textareas with CSS field-sizing — twin: `terminal` — `field-sizing: content` reached Baseline **newly available 16 Jun 2026** when Firefox 152 shipped it (Chrome 123 had it since Mar 2024, Safari 26.2 since Dec 2025). Deletes the `scrollHeight`/shadow-div measuring hook that every chat and comment input carries. The AI-composer input is the demo.
- [ ] `invoker-commands` — Dialogs and Popovers with Zero JavaScript: command and commandfor — twin: none — Invoker Commands reached Baseline **newly available 12 Dec 2025** (Chrome 135, Firefox 144, Safari 26.2 last). `<button command="show-modal" commandfor="id">` replaces the `addEventListener` + `showModal()` pair outright, and `--custom` commands cover the rest. Nothing on this blog covers declarative HTML behaviour yet.
- [ ] `open-state-css` — Accordions That Style Their Own Open State with :open — twin: `folder` — `:open` reached Baseline **newly available 11 May 2026** when Safari 26.5 shipped it (Chrome 133 and Firefox 136 had it since early 2025). One selector styles `<details>`, `<dialog>`, `<select>` and popovers, replacing the `details[open]` attribute-selector hack. Pairs naturally with `invoker-commands`.
- [ ] `grid-lanes` — Native Masonry Layouts with display: grid-lanes — twin: `dome-gallery` — Safari 26.4 (24 Mar 2026) is the first engine to ship the standardised `display: grid-lanes` plus `flow-tolerance` (renamed from `item-tolerance` in Jan 2026); Chromium shipped the older `display: masonry` in Chrome 140 and is migrating to the new syntax. Ten years of masonry JS libraries collapsing into one declaration — highest search demand in this batch. Needs a documented column-flex fallback, it is not Baseline.
- [ ] `shape-morph` — Morphing Clip-Paths with the CSS shape() Function — twin: `shape-blur` — `shape()` reached Baseline **newly available Feb 2026** (Chrome 135, Safari 18.4, Firefox 148 last). Unlike `polygon()` it takes `line`/`curve`/`arc` commands in mixed units, so the path is responsive and interpolates between states with matching command lists — a real morph in plain CSS, no SVG and no MorphSVG.
- [ ] `css-random` — Scatter, Confetti and Organic Delays with the CSS random() Function — twin: `falling-text` — Chrome filed **Intent to Ship on 26 Aug 2026 targeting Chrome 155**, desktop and Android; Safari 26.2 already ships it and Safari 26.5 added the per-element scoping keyword (`element-scoped`, being renamed `per-element`). This is the freshest item in the queue and almost nothing is written about it. Not Baseline — gate on `@supports not (order: random(1, 2))` and keep a static fallback.
- [ ] `container-style-queries` — Cards That Retheme Themselves with Container Style Queries — twin: `pixel-card` — `@container style(--theme: dark)` reached Baseline **newly available May 2026** when Firefox 151 shipped `style()` queries; Chrome 148 added name-only container queries the same month. One card component that repaints from a custom property set anywhere above it, with no prop drilling and no context provider.
- [ ] `ease-reverse` — Hover Animations That Ease Differently on the Way Out with GSAP easeReverse — twin: `elastic-slider` — GSAP **3.15.0 (13 Apr 2026)** added `easeReverse` and deprecated `yoyoEase`; unlike `yoyoEase` it stays correct when the playhead reverses mid-tween, which is exactly the hover-in/hover-out interruption case every card effect gets wrong. GSAP 3.14 (8 Dec 2025) also added MorphSVG `smooth` and `curveMode` if the demo wants a second beat.

## Published

<!-- The generator moves items here with the date it shipped them. -->

- [x] `scroll-progress-css` — A Scroll Progress Bar with animation-timeline: scroll() — twin: none — simplest entry point to the API. Needs `previewScroll`. — shipped 2026-09-07
- [x] `scroll-reveal-css` — Scroll Reveal Text with Zero JavaScript — twin: `scroll-reveal` — `animation-timeline: view()`, the flagship case. Needs `previewScroll`. — shipped 2026-09-07

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

Separately, 11 posts have no `fullDemos` entry, so they render without a hero
demo: antigravity, crosshair, dock, folder, lanyard, letter-swap, magnet,
pixel-trail-block, radar, shuffle, terminal. `antigravity` is the #2 post by
traffic and `lanyard` is #4, so those two are worth fixing first.
`node scripts/check-post.mjs <slug>` warns about this and `--strict` fails on it.

Re-run the sweep any time with:

```bash
pnpm build && pnpm start --port 3111 &
for s in $(ls src/content/blog | sed 's/.mdx//'); do
  BASE_URL=http://localhost:3111 node scripts/check-post.mjs "$s"
done
```

## Research log

### 2026-09-07

Window scanned: browser releases and library changelogs from roughly May–Sep 2026.
Chrome is on a two-week cycle since Sep 2026 (stable 153, 8 Sep), so version
numbers move fast; re-check any Chromium-only entry at write time.

- **`:playing` / `:paused` / `:seeking` / `:buffering` / `:stalled` / `:muted` / `:volume-locked`** — Baseline **newly available Aug 2026**, all three engines. Interop 2026 focus area. → queued as `media-state-css`.
- **`sibling-index()` / `sibling-count()`** — Baseline **newly available Aug 2026**; Firefox 154 (18 Aug 2026) was the last engine, Chrome 138 and Safari 26.2 preceded it. → queued as `sibling-fan-menu`.
- **`contrast-color()`** — Baseline **newly available Apr 2026** (Chrome 147, Firefox 146, Safari 26.0). → queued as `contrast-color`.
- **`animation-trigger` / `timeline-trigger-name` / `timeline-trigger-source` / `trigger-scope`** — Chrome 146, 10 Mar 2026, first engine to ship. Distinct from `animation-timeline`. → queued as `animation-trigger`.
- **CSS Gap Decorations** (`column-rule`/`row-rule` in grid and flex, `column-rule-inset`, animatable) — Chrome 149, 2 Jun 2026. Chromium only so far. → queued as `gap-decorations`.
- **`text-fit`**, **`focusgroup`**, **`background-clip: border-area`**, **rounded `polygon()`**, **animatable `zoom`**, **`flex-wrap: balance`**, **`light-dark()` for images** — all Chrome 150, 30 Jun 2026. Took `text-fit` and `focusgroup`; `background-clip: border-area` was skipped because it overlaps the queued `gradient-border-css`.
- **`image-rendering: crisp-edges`**, shape functions in `shape-outside` — Chrome 149, 2 Jun 2026. Held back as a possible `pixel-card` twin.
- **Chrome 152** (25 Aug 2026) — `CSSPseudoElement` extended to `::backdrop`/`::scroll-marker`/`::view-transition`, relative alpha colours, `window-drag`. Nothing that stands alone as a demo yet.
- **Motion** — `animateView()` made free in core 30 Jun 2026; `<AnimateView>` for React needs motion@12.34.0+; 13.2.0 is current (Sep 2026). → queued as `animate-view`.
- **Firefox 152** (16 Jun 2026) shipped `field-sizing` and `<timeline-range-name>` in `@keyframes`, but scroll-driven animations are **still behind `layout.css.scroll-driven-animations.enabled`** in stable. This contradicts the cross-browser claim in the "Why these topics" section above and affects most of the existing queue — verify before writing any `previewScroll` post.
- **Tailwind** — v4.2 (18 Feb 2026, logical properties, webpack plugin), v4.3 (scrollbar utilities). Nothing demo-shaped.
- **three.js** — WebGPURenderer production-ready since r171; r184 (Mar 2026) fixed per-frame allocation. No single new API worth a post.
- **React / Next.js** — no React 19.3 or 20; latest is 19.2.x. Next.js 16 (Oct 2025) is not new enough to anchor a post on its own.

Rejected this round:

- **CSS carousels (`::scroll-marker`, `::scroll-marker-group`, `::scroll-button`)** — MDN still flags it experimental and explicitly not Baseline; Safari 26.0 does not list it. Also overlaps the queued `scroll-snap-gallery`. Revisit when WebKit ships.
- **`corner-shape` / `superellipse()` squircles** — Chromium-only at ~65% global as of Jun 2026, no Safari or Firefox timeline.
- **`@container scroll-state()`** (`stuck`, `snapped`, `scrolled`) — Chrome 133/144 only, no Safari or Firefox in stable.
- **`if()`** — Chrome 137+ only, Firefox in progress, Safari roadmapped 2026–27.
- **Interest invokers (`interestfor`, `:interest-source`, `:interest-target`)** — still origin-trial/experimental in Chromium. Strong candidate for the next round if it ships.

Sources read:

- https://developer.chrome.com/release-notes/146
- https://developer.chrome.com/release-notes/149
- https://developer.chrome.com/release-notes/150
- https://developer.chrome.com/release-notes/152
- https://developer.chrome.com/blog/scroll-triggered-animations
- https://developer.chrome.com/blog/carousels-with-css
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:playing
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::scroll-marker
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/column-rule
- https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/152
- https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/151
- https://web.dev/blog/baseline-digest-jul-2026
- https://web-platform-dx.github.io/web-features-explorer/features/sibling-count/
- https://web-platform-dx.github.io/web-features-explorer/features/contrast-color/
- https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- https://motion.dev/docs/animate-view
- https://motion.dev/docs/react-animate-view
- https://motion.dev/changelog
- https://squircle.js.org/blog/squircles-in-css
- https://css-tricks.com/a-first-look-at-the-interest-invoker-api-for-hover-triggered-popovers/

### 2026-09-07 (second pass)

Second run the same day. The earlier pass stopped at Safari 26.0 and Chrome 152, so
this pass swept Safari 26.2-26.6, Chrome 151, the web.dev monthly digests and the
Baseline 2026 list, plus GSAP, shadcn and R3F on the library side.

- **`field-sizing`** — Baseline **newly available 16 Jun 2026** (Firefox 152 last; Chrome 123, Safari 26.2). The earlier log noted Firefox 152 shipping it but did not queue it. -> queued as `field-sizing-textarea`.
- **Invoker Commands (`command` / `commandfor`)** — Baseline **newly available 12 Dec 2025** (Chrome 135, Firefox 144, Safari 26.2 last). -> queued as `invoker-commands`.
- **`:open`** — Baseline **newly available 11 May 2026** (Safari 26.5 last; Chrome 133, Firefox 136). -> queued as `open-state-css`.
- **CSS Grid Lanes (`display: grid-lanes`, `flow-tolerance`)** — Safari 26.4, 24 Mar 2026, first engine on the standardised syntax; Chromium still on `display: masonry` from Chrome 140 and migrating. Not Baseline, needs a fallback. -> queued as `grid-lanes`.
- **`shape()`** — Baseline **newly available Feb 2026** (Chrome 135, Safari 18.4, Firefox 148 last). Responsive and interpolable, unlike `polygon()`. -> queued as `shape-morph`.
- **CSS `random()`** — Chrome **Intent to Ship 26 Aug 2026, targeting Chrome 155** desktop and Android; Safari 26.2 ships it, Safari 26.5 added the `element-scoped` keyword (renaming to `per-element`), Firefox signalling positive. MDN still flags it experimental. Freshest item in the queue. -> queued as `css-random`.
- **Container style queries for custom properties** — Baseline **newly available May 2026** (Firefox 151 shipped `style()`); Chrome 148 added name-only container queries the same month. -> queued as `container-style-queries`.
- **GSAP 3.15.0** (13 Apr 2026) — `easeReverse` added, `yoyoEase` deprecated and internally aliased; survives a mid-tween direction change. GSAP 3.14 (8 Dec 2025) added MorphSVG `smooth`, `curveMode`, `redraw: false`. -> queued as `ease-reverse`.

Rejected this round:

- **CSS Custom Highlight API** — real, but Baseline since **June 2025**. Too old to anchor a "just shipped" post.
- **shadcn/ui Questionnaire** (Aug 2026, multi-step question flows for agent clarification, Base UI + React Aria + Radix). Genuinely new and demo-shaped, but it belongs to the parked "AI interface components" vein rather than this CSS-native run. Strong candidate for that vein when it opens. The Sep 2026 shadcn change was only moving `cn` into its own package.
- **React Three Fiber v10** — WebGPU/TSL first-class, `state.gl` becomes `state.renderer`, new `useFrame` scheduler, `useUniforms`/`useNodes`/`usePostProcessing`, Drei 11. Still **alpha** (v10.0.0-alpha.1), and this blog's WebGL posts use OGL rather than R3F. Revisit at stable.
- **Safari 26.6** (27 Jul 2026) — one WebAssembly feature and eight bug fixes. Nothing demo-shaped.
- **Chrome 151** (28 Jul 2026) — `ruby-overhang`, `shadowrootslotassignment`, `textStream()`, `aria-actions`, wheel `momentum`. Nothing that carries a visual demo. Note `position-anchor`'s initial value changed from `none` to `normal`, which the queued `anchor-tooltip` post should mention.
- **Safari 26.4 threaded scroll-driven animations** (24 Mar 2026) — completes compositor-thread SDA across engines. Not its own post, but it is good supporting evidence for the queued `previewScroll` entries. Does **not** resolve the Firefox-stable flag problem the earlier log flagged.
- **Safari 26.5 `ToggleEvent.source`**, **`position-visibility`** (26.2), **SVG `color-interpolation: linearRGB`** (26.5) — too small alone; fold into `invoker-commands` and `anchor-tooltip`.
- **Chrome 150 lazy loading for `<video>`/`<audio>`** — not visual enough for a demo post.

Sources read:

- https://developer.chrome.com/release-notes/151
- https://webkit.org/blog/17862/webkit-features-for-safari-26-4/
- https://webkit.org/blog/17938/webkit-features-for-safari-26-5/
- https://webkit.org/blog/18178/webkit-features-for-safari-26-6/
- https://webkit.org/blog/17660/introducing-css-grid-lanes/
- https://web.dev/blog/web-platform-05-2026
- https://web.dev/baseline/2026
- https://web-platform-dx.github.io/web-features-explorer/features/invoker-commands/
- https://web-platform-dx.github.io/web-features-explorer/features/field-sizing/
- https://web-platform-dx.github.io/web-features-explorer/features/open-pseudo/
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/basic-shape/shape
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/random
- http://www.mail-archive.com/blink-dev@chromium.org/msg17310.html
- https://css-tricks.com/masonry-layout-is-now-grid-lanes/
- https://gsap.com/blog/3-14/
- https://gsap.com/blog/3-15/
- https://ui.shadcn.com/docs/changelog/2026-08-questionnaire
- https://ui.shadcn.com/docs/changelog/2026-09-cn
- https://github.com/pmndrs/react-three-fiber/releases/tag/v10.0.0-alpha.1
