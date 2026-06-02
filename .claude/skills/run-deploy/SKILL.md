---
name: run-deploy
description: Run, build, test and deploy Portfolio Website. Use when the user wants to start the dev server, build, run tests, lint, or deploy this project, or asks how to run or ship it.
---

# Run & Deploy — Portfolio Website

Personal portfolio site — design + dev work showcase, blog, and contact form; a public-facing credibility surface and inbound-contact channel.

## Stack
- Framework: Next.js 16 (App Router), React 19, TypeScript
- UI / motion: MUI + Emotion, Bootstrap / react-bootstrap, Framer Motion / motion, GSAP, Lenis; Three.js + react-three-fiber / drei, OGL, matter-js for 3D/physics effects
- Content: MDX via `next-mdx-remote`, parsed with `gray-matter`; Shiki for code highlighting
- Email: Resend (contact form); EmailJS also installed
- Analytics: PostHog (`posthog-js`), EU region
- Package manager: pnpm (a `pnpm-lock.yaml` is present)
- Hosting target: Vercel (linked)

## Local development
```bash
pnpm install
pnpm dev
```
Dev server runs at http://localhost:3000.

## Build & production
```bash
pnpm build
pnpm start
```
`start` serves the production build at http://localhost:3000.

## Tests & lint
```bash
pnpm lint            # eslint . --ext .ts,.tsx,.js,.jsx
pnpm lint:fix        # same, with --fix
pnpm format          # prettier --write .
pnpm format:check    # prettier --check .
pnpm type-check      # tsc --noEmit
```
No unit-test framework is configured.

## Deploy
The project is already linked to Vercel — `.vercel/repo.json` links it to Vercel project `portfolio-website` (id `prj_d829sHRZPql5Mdq0EYLTUE90fubg`). Deploy to production with:
```bash
export PATH="$HOME/.local/bin:$PATH"
vercel --prod
```
The production URL is not recorded — the registry `project.md` has `url: null` (status `live`) and `hosting.tool: not_set_up`, so the registry hosting fields are stale and should be updated to reflect the Vercel link. Confirm the live URL from the Vercel dashboard.

## Environment variables
From `.env.example`:
- `NEXT_PUBLIC_POSTHOG_KEY` — PostHog public project API key (EU region) for analytics
- `NEXT_PUBLIC_POSTHOG_HOST` — optional PostHog host override; defaults to `https://eu.posthog.com` in code
- `RESEND_PORTFOLIO_KEY` — server-side Resend API key for transactional/contact-form email (do not prefix with `NEXT_PUBLIC_`)

Note: the code also references `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and `CONTACT_TO_EMAIL` (see `CONTACT_FORM_SETUP.md`), which are not listed in `.env.example` — confirm which Resend key name the contact-form handler actually expects before deploying.

## Gotchas
- This is Next.js 16 — APIs and conventions differ from older versions.
- No `CLAUDE.md` / `AGENTS.md`; contact-form setup details are in `CONTACT_FORM_SETUP.md`.
- PostHog env vars are reportedly set in Vercel for the Production environment only — add `NEXT_PUBLIC_POSTHOG_KEY` to the Preview and Development environments too (open registry need).
- Heavy 3D/animation dependency footprint (Three.js, GSAP, matter-js, OGL) — expect longer build times than a plain content site.
