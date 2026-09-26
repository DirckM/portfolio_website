/**
 * The shape of one newsletter issue on disk, and the one function that turns
 * it into what renderIssue() draws.
 *
 * An issue is a typed DATA file in src/content/newsletter/<slug>.ts. It never
 * contains HTML: the design lives in blocks.ts and issue.ts, and the file only
 * says what goes in it. Where things go is decided here, by rule:
 *
 *   cover -> headline -> items (shaped by layout(), kit right under the lead)
 *         -> "Made this month" showcase -> items marked afterShowcase -> sign-off
 *
 * The send script, the preview route and the tests all go through toIssue(),
 * so what Dirck approves in the preview is what a subscriber receives.
 */

import type { Kit } from '@/lib/kits';
import {
  layout,
  type Item,
  type QuoteBreak,
  type ShowcaseItem,
  type Section,
} from './blocks';
import type { Issue } from './issue';
import { kitSection } from './kit';
import { SITE } from './theme';

/**
 * draft: being written. approved: Dirck has read the preview and said send.
 * sent: gone out. The send script refuses anything that is not 'approved',
 * so flipping this line is the approval, and it lands in git with his name.
 */
export type IssueStatus = 'draft' | 'approved' | 'sent';

export interface IssueFile {
  number: number;
  /** e.g. '2026-09'. The utm_campaign, the idempotency key, the table key. */
  slug: string;
  /** e.g. 'September'. */
  period: string;
  subject: string;
  status: IssueStatus;
  headline: string;
  /** One word from the headline, set in the serif italic. */
  headlineEmphasis?: string;
  standfirst: string;
  /** Made per issue with scripts/make-cover.mjs. 1200px wide, in /public/email. */
  cover: { image: string; alt: string };
  /** The first item is the lead. layout() decides every item's shape. */
  items: Item[];
  /**
   * A kit handed to the whole list, placed directly under the lead item it
   * belongs to. Subscribers already confirmed, so they get the file, not a form.
   */
  kit?: {
    kit: Kit;
    kicker: string;
    title: string;
    body: string;
    badge?: string;
  };
  quote?: QuoteBreak;
  /** "Made this month": 2 to 4 things Dirck designed. Always rendered. */
  showcase: {
    title: string;
    items: ShowcaseItem[];
    /**
     * Who the designs are based on. Required when they rebuild someone else's
     * work: giving away code of another designer's shot without saying so is
     * not OK, and "designer unknown" is a valid, honest answer.
     */
    credit: string;
    /** Line above the button, e.g. that the code is free. */
    note?: string;
    /**
     * The code of the showcased designs, as a zip in public/kits made by
     * `pnpm make-showcase-zip <slug>`. Its presence adds the "Get the code"
     * button, which opens /designs/<slug> with the reader's own token.
     */
    designs?: {
      zip: string;
      size: string;
      /** Where each design's source lives, for the zip builder. */
      sources: { dir: string; screen: string; name: string }[];
    };
  };
  signoff: string;
  signoffImage?: string;
}

/**
 * Everything a reader sees, as one list of strings, for the writing rules.
 */
export function issueProse(f: IssueFile): string[] {
  return [
    f.subject,
    f.headline,
    f.standfirst,
    f.signoff,
    f.cover.alt,
    f.showcase.title,
    f.showcase.credit,
    f.showcase.note ?? '',
    ...f.items.flatMap(i => [
      i.kicker,
      i.title,
      i.body,
      i.alt,
      i.link?.cta ?? '',
    ]),
    ...(f.kit ? [f.kit.kicker, f.kit.title, f.kit.body] : []),
    ...(f.quote ? [f.quote.text, f.quote.alt] : []),
    ...f.showcase.items.flatMap(s => [s.caption, s.alt]),
  ].filter(Boolean);
}

/**
 * The rules an issue file has to meet before anything renders it. Returned as
 * a list of problems rather than thrown one at a time, so a draft shows every
 * issue at once.
 *
 * The prose rules are Dirck's house style (no semicolons, no em dashes). They
 * are checked here because a style note does not stop a drafter, and this
 * runs in the test, in the preview and in the send script.
 */
export function validateIssueFile(f: IssueFile): string[] {
  const errors: string[] = [];
  if (!/^\d{4}-\d{2}$/.test(f.slug))
    errors.push(`slug "${f.slug}" is not YYYY-MM`);
  if (!Number.isInteger(f.number) || f.number < 1)
    errors.push('number must be a positive integer');
  if (!f.subject.trim()) errors.push('subject is empty');
  if (!f.cover?.image || !f.cover?.alt)
    errors.push('cover needs an image and alt text');
  if (f.items.length < 1) errors.push('an issue needs at least one item');
  const n = f.showcase.items.length;
  if (n < 2 || n > 4) errors.push(`showcase needs 2 to 4 items, has ${n}`);
  if (f.headlineEmphasis && !f.headline.includes(f.headlineEmphasis)) {
    errors.push(
      `headlineEmphasis "${f.headlineEmphasis}" is not in the headline`
    );
  }
  for (const t of issueProse(f)) {
    if (t.includes(';')) errors.push(`semicolon in: "${t.slice(0, 60)}"`);
    if (/[—–]/.test(t)) errors.push(`em or en dash in: "${t.slice(0, 60)}"`);
  }
  return errors;
}

/** The page a showcase links to. `t` is the reader's own designs token. */
export function designsUrl(slug: string, token?: string): string {
  return `${SITE}/designs/${slug}${token ? `?t=${encodeURIComponent(token)}` : ''}`;
}

/**
 * The file plus per-recipient tokens, ready for renderIssue(). The designs
 * token is separate from the unsubscribe token: see the issue_sends migration.
 */
export function toIssue(
  f: IssueFile,
  unsubscribeToken: string,
  designsToken?: string
): Issue {
  // Shapes and numbers are assigned over the whole list, so an item moved below
  // the showcase keeps its number and the anti-stacking rule still holds.
  const laid: Section[] = layout(f.items, f.quote);
  const afterIdx = new Set(
    f.items.flatMap((it, i) => (it.afterShowcase ? [i + 1] : []))
  );
  const isAfter = (s: Section) => 'n' in s && afterIdx.has(s.n as number);
  const strip = (s: Section): Section => {
    if (!('afterShowcase' in s)) return s;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { afterShowcase, ...rest } = s as Section & { afterShowcase?: boolean };
    return rest as Section;
  };
  const sections = laid.filter(s => !isAfter(s)).map(strip);
  const sectionsAfter = laid.filter(isAfter).map(strip);
  if (f.kit) {
    const { kit, ...copy } = f.kit;
    sections.splice(1, 0, kitSection(kit, copy));
  }
  return {
    number: f.number,
    slug: f.slug,
    period: f.period,
    headline: f.headline,
    headlineEmphasis: f.headlineEmphasis,
    standfirst: f.standfirst,
    cover: f.cover,
    sections,
    sectionsAfter,
    showcase: {
      title: f.showcase.title,
      items: f.showcase.items,
      credit: f.showcase.credit,
      note: f.showcase.note,
      code: f.showcase.designs
        ? {
            href: designsUrl(f.slug, designsToken ?? 'preview_token_not_real'),
            cta: 'Get the code',
          }
        : undefined,
    },
    signoff: f.signoff,
    signoffImage: f.signoffImage,
    unsubscribeToken,
  };
}
