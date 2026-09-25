/**
 * Issue 1, September 2026.
 *
 * Sources for every claim, so a later edit can be checked against them:
 * - The Dishy post: src/content/blog/how-i-made-the-dishy-demo-videos.mdx
 * - The Mollie night: the reel's caption (posted 2026-09-25 by @dirckmulder),
 *   and Dirck confirmed on 2026-09-25 that the Dishy talk was at that night
 *   and that is where the question was asked.
 * - Mollie's mark: the header logo SVG from mollie.com, rendered to PNG.
 * - The progress bar: src/content/blog/scroll-progress-css.mdx
 * - The showcase: mobile-designs remakes 41, 47 (2026-09-23) and
 *   mobile-designs-mood-jobs 48, 49 (2026-09-25). All four rebuild screens
 *   from Dirck's Pinterest board. Only 47 has a traceable pin, and it names no
 *   designer (projects-hub/brand/social/x-favourites-mobile-screens-series.md).
 */

import type { IssueFile } from '@/lib/email/issue-file';
import { KITS } from '@/lib/kits';

const SITE = 'https://dirckmulder.com';
const appDemoKit = KITS.find(k => k.sourcePrefix === 'kit:app-demo')!;

const issue: IssueFile = {
  number: 1,
  slug: '2026-09',
  period: 'September',
  status: 'draft',
  subject: 'The app demo that played itself',

  headline: 'The demo that played itself',
  headlineEmphasis: 'itself',
  standfirst:
    'This month I presented Dishy at a Mollie build night in Amsterdam. Dishy is the app I am building for cooking once and eating all week. Someone there asked how the app walkthrough went so smoothly. I did not touch the app during the demos. Here is how, plus the kit I packed it into.',

  cover: {
    image: 'cover-2026-09.jpg',
    alt: 'Issue 001, September. A Dishy onboarding card, Beef and Tomato Rice Bowl, in an iPhone on an orange background.',
  },

  items: [
    {
      type: 'web',
      kicker: 'New post',
      title: 'How I made the Dishy app demo play itself',
      body: 'Every tap in the walkthrough was written into a UI test, filmed in the simulator and cut down by a script. On stage I pressed the arrow key and talked. The automatic cut took the meal prep take from 63.7 seconds to 48.3.',
      image: 'dishy-post.jpg',
      alt: 'The post, with the Dishy onboarding in an iPhone and a chapter list that follows the video',
      link: {
        href: `${SITE}/blog/how-i-made-the-dishy-demo-videos`,
        cta: 'Read the post',
        url: 'dirckmulder.com/blog/how-i-made-the-dishy-demo-videos',
      },
    },
    {
      type: 'reel',
      kicker: 'The night',
      title: 'A build night at Mollie',
      body: 'A build night at Mollie’s headquarters in Amsterdam, put together with the help of day42. It was a super fun evening and I would love to come back. If you are anywhere around Amsterdam, let me know.',
      image: 'reel-mollie.jpg',
      alt: 'Dirck waving in the Mollie office, with people working at the tables behind him',
      link: {
        href: 'https://www.instagram.com/reel/DdtFlFtIaHf/',
        cta: 'Watch the reel',
      },
      video: { src: 'reel-mollie.mp4', poster: 'reel-mollie-poster.jpg' },
      mark: {
        image: 'logo-mollie-white.png',
        alt: 'Mollie',
        width: 66,
        height: 20,
      },
    },
    {
      type: 'web',
      kicker: 'Tutorial',
      title: 'A reading progress bar with zero JavaScript',
      body: 'The line across the top of an article that fills as you read. The usual build is a scroll listener and a state update on every frame. This one is two keyframes and animation-timeline: scroll(). The post also covers what a browser without it should show instead.',
      image: 'progress-light.gif',
      alt: 'A progress bar and a ring filling up as a page scrolls',
      link: {
        href: `${SITE}/blog/scroll-progress-css`,
        cta: 'Read the tutorial',
      },
    },
  ],

  kit: {
    kit: appDemoKit,
    kicker: 'For subscribers',
    badge: 'Free',
    title: 'The App demo kit',
    body: `Free, and you are already on the list, so here it is without the form. ${appDemoKit.blurb}`,
  },

  showcase: {
    title: 'Four app screens, rebuilt in HTML and animated',
    note: 'Free, and you are already on the list. The code for all four, one folder each, open in any browser.',
    credit:
      'All four are rebuilt from screens I saved on Pinterest. I could not trace who designed them, and the disc carousel is the only one with a pin (pinterest.com/pin/744360644694129716). If one of them is yours, tell me and I will put your name here.',
    designs: {
      zip: 'showcase-2026-09-3013ea8526.zip',
      size: '1021 KB',
      sources: [
        {
          dir: 'mobile-designs-mood-jobs',
          screen: '48-mood-cloud',
          name: 'mood-check-in',
        },
        {
          dir: 'mobile-designs-mood-jobs',
          screen: '49-job-swipe',
          name: 'job-swipe-welcome',
        },
        {
          dir: 'mobile-designs',
          screen: '47-sticker-stack',
          name: 'disc-carousel',
        },
        {
          dir: 'mobile-designs',
          screen: '41-collections-empty',
          name: 'collections-empty-state',
        },
      ],
    },
    items: [
      {
        image: 'made-2026-09-mood.gif',
        alt: 'A green jelly mascot asking how you are feeling today',
        caption:
          'A mood check-in with a jelly mascot that changes colour and face for every mood.',
      },
      {
        image: 'made-2026-09-jobs.gif',
        alt: 'A job app welcome screen with a deck of job cards swiping itself',
        caption:
          'A job app welcome where the card deck scores and swipes itself.',
      },
      {
        image: 'made-2026-09-discs.gif',
        alt: 'A vertical carousel of stacked discs on a black screen',
        caption:
          'A carousel of stacked discs that squash, scale and blur as they pass the middle.',
      },
      {
        image: 'made-2026-09-collections.gif',
        alt: 'An empty collections screen with a fan of tilted photos',
        caption:
          'An empty state with a fan of tilted photos and a detached add button.',
      },
    ],
  },

  signoff:
    'That was issue one. If there is something you want me to take apart next month, reply to this email. It comes straight to me.',
};

export default issue;
