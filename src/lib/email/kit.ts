/**
 * The kit a subscriber asked for, as an email section and as plain text.
 *
 * Shared by the welcome email (first confirmation) and the "already
 * subscribed" email (someone on the list who asked again from a kit form), so
 * both hand over the same download in the same shape.
 */

import type { Kit } from '@/lib/kits';
import { renderSection, type Section } from './blocks';

/**
 * The kit as a 'download' section. An issue hands a kit to the whole list
 * with its own kicker and copy, the welcome email with the defaults below.
 */
export function kitSection(
  kit: Kit,
  copy: { kicker?: string; title?: string; body?: string; badge?: string } = {}
): Extract<Section, { kind: 'download' }> {
  return {
    kind: 'download',
    kicker: copy.kicker ?? 'You asked for this',
    title: copy.title ?? `Your ${kit.name}`,
    body: copy.body ?? kit.blurb,
    image: kit.emailImage,
    alt: kit.emailImageAlt,
    link: { href: kit.href, cta: kit.cta ?? 'Download the kit' },
    meta:
      kit.meta ?? `ZIP, ${kit.size}. Unzip it into your .claude/skills folder.`,
    ...(copy.badge ? { badge: copy.badge } : {}),
  };
}

export function renderKitSection(kit: Kit): string {
  return renderSection(kitSection(kit));
}

export function renderKitText(kit: Kit): string[] {
  return [
    `YOUR ${kit.name.toUpperCase()}`,
    '',
    kit.blurb,
    '',
    `Download (ZIP, ${kit.size}): ${kit.href}`,
    kit.meta ?? 'Unzip it into your .claude/skills folder.',
    '',
  ];
}
