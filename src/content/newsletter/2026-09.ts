/**
 * Issue 1, September 2026.
 *
 * Sources for every claim, so a later edit can be checked against them:
 * - The Dishy post: src/content/blog/how-i-made-the-dishy-demo-videos.mdx
 * - The talk: projects-hub/projects/dishy/lessons.md, 2026-09-24 entry.
 *   Dishy is not in the App Store, so it is "building", never "launched".
 * - The Mollie reel: its caption, posted 2026-09-25 by @dirckmulder.
 * - The progress bar: src/content/blog/scroll-progress-css.mdx
 * - The showcase: mobile-designs remakes 41, 47 (2026-09-23) and
 *   mobile-designs-mood-jobs 48, 49 (2026-09-25), rendered from video/out/.
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
    'This month I presented Dishy, the app I am building for cooking once and eating all week. Afterwards someone asked how the app walkthrough went so smoothly. I did not touch the app during the demos. Here is how, plus the kit I packed it into.',

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
      kicker: 'Reel',
      title: 'A build night at Mollie',
      body: 'I spent an evening at Mollie’s headquarters in Amsterdam, at a build night put together with the help of day42. It was a super fun evening and I would love to come back. If you are anywhere around Amsterdam, let me know.',
      image: 'reel-mollie.jpg',
      alt: 'Dirck waving in the Mollie office, with people working at the tables behind him',
      link: {
        href: 'https://www.instagram.com/reel/DdtFlFtIaHf/',
        cta: 'Watch the reel',
      },
    },
    {
      type: 'app',
      kicker: 'The talk',
      title: 'Four slides and two videos',
      body: 'The Dishy deck was a title, the onboarding demo, a fridge and meal prep demo, and a thank you. Both demos were video files, so nothing on stage depended on a simulator or the network. The real app sat in a simulator next to the deck, for questions. Dishy is not in the App Store yet. I am still building it.',
      image: 'dishy-mealprep-phone.jpg',
      alt: 'Dishy’s week screen: a budget ring, the days of the week and tonight’s prep',
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
    title: 'The App demo kit',
    body: `You are already on the list, so here it is without the form. ${appDemoKit.blurb}`,
  },

  showcase: {
    title: 'Four app screens, rebuilt in HTML and animated',
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
