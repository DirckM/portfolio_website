/**
 * Everything a signup form can ask to be handed over in the welcome email:
 * the fixed kits in kits.ts, and each newsletter issue's designs zip.
 *
 * A form on /designs/<slug> signs up with source `designs:<slug>`. The confirm
 * route and the subscribe route ask this file what that source gets, so the
 * zip arrives the same way the App demo kit does: in the welcome email after
 * the double opt-in, or in the "already subscribed" email for someone who was
 * already on the list, which keeps the subscribe endpoint's identical-response
 * privacy property.
 *
 * Separate from kits.ts because the issue files import kits.ts, and kits.ts
 * importing the issue files back would be a cycle.
 */

import { kitForSource, type Kit } from '@/lib/kits';
import { issueBySlug } from '@/content/newsletter';
import { SITE } from '@/lib/email/theme';

export function designsKit(slug: string): Kit | null {
  const f = issueBySlug(slug);
  const d = f?.showcase.designs;
  if (!f || !d) return null;
  const n = f.showcase.items.length;
  return {
    sourcePrefix: `designs:${slug}`,
    name: `${f.period} designs`,
    cta: 'Download the code',
    blurb: `The code of the ${['two', 'three', 'four'][n - 2]} screens from issue ${String(f.number).padStart(3, '0')}: plain HTML and CSS, one folder each, open in any browser. Free.`,
    fileName: d.zip,
    href: `${SITE}/kits/${d.zip}`,
    size: d.size,
    emailImage: f.showcase.items[0].image,
    emailImageAlt: f.showcase.items[0].alt,
    meta: `ZIP, ${d.size}. Open any folder's index.html in a browser.`,
  };
}

export function giveawayForSource(
  source: string | null | undefined
): Kit | null {
  if (!source) return null;
  const m = /^designs:(\d{4}-\d{2})(?::.*)?$/.exec(source);
  if (m) return designsKit(m[1]);
  return kitForSource(source);
}
