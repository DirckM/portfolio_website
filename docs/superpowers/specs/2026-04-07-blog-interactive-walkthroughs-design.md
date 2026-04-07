# Blog Interactive Walkthroughs Design

## Problem

Blog posts about components show code as plain unstyled text with no syntax highlighting. There are no live previews of the component at each build stage, so readers can't see the progressive result of each code step or interact with the components.

## Solution

Two parts:
1. **Syntax-highlighted code blocks** for all blog posts (automatic via MDX pipeline)
2. **Interactive LiveStep playground** for walkthrough blog posts (4 pilot posts)

## Part 1: Syntax-Highlighted Code Blocks

### What changes

Upgrade the MDX rendering pipeline so all fenced code blocks (```` ```tsx ````) render with:
- Dark background (`#1a1a1a` / `bg-library-code`)
- VS Code-quality syntax highlighting via **shiki**
- Language label (top-left)
- Copy button (top-right)
- Monospace font (`font-jetbrains-mono`)

### How it works

- Install `shiki` package
- Add custom `pre` and `code` components to the `mdxComponents` object in `src/app/(library)/blog/[slug]/page.tsx`
- The custom `pre` component extracts the language from the code element's className (e.g. `language-tsx`), highlights with shiki, and renders inside the existing `CodeBlock.tsx` shell (upgraded to accept highlighted HTML)
- Since `MDXRemote` runs server-side (RSC), shiki highlighting happens at build time -- zero client-side JS cost

### Files

- Install: `shiki`
- Modify: `src/app/(library)/blog/[slug]/page.tsx` -- add `pre`/`code` to mdxComponents
- Modify: `src/components/shell/CodeBlock.tsx` -- accept pre-highlighted HTML via `dangerouslySetInnerHTML` instead of plain text `code` prop

### Applies to

All 63 blog posts automatically. No MDX file changes needed.

## Part 2: Interactive LiveStep Playground

### What changes

New `<LiveStep>` MDX component for walkthrough blog posts. Each LiveStep renders:

1. **Editable code panel** -- react-live editor with syntax highlighting, user can modify JSX/props
2. **Live preview panel** -- renders the component in real-time as code changes
3. **Prop controls** (optional) -- color pickers, sliders, select dropdowns, toggles for key props

### Layout

- Desktop: side-by-side (code left, preview right), controls below preview
- Mobile: stacked (code on top, preview below, controls below that)
- Preview panel has a light border, minimum height of 200px
- Editor uses dark theme matching the static code blocks

### MDX usage

```mdx
<LiveStep
  code={`<BlurText text="Hello world" animateBy="words" delay={0.05} />`}
  scope={{ BlurText }}
  controls={[
    { prop: 'animateBy', type: 'select', options: ['words', 'characters'], default: 'words' },
    { prop: 'delay', type: 'slider', min: 0.01, max: 0.2, step: 0.01, default: 0.05 },
  ]}
/>
```

### How controls work

Each control definition specifies:
- `prop`: the JSX prop name to bind to
- `type`: `'color'` | `'slider'` | `'select'` | `'toggle'`
- Type-specific config (min/max/step for slider, options for select, etc.)
- `default`: initial value

When a user changes a control, the LiveStep:
1. Updates an internal state map of prop values
2. Rewrites the code string with the new prop value
3. react-live re-renders the preview with the updated code

### Control types

| Type | Renders | Value |
|------|---------|-------|
| `color` | Native color picker input | Hex string e.g. `'#5227FF'` |
| `slider` | Range input with current value label | Number |
| `select` | Dropdown / segmented control | String from options array |
| `toggle` | Switch/checkbox | Boolean |

### Files

- Install: `react-live`
- Create: `src/components/shell/LiveStep.tsx` -- the playground component (client component)
- Create: `src/components/shell/PropControls.tsx` -- renders control inputs from config
- Modify: `src/app/(library)/blog/[slug]/page.tsx` -- add LiveStep to mdxComponents, make page partially client-rendered

### Scope injection

The `scope` prop passes actual component references into react-live's scope. Since LiveStep is a client component and the components are already client components, this works directly. The blog page imports the needed components and passes them through MDX.

Since MDX components can't directly import, the scope will be provided via a lookup map. The blog page detects which components are needed from the MDX frontmatter `componentSlug` and injects the right scope.

## Part 3: Pilot Blog Post Rewrites

### Which posts

4 posts covering different component categories:
1. `blur-text` (text animation -- Framer Motion)
2. `tilted-card` (component -- CSS transforms)
3. `electric-border` (animation -- CSS gradients)
4. `line-waves` (background -- Canvas)

### Walkthrough structure per post

1. **Intro** -- what we're building + final interactive result at top (LiveStep with full controls)
2. **Step 1: Basic structure** -- static highlighted code block showing interface/props
3. **Step 2: Core logic** -- LiveStep showing the component working but minimal
4. **Step 3: Styling/animation** -- LiveStep where the visual effect kicks in, controls for tweaking
5. **Step 4: Final result** -- LiveStep with all key props as controls (colors, speed, sizes)
6. **Key takeaways** -- static text

### Scope per post

Each post needs specific components in scope:
- `blur-text`: `{ BlurText }` (from `@/components/library/text-animations/BlurText`)
- `tilted-card`: `{ TiltedCard }` (from `@/components/library/components/TiltedCard`)
- `electric-border`: `{ ElectricBorder }` (from `@/components/library/animations/ElectricBorder`)
- `line-waves`: `{ LineWaves }` (from `@/components/library/backgrounds/LineWaves`)

## Out of Scope

- Converting all 63 blog posts to walkthrough format (future work)
- Sandpack/full bundler (too heavy for this use case)
- Code execution beyond JSX rendering (no arbitrary JS eval)
- Saving/sharing playground state
