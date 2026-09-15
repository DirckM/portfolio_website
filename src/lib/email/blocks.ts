/**
 * The section shapes an issue can be built from.
 *
 * There are five on purpose. The first version rendered every item as the same
 * card, and the verdict was that it was "just blocks below one another". The
 * fix is not better copy inside the card, it is having more than one card.
 * `layout()` at the bottom is what stops the generator sliding back into a
 * single repeated shape.
 */

import { escapeHtml } from '@/lib/escape-html';
import { T, FONT, SERIF, IMG } from './theme';

/**
 * What an issue tags its outbound links with.
 *
 * There is no tracking pixel and no redirect domain here. Links carry UTM
 * parameters and land on our own site, where PostHog already runs and already
 * tags every pageview with `project: 'portfolio'`. Attribution therefore
 * happens where the visitor already is rather than by reaching into their mail
 * client, which is both a better signal and the only version that needs no
 * separate consent under ePrivacy Art. 5(3).
 *
 * Deliberately absent: opens. Around 62% of recorded email opens are Apple
 * Mail Privacy Protection prefetching images, and at this list size the human
 * signal is smaller than the machine noise.
 */
export interface TrackCtx {
  /** Issue slug, e.g. '2026-09'. */
  campaign: string;
}

/**
 * Append UTM parameters, but only to our own links.
 *
 * A link to someone else's site is left exactly as written: tagging a third
 * party's URL with our campaign pollutes their analytics and tells us nothing,
 * because we never see the resulting pageview.
 */
export function trackedHref(
  href: string,
  ctx: TrackCtx | undefined,
  content: string
): string {
  if (!ctx) return href;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href; // relative or malformed, leave it alone
  }
  if (!/(^|\.)dirckmulder\.com$/.test(url.hostname)) return href;
  url.searchParams.set('utm_source', 'newsletter');
  url.searchParams.set('utm_medium', 'email');
  url.searchParams.set('utm_campaign', ctx.campaign);
  if (content) url.searchParams.set('utm_content', content);
  return url.toString();
}

/** A stable, readable utm_content from a section title. */
function slugify(t: string): string {
  return t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/**
 * A destination that actually shows the thing.
 *
 * Optional, and that is the point. Hearsay and Duel have no page of their own,
 * so an issue about them carries no button: sending someone to the homepage
 * from "Have a look" is a small lie, and it teaches people that the buttons in
 * this email are not worth pressing. No link, no button.
 */
export interface Link {
  href: string;
  cta: string;
  /** Shown in the browser chrome. Defaults to href without the scheme. */
  url?: string;
}

interface Base {
  kicker: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  link?: Link;
}

export type Section =
  | ({ kind: 'browser' } & Base)
  | ({ kind: 'tinted' } & Base)
  | ({ kind: 'device'; side: 'left' | 'right' } & Base)
  | ({ kind: 'inline' } & Base)
  | { kind: 'quote'; text: string; image: string; alt: string };

const kicker = (t: string) =>
  `<div style="font-family:${FONT};font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${T.orangeDeep};font-weight:700;margin-bottom:10px;">${escapeHtml(t)}</div>`;

const h2 = (t: string) =>
  `<h2 style="margin:0 0 10px;font-family:${FONT};font-size:23px;line-height:1.24;letter-spacing:-.025em;color:${T.ink};font-weight:700;">${escapeHtml(t)}</h2>`;

/** Trailing margin closes up when no button follows, so the gap stays even. */
const para = (t: string, hasButton: boolean) =>
  `<p style="margin:0 0 ${hasButton ? 18 : 0}px;font-family:${FONT};font-size:15px;line-height:1.65;color:${T.body};">${escapeHtml(t)}</p>`;

const pill = (link: Link | undefined, ctx: TrackCtx | undefined, content: string) =>
  link
    ? `<a href="${escapeHtml(trackedHref(link.href, ctx, content))}" style="display:inline-block;background:${T.ink};color:#fff;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;text-decoration:none;padding:12px 22px;border-radius:99px;">${escapeHtml(link.cta)}</a>`
    : '';

/** Only wrap the image in a link when there is somewhere real to go. */
const maybeLink = (
  html: string,
  link: Link | undefined,
  ctx: TrackCtx | undefined,
  content: string
) => (link ? `<a href="${escapeHtml(trackedHref(link.href, ctx, content))}">${html}</a>` : html);

const copy = (s: Base, ctx?: TrackCtx) =>
  `${kicker(s.kicker)}${h2(s.title)}${para(s.body, !!s.link)}${pill(s.link, ctx, slugify(s.title))}`;

export function renderSection(s: Section, ctx?: TrackCtx): string {
  switch (s.kind) {
    case 'browser': {
      const tag = slugify(s.title);
      const bar = s.link?.url ?? s.link?.href.replace(/^https?:\/\//, '') ?? 'dirckmulder.com';
      const img = `<img src="${IMG}/${s.image}" width="100%" alt="${escapeHtml(s.alt)}" style="display:block;width:100%;border:0;">`;
      return `
<tr><td class="p" style="padding:0 34px 14px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#fbfaf8;border:1px solid ${T.rule};border-radius:14px;overflow:hidden;">
    <tr><td style="padding:11px 14px;border-bottom:1px solid ${T.rule};font-family:${FONT};font-size:11px;color:${T.mute};">
      <span style="color:#e4e2dd;letter-spacing:2px;">&#9679;&#9679;&#9679;</span>
      <span style="margin-left:10px;">${escapeHtml(bar)}</span>
    </td></tr>
    <tr><td style="line-height:0;font-size:0;">${maybeLink(img, s.link, ctx, tag)}</td></tr>
  </table>
</td></tr>
<tr><td class="p" style="padding:0 34px 34px;">${copy(s, ctx)}</td></tr>`;
    }

    case 'tinted': {
      const tag = slugify(s.title);
      const img = `<img src="${IMG}/${s.image}" width="100%" alt="${escapeHtml(s.alt)}" style="display:block;width:100%;border-radius:12px;border:1px solid ${T.rule};">`;
      return `
<tr><td style="padding:0 0 34px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${T.tint};">
    <tr><td class="p" style="padding:30px 34px 18px;">${copy(s, ctx)}</td></tr>
    <tr><td style="padding:22px 34px 30px;line-height:0;font-size:0;">${maybeLink(img, s.link, ctx, tag)}</td></tr>
  </table>
</td></tr>`;
    }

    case 'device': {
      const tag = slugify(s.title);
      const img = `<img src="${IMG}/${s.image}" width="210" alt="${escapeHtml(s.alt)}" style="display:block;width:210px;border-radius:14px;border:0;">`;
      const media = `<td class="col" width="210" valign="middle" style="padding-${s.side === 'left' ? 'right' : 'left'}:22px;">${maybeLink(img, s.link, ctx, tag)}</td>`;
      const words = `<td class="col" valign="middle"${s.side === 'right' ? ` style="padding-right:22px;"` : ''}>${copy(s, ctx)}</td>`;
      return `
<tr><td class="p" style="padding:0 34px 30px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    ${s.side === 'left' ? media + words : words + media}
  </tr></table>
</td></tr>`;
    }

    case 'quote':
      return `
<tr><td style="padding:0 0 30px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${T.band};border-top:1px solid ${T.rule};border-bottom:1px solid ${T.rule};">
    <tr>
      <td class="col" width="186" style="padding:26px 0 26px 34px;">
        <img src="${IMG}/${s.image}" width="158" alt="${escapeHtml(s.alt)}" style="display:block;width:158px;border-radius:14px;border:0;">
      </td>
      <td class="col" valign="middle" style="padding:26px 34px;">
        <p style="margin:0;font-family:${SERIF};font-size:25px;line-height:1.34;color:${T.ink};font-style:italic;">${escapeHtml(s.text)}</p>
      </td>
    </tr>
  </table>
</td></tr>`;

    case 'inline': {
      const tag = slugify(s.title);
      const img = `<img src="${IMG}/${s.image}" width="94" alt="${escapeHtml(s.alt)}" style="display:block;width:94px;border-radius:10px;border:1px solid ${T.rule};">`;
      return `
<tr><td class="p" style="padding:0 34px 30px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td width="112" valign="middle" style="padding-right:18px;">${maybeLink(img, s.link, ctx, tag)}</td>
    <td valign="middle" style="font-family:${FONT};">
      ${kicker(s.kicker)}
      <div style="font-size:16px;line-height:1.3;color:${T.ink};font-weight:700;margin-bottom:6px;">${escapeHtml(s.title)}</div>
      <div style="font-size:14px;line-height:1.55;color:${T.body};">${escapeHtml(s.body)}</div>
    </td>
  </tr></table>
</td></tr>`;
    }
  }
}

export interface Item extends Base {
  /** web renders in browser chrome, app renders in a phone, note is a quiet row. */
  type: 'web' | 'app' | 'note';
}

export interface QuoteBreak {
  text: string;
  image: string;
  alt: string;
}

/**
 * Assign shapes so no two neighbours look the same.
 *
 * THIS IS THE ANTI-STACKING RULE, and it lives in code rather than a style note
 * because a note cannot stop a generator emitting five identical cards. Web
 * items alternate browser and tinted, apps alternate which side the phone sits
 * on, and everything else falls through to the quiet inline row.
 *
 * The optional photograph break is placed by rule too: once, after the first
 * group, and only when the issue is long enough to need a breath. Letting the
 * drafting model decide where it goes is how you end up with three of them.
 */
export function layout(items: Item[], quote?: QuoteBreak): Section[] {
  let web = 0;
  let app = 0;
  const shaped = items.map(({ type, ...rest }): Section => {
    if (type === 'web') {
      return web++ % 2 === 0 ? { kind: 'browser', ...rest } : { kind: 'tinted', ...rest };
    }
    if (type === 'app') {
      return { kind: 'device', side: app++ % 2 === 0 ? 'left' : 'right', ...rest };
    }
    return { kind: 'inline', ...rest };
  });

  if (!quote || shaped.length < 4) return shaped;

  // After the run of web items, which is the natural seam between "things I
  // wrote" and "things I built".
  const seam = items.findIndex(i => i.type !== 'web');
  const at = seam <= 0 ? Math.ceil(shaped.length / 2) : seam;
  return [...shaped.slice(0, at), { kind: 'quote', ...quote }, ...shaped.slice(at)];
}
