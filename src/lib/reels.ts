/**
 * Instagram reels the site links to, newest first.
 *
 * Instagram does not let a server read a profile, so this list is kept by
 * hand. Adding a reel is one entry: drop a 9:16 still in public/email/ and put
 * its entry at the top. The stills already carry a play mark, baked in for the
 * email clients that cannot draw one, so the page does not add a second.
 *
 * Sources: the two older reels are the pair in the welcome email
 * (src/lib/email/welcome.ts), the Mollie reel is issue 1's
 * (src/content/newsletter/2026-09.ts).
 */

export interface Reel {
  /** Instagram's shortcode, also the analytics id. */
  id: string;
  href: string;
  /** Path under public/. */
  image: string;
  caption: string;
  alt: string;
}

export const INSTAGRAM_PROFILE = 'https://www.instagram.com/dirckmulder/';

export const REELS: Reel[] = [
  {
    id: 'DdtFlFtIaHf',
    href: 'https://www.instagram.com/reel/DdtFlFtIaHf/',
    image: '/email/reel-mollie.jpg',
    caption: 'A build night at Mollie',
    alt: 'Dirck and a friend waving in the Mollie office in Amsterdam',
  },
  {
    id: 'DdN_CY9o4_U',
    href: 'https://www.instagram.com/reel/DdN_CY9o4_U/',
    image: '/email/reel-2.jpg',
    caption: 'The transformer is a weird thing',
    alt: 'Dirck explaining transformers, with a cat sticker above his head',
  },
  {
    id: 'DbC_50xokPJ',
    href: 'https://www.instagram.com/reel/DbC_50xokPJ/',
    image: '/email/reel-1.jpg',
    caption: 'If you use AI, you need this',
    alt: 'Dirck at his desk under the words Feedback Loop',
  },
];
