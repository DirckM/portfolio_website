/**
 * The kit a subscriber asked for, as an email section and as plain text.
 *
 * Shared by the welcome email (first confirmation) and the "already
 * subscribed" email (someone on the list who asked again from a kit form), so
 * both hand over the same download in the same shape.
 */

import type { Kit } from '@/lib/kits';
import { renderSection } from './blocks';

export function renderKitSection(kit: Kit): string {
  return renderSection({
    kind: 'download',
    kicker: 'You asked for this',
    title: `Your ${kit.name}`,
    body: kit.blurb,
    image: kit.emailImage,
    alt: kit.emailImageAlt,
    link: { href: kit.href, cta: 'Download the kit' },
    meta: `ZIP, ${kit.size}. Unzip it into your .claude/skills folder.`,
  });
}

export function renderKitText(kit: Kit): string[] {
  return [
    `YOUR ${kit.name.toUpperCase()}`,
    '',
    kit.blurb,
    '',
    `Download (ZIP, ${kit.size}): ${kit.href}`,
    'Unzip it into your .claude/skills folder.',
    '',
  ];
}
