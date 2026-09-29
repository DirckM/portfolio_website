/**
 * Giveaways that arrive by email after a newsletter signup.
 *
 * A kit is a zip in public/kits/ with a filename nobody would guess. A kit
 * with a `page` has its own landing page at /kits/<id>, built the same way as
 * /designs/<slug>: a subscriber arrives with a token (from an issue or from
 * their welcome email), downloads it and gets a share link, and anyone else
 * gets the signup form. The emails link that page, never the zip itself. See
 * src/lib/designs.ts for the access and tracking rules, which are shared.
 *
 * A signup form asks for a kit by its source, e.g. `kit:app-demo` or
 * `kit:app-demo:top`. The source is stored on the subscriber row, so the
 * confirm route can still tell which kit to include when the link is clicked.
 *
 * The zip is built from kits/<name>/ in this repo:
 *   cd kits && zip -rX ../public/kits/<file>.zip app-demo-kit -x '.*'
 */

import { SITE } from '@/lib/email/theme';

export interface Kit {
  /** Every signup source that starts with this gets the kit. */
  sourcePrefix: string;
  name: string;
  /** One sentence for the email, saying what is in the zip. */
  blurb: string;
  href: string;
  fileName: string;
  /** Shown next to the button, so nobody is surprised by the download. */
  size: string;
  /** Picture for the email section, from public/email/. */
  emailImage: string;
  emailImageAlt: string;
  /** The line under the download button. Defaults to the Claude skills one. */
  meta?: string;
  /** The email button's label. Defaults to "Get the kit". */
  cta?: string;
  /** The landing page at /kits/<id>. Only kits with one get a page. */
  page?: KitPage;
}

/** Everything /kits/<id> shows, so the page itself holds no copy. */
export interface KitPage {
  /** Small caps line above the title. */
  kicker: string;
  title: string;
  /** The one line under the title. */
  line: string;
  /** What is in the zip, one row per file. */
  inside: { file: string; what: string }[];
  /** The post that explains it. */
  post: { href: string; title: string };
  /** A bare screen recording that plays inside the iPhone bezel. */
  demo: {
    src: string;
    poster: string;
    width: number;
    height: number;
    label: string;
  };
  /** For the page's share preview, from public/. */
  ogImage: { src: string; width: number; height: number; alt: string };
}

export const KITS: Kit[] = [
  {
    sourcePrefix: 'kit:app-demo',
    name: 'App demo kit',
    blurb:
      'The Claude Code skill and templates I use to film an app demo that plays by itself: a UI test that taps at human pace, the recording script, the auto-cut and a web page with the phone and a chapter list.',
    fileName: 'app-demo-kit-17c4cf6527.zip',
    href: `${SITE}/kits/app-demo-kit-17c4cf6527.zip`,
    size: '14 KB',
    emailImage: 'kit-app-demo.jpg',
    emailImageAlt: 'An app demo playing inside an iPhone bezel',
    page: {
      kicker: 'Claude Code skill',
      title: 'The App demo kit',
      line: 'The skill and templates behind the Dishy demo that played itself on stage. A UI test taps at human pace, a script films it and another cuts the dead time out.',
      inside: [
        {
          file: 'SKILL.md',
          what: 'The Claude Code skill: the order to do it in, and the traps I hit.',
        },
        {
          file: 'DemoRecording.swift',
          what: 'A UI test that taps at human pace and logs every tap.',
        },
        {
          file: 'record.sh',
          what: 'Films one take of that test in a simulator of your choice.',
        },
        {
          file: 'demo-edit.py',
          what: 'Cuts the still stretches out, so the take plays without waiting.',
        },
      ],
      post: {
        href: '/blog/how-i-made-the-dishy-demo-videos',
        title: 'How I made the Dishy app demo play itself',
      },
      demo: {
        src: '/blog/dishy-demo/dishy-demo-onboarding.mp4',
        poster: '/blog/dishy-demo/dishy-demo-onboarding.jpg',
        width: 604,
        height: 1314,
        label: 'The Dishy onboarding, recorded the way this kit does it',
      },
      ogImage: {
        src: '/email/dishy-post.jpg',
        width: 1064,
        height: 775,
        alt: 'The Dishy onboarding in an iPhone, next to a chapter list that follows the video',
      },
    },
  },
];

/** `app-demo` for the kit whose prefix is `kit:app-demo`. */
export const kitId = (kit: Kit) => kit.sourcePrefix.replace(/^kit:/, '');

/** The kit behind /kits/<id>, or null when it has no page. */
export function kitWithPage(id: string | null | undefined): Kit | null {
  if (!id || !/^[a-z0-9-]{1,40}$/.test(id)) return null;
  const kit = KITS.find(k => kitId(k) === id);
  return kit?.page ? kit : null;
}

/**
 * The kit's landing page. `t` is the reader's own token: an issue's designs
 * token, or the one minted for their welcome email.
 */
export function kitPageUrl(kit: Kit, token?: string): string {
  return `${SITE}/kits/${kitId(kit)}${token ? `?t=${encodeURIComponent(token)}` : ''}`;
}

/** The kit a signup source asked for, if any. */
export function kitForSource(source: string | null | undefined): Kit | null {
  if (!source) return null;
  return (
    KITS.find(
      k => source === k.sourcePrefix || source.startsWith(`${k.sourcePrefix}:`)
    ) ?? null
  );
}

/** For the preview routes: `?kit=app-demo` picks the kit whose prefix is kit:app-demo. */
export function kitByName(name: string | null): Kit | null {
  if (!name) return null;
  return kitForSource(`kit:${name}`);
}

/** What the preview routes link the kit button to: the page, with a dummy token. */
export function previewKitHref(kit: Kit): string {
  return kit.page ? kitPageUrl(kit, 'preview_token_not_real') : kit.href;
}
