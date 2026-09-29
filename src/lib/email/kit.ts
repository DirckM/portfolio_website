/**
 * The kit a subscriber asked for, as an email section and as plain text.
 *
 * Shared by the welcome email (first confirmation) and the "already
 * subscribed" email (someone on the list who asked again from a kit form), so
 * both hand over the same download in the same shape.
 *
 * `href` is where the button goes. For a kit with a page it is that page with
 * the reader's own token (see src/lib/kit-access.ts and issue-file.ts), and
 * the button says "Get the kit". Without one it is the zip, as before.
 */

import type { Kit } from '@/lib/kits';
import { renderSection, type Section } from './blocks';

/**
 * The kit as a 'download' section. An issue hands a kit to the whole list
 * with its own kicker and copy, the welcome email with the defaults below.
 */
const cta = (kit: Kit, href: string) =>
  kit.cta ?? (href === kit.href ? 'Download the kit' : 'Get the kit');

export function kitSection(
  kit: Kit,
  copy: { kicker?: string; title?: string; body?: string; badge?: string } = {},
  href: string = kit.href
): Extract<Section, { kind: 'download' }> {
  return {
    kind: 'download',
    kicker: copy.kicker ?? 'You asked for this',
    title: copy.title ?? `Your ${kit.name}`,
    body: copy.body ?? kit.blurb,
    image: kit.emailImage,
    alt: kit.emailImageAlt,
    link: { href, cta: cta(kit, href) },
    meta:
      kit.meta ?? `ZIP, ${kit.size}. Unzip it into your .claude/skills folder.`,
    ...(copy.badge ? { badge: copy.badge } : {}),
  };
}

export function renderKitSection(kit: Kit, href: string = kit.href): string {
  return renderSection(kitSection(kit, {}, href));
}

export function renderKitText(kit: Kit, href: string = kit.href): string[] {
  return [
    `YOUR ${kit.name.toUpperCase()}`,
    '',
    kit.blurb,
    '',
    href === kit.href
      ? `Download (ZIP, ${kit.size}): ${href}`
      : `${cta(kit, href)} (ZIP, ${kit.size}): ${href}`,
    kit.meta ?? 'Unzip it into your .claude/skills folder.',
    '',
  ];
}
