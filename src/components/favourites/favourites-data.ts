export interface FavouriteSite {
  slug: string;
  name: string;
  kind: string;
  blurb: string;
  /** Optional standalone production URL for projects outside Website Rebuilds. */
  url?: string;
  /** bar background, faithful to the rebuild's own palette */
  bg: string;
  /** text color on the bar */
  ink: string;
  /** vivid accent used for the CTA pill */
  accent: string;
  /** text color on the accent pill */
  accentInk: string;
}

export const FAVOURITES_BASE_URL = 'https://website-rebuilds.vercel.app';

export const favouriteUrl = (site: FavouriteSite) =>
  site.url ?? `${FAVOURITES_BASE_URL}/${site.slug}`;

export const favouriteSites: FavouriteSite[] = [
  {
    slug: 'artnesia',
    name: 'Artnesia',
    kind: 'Art marketplace landing',
    blurb:
      'A fan-out hero deck, headlines that ink in on scroll, folder tabs and a neon ticker.',
    bg: '#E4FB42',
    ink: '#141414',
    accent: '#141414',
    accentInk: '#E4FB42',
  },
  {
    slug: 'lsd',
    name: 'CRAVE',
    kind: 'Restaurant hero',
    blurb:
      'A hot-orange restaurant stage with kinetic type, playful food doodles and a stamped chicken hero.',
    bg: '#FF7E35',
    ink: '#1A1A1A',
    accent: '#FFF4EC',
    accentInk: '#8A3209',
  },
  {
    slug: 'studio',
    name: 'Studio',
    kind: 'Design studio portfolio',
    blurb:
      'A Swiss editorial grid with a pixel-cherry hero that morphs on scroll and oversized type.',
    bg: '#F9F7F8',
    ink: '#161616',
    accent: '#D6453D',
    accentInk: '#FFFFFF',
  },
  {
    slug: 'volta',
    name: 'VOLTA',
    kind: 'Creative studio WebGL',
    blurb:
      'An orange liquid-metal WebGL shape, orbiting chrome spheres and a precise creative-studio interface.',
    url: 'https://nexa-murex-kappa.vercel.app',
    bg: '#F5F3EE',
    ink: '#171717',
    accent: '#FF7E35',
    accentInk: '#171717',
  },
  {
    slug: 'frio',
    name: 'SECOND WIND',
    kind: 'Drinks brand hero',
    blurb:
      'A forest-green WebGL world with twin floating cans for long builds and late ideas.',
    bg: '#103C35',
    ink: '#ECFFF8',
    accent: '#A8F0D3',
    accentInk: '#103C35',
  },
  {
    slug: 'soda',
    name: 'LATE SHIFT',
    kind: 'Flavour colour switcher',
    blurb:
      'Four flavour panels that trade space on hover, with one shared WebGL scene of real 3D cans gliding between them.',
    bg: '#FF7E35',
    ink: '#1A1A1A',
    accent: '#1A1A1A',
    accentInk: '#FFFFFF',
  },
];
