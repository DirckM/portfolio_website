/**
 * Giveaways that arrive by email after a newsletter signup.
 *
 * A kit is a zip in public/kits/ with a filename nobody would guess, linked
 * from the welcome email (and from the "already subscribed" email for someone
 * who was on the list before). There is deliberately no token system: the
 * files are free and public, the email is just the way they are handed over.
 * Anyone who is sent the link can share it, and that is fine.
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
  /** The download button's label. Defaults to "Download the kit". */
  cta?: string;
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
  },
];

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
