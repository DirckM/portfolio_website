---
name: new-blog-post
description: Write a new blog post for the portfolio component library. Use when adding a post to portfolio_website, when the weekly generator fires, or when the user asks to write up a component as a tutorial. Covers the exact files a post must touch and how to verify it actually renders.
---

# New blog post — portfolio_website

A post on this site is **not prose**. Every post is welded 1:1 to a working React
component in the library: 63 registry entries, 63 posts, zero drift. Writing only
the MDX produces a page with dead demo boxes that still passes `pnpm build`.

Follow the five steps below in order. Do not skip step 5.

## Pick the topic

Take the **first unchecked item** in [docs/blog-queue.md](../../../docs/blog-queue.md)
unless told otherwise. Each entry names a slug, a title, its twin post, and
whether it needs `previewScroll`.

If the entry has a twin, you are writing the "same effect, zero JavaScript"
companion to an existing post. Link to the twin from the new post, and add a link
back from the twin's MDX. Both directions, or the entry is not done.

## 1. The component

Create `src/components/library/<category>/<PascalName>.tsx` where `<category>` is
one of `text-animations`, `animations`, `backgrounds`, `components`, `blocks`.

- It must have a **default export**. `scripts/generate-scope.mjs` throws otherwise.
- Mark it `'use client'` if it uses hooks, refs or browser APIs.
- House pattern for component-scoped CSS is an inline `<style>` block. See
  `ElectricBorder.tsx`, `TextPressure.tsx` and `MagicBento.tsx`. Tailwind v4 is
  available for layout, but keyframes and `@property` belong in the style block.
- Props get sane defaults so the component renders standalone with no props.

## 2. The registry

Add an entry to `src/lib/components-registry.ts`:

```ts
{
  name: 'Scroll Reveal CSS',
  slug: 'scroll-reveal-css',      // must equal the MDX filename and componentSlug
  category: 'text',                // 'text' | 'animations' | 'components' | 'backgrounds' | 'blocks'
  description: 'One line, shown on the components index',
  sourceRef: '',                   // leave empty for original work
  featured: false,
}
```

Note the registry `category` values differ from the MDX `category` labels. The
registry uses the `ComponentCategory` union above. The MDX uses the display
labels: `Text Animations`, `Animations`, `Components`, `Backgrounds`, `Blocks`.

## 3. The demo code

Add the snippets to `src/lib/live-step-codes.ts`, keyed by convention:

- `<slug>-final` — the finished thing, used by the "The final result" LiveStep
- `<slug>-step3`, `<slug>-step4` — intermediate states for the walkthrough

These are **strings of JSX evaluated by react-live in the browser**. They resolve
component names against the generated live scope, so anything you reference must
be a real library component. A `codeId` that does not exist here silently becomes
an empty string and renders a blank box.

Then add a hero demo to `fullDemos` in `src/lib/component-previews.tsx`, keyed by
the slug. Without it the post renders with no hero (`BlogPostLayout` guards on
`{demo && ...}`) and `check-post.mjs --strict` fails.

## 4. The post

Create `src/content/blog/<slug>.mdx`. Frontmatter, all five fields required:

```mdx
---
title: "Scroll Reveal Text with Zero JavaScript"
description: "One or two sentences. This is the meta description and the card copy."
date: "2026-08-05"
category: "Text Animations"
componentSlug: "scroll-reveal-css"
---
```

Structure, measured from the existing corpus (500 to 750 words, six `##`
sections):

1. Two or three sentences of hook. No heading. State what the effect is and why
   it is interesting. Never open with "In this tutorial".
2. `## The final result` followed immediately by the LiveStep
3. `## What we are building` — a short paragraph on the mechanism
4. `## Setting up` — imports and dependencies
5. `## Step 1: ...`, `## Step 2: ...` — the build, with a LiveStep on the steps
   where seeing it move actually helps
6. A closing section that says where to take it further

The LiveStep call:

```mdx
<LiveStep
  codeId="scroll-reveal-css-final"
  previewScroll
  controls={[
    { prop: 'duration', type: 'slider', min: 0.2, max: 2, step: 0.1, default: 0.6, label: 'duration' },
  ]}
/>
```

**Pass `previewScroll` for anything using `animation-timeline: view()` or
`scroll()`.** Without it the preview pane is a 200px centred flex box with no
scrollport of its own, the timeline resolves against the article, and the demo
animates on the reader's page scroll instead of its own. The queue marks which
entries need it.

`controls` are optional and only work on props that appear literally in the
snippet string, since `PropControls` rewrites the code text by regex.

## 5. Verify — not optional

```bash
pnpm generate:scope     # regenerates src/lib/live-scope.ts from the filesystem
pnpm type-check
pnpm build
node scripts/check-post.mjs <slug> --strict
```

`pnpm build` passing means nothing on its own. The demos are compiled by
react-live in the browser, so a missing component or a typo'd `codeId` builds
clean and breaks only for the reader. `check-post.mjs` loads the real page in
Chromium and fails on a react-live error, an empty demo box, a console error, a
missing `codeId`, a missing registry entry or a missing `fullDemos` entry.

If the gate fails, fix it. Do not report the post as done with a failing gate.

## Writing style

- No semicolons and no em-dashes in the prose. Use commas, periods or brackets.
- Second person, direct, no filler. "You only need Framer Motion for this one."
- Do not oversell. If the CSS version has a real limitation against its JS twin,
  say so in a sentence, that is the most useful part of the post.

## What not to do

- Do not hand-edit `src/lib/live-scope.ts`. It is generated.
- Do not add the component to a scope object in `blog/[slug]/page.tsx`. That list
  is gone, the page spreads the generated `liveScope`.
- Do not invent a category outside the five.
- Do not write a post with no component behind it. There is no editorial post
  type on this site.
