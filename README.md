# Portfolio Website

Dirck Mulder's personal portfolio, with an animated component-library showcase and a markdown blog.

## What it is

- A portfolio landing built from custom animated React components (carousels, 3D objects, scroll-reveal text, image trail, magnet, vinyl spinner)
- A component-library section that showcases each component (`(library)/components`)
- A markdown blog (`(library)/blog`, parsed with gray-matter)
- A contact form and privacy/terms pages

## Stack

- Next.js (App Router, `src/`), TypeScript
- framer-motion, gsap, lenis, and three/maath for motion and 3D
- MUI + Emotion and Bootstrap for UI
- Contact via a Resend API route (`api/contact`) and @emailjs/browser
- PostHog analytics, tagged with the `portfolio` super-property

## Structure

- `src/app/(portfolio)/` main portfolio page (plus an `old/` variant)
- `src/app/(library)/` blog, components showcase, privacy, terms
- `src/app/api/` contact and latest-blog-post endpoints
- `src/content/` markdown content

## Status

Live (deployed URL to confirm). Personal brand, no revenue model yet. Hub registry: `projects-hub/projects/portfolio/`.

## Develop

```bash
npm install
npm run dev
```

Contact form needs `RESEND_PORTFOLIO_KEY`.
