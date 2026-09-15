/**
 * The email design system, in one place.
 *
 * This is the house style for every email dirckmulder.com sends, arrived at by
 * building three directions, looking at them, and having Dirck reject the first
 * two. What survived, and why:
 *
 * - White ground. The dark version looked like a product changelog rather than
 *   a person's newsletter.
 * - Orange from the site, never the social yellow. An email that links to the
 *   site should not change palette on the way there.
 * - His photograph appears at human scale, as a byline and an accent. A
 *   full-bleed hero of himself was the first thing he threw out.
 * - Type is real HTML, not baked into images. It selects, it scales, and it
 *   survives images being switched off, which is how a lot of first opens
 *   render.
 */

export const T = {
  page: '#f4f2ee',
  card: '#ffffff',
  tint: '#fbf7f3',
  band: '#faf9f7',
  ink: '#0d0d0f',
  body: '#4a4a4f',
  mute: '#8a8a90',
  rule: '#eceae6',
  orange: '#ff7e35',
  orangeDeep: '#c44b10',
} as const;

export const FONT =
  "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

/** Emphasis face only. Google-hosted, with a real serif fallback. */
export const SERIF = "'Instrument Serif',Georgia,'Times New Roman',serif";

export const SITE = 'https://dirckmulder.com';
export const IMG = `${SITE}/email`;
