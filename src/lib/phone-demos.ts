/**
 * The phone demos a story post can embed with <PhoneDemo demo="..." />.
 *
 * The data lives here rather than in the MDX, because next-mdx-remote strips
 * JavaScript expressions from MDX props by default and an array of chapters is
 * exactly that. A post names a demo by id and gets everything else from here.
 *
 * Chapter times are the `data-at` values from the Dishy deck the videos were
 * shown in, so the list on the page follows the video the way it did on stage.
 */

export interface PhoneDemoChapter {
  /** Seconds into the video where this chapter starts. */
  at: number;
  label: string;
}

export interface PhoneDemoData {
  src: string;
  poster: string;
  /** The video's own pixel size, so the box is sized before it loads. */
  width: number;
  height: number;
  /**
   * True when the phone and its shadow are baked into the footage (a Remotion
   * render on white). False when the video is the bare screen and the page
   * has to put it inside the bezel.
   */
  framed: boolean;
  label: string;
  chapters: PhoneDemoChapter[];
}

/** Apple's iPhone 17 Pro bezel, the same PNG the deck used on stage. */
export const BEZEL = {
  src: '/blog/dishy-demo/iphone-17-pro-silver.png',
  width: 1350,
  height: 2760,
  // The screen opening, measured from the PNG's alpha channel.
  screen: { x: 72, y: 69, width: 1206, height: 2622, radius: 184 },
} as const;

export const phoneDemos: Record<string, PhoneDemoData> = {
  'dishy-onboarding': {
    src: '/blog/dishy-demo/dishy-demo-onboarding.mp4',
    poster: '/blog/dishy-demo/dishy-demo-onboarding.jpg',
    width: 604,
    height: 1314,
    framed: false,
    label: 'Dishy onboarding, from install to a planned week',
    chapters: [
      { at: 0, label: 'The promise' },
      { at: 4.5, label: 'What should get easier' },
      { at: 11.4, label: 'Household and budget' },
      { at: 26.7, label: 'Where you shop' },
      { at: 52.0, label: 'Time, kitchen, diet' },
      { at: 71.5, label: 'Taste, yes or no' },
      { at: 90.5, label: 'Your first week' },
    ],
  },
  'dishy-mealprep': {
    src: '/blog/dishy-demo/dishy-demo-mealprep.mp4',
    poster: '/blog/dishy-demo/dishy-demo-mealprep.jpg',
    width: 604,
    height: 1088,
    framed: true,
    label: 'Dishy prep day, a fridge photo and one cooking session',
    chapters: [
      { at: 0, label: 'The week, planned and priced' },
      { at: 6.0, label: 'A photo of the fridge' },
      { at: 14.0, label: 'What you have comes off the list' },
      { at: 18.9, label: 'Every dish cooked together' },
      { at: 24.6, label: 'One step at a time' },
      { at: 44.5, label: 'A dish is done' },
    ],
  },
};
