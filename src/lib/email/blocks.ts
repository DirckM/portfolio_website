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
export function slugify(t: string): string {
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
  /**
   * Position in the issue, printed in front of the kicker as "01". Assigned by
   * layout(), never by the drafter, so the numbers cannot skip or repeat.
   */
  n?: number;
  /**
   * An mp4 in /public/email that plays inside the email where the client can
   * (Apple Mail), with `image` as the fallback everywhere else. Reel shape only.
   * See VIDEO_CSS for how the two are swapped.
   */
  video?: { src: string; poster: string };
  /**
   * A small mark above the title saying where this happened, e.g. the host's
   * own logo. A PNG at 2x in /public/email, in the colours that host uses on
   * a dark background. Reel shape only.
   */
  mark?: { image: string; alt: string; width: number; height: number };
}

/**
 * One tile in the "Made this month" grid. A thing Dirck designed, shown as an
 * image or a GIF, with one line saying what it is. The link is optional for the
 * same reason as everywhere else: no page, no link.
 */
export interface ShowcaseItem {
  /** Filename in /public/email. A GIF loops, a JPEG sits still. */
  image: string;
  alt: string;
  caption: string;
  link?: { href: string };
}

export type Section =
  | ({ kind: 'browser' } & Base)
  | ({ kind: 'tinted' } & Base)
  | ({ kind: 'device'; side: 'left' | 'right' } & Base)
  | ({ kind: 'inline' } & Base)
  | ({ kind: 'reel' } & Base)
  | { kind: 'quote'; text: string; image: string; alt: string }
  | ({ kind: 'download'; link: Link; meta: string; badge?: string } & Omit<
      Base,
      'link'
    >)
  | {
      kind: 'showcase';
      title: string;
      items: ShowcaseItem[];
      /** Where the designs came from, printed small under the grid. */
      credit?: string;
      /** One line next to the button, e.g. that the code is free. */
      note?: string;
      /** The per-recipient link to the designs page, with its CTA. */
      code?: { href: string; cta: string };
    };

const kicker = (t: string) =>
  `<div style="font-family:${FONT};font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${T.orangeDeep};font-weight:700;margin-bottom:10px;">${escapeHtml(t)}</div>`;

/**
 * The issue's kicker: a big orange number, a short orange rule, then the
 * label. Heavier than the plain kicker on purpose. It is what gives a long
 * email its rhythm, the way chapter numbers do in a magazine, and it only
 * appears in issues, so the welcome and confirm emails keep the quiet one.
 */
const numbered = (t: string, n: number | undefined, onDark = false) =>
  n === undefined
    ? kicker(t)
    : `<div style="font-family:${FONT};margin-bottom:12px;line-height:1;">
        <span style="font-size:22px;font-weight:800;letter-spacing:-.03em;color:${T.orange};vertical-align:middle;">${String(n).padStart(2, '0')}</span>
        <span style="display:inline-block;width:22px;height:2px;background:${T.orange};vertical-align:middle;margin:0 9px 0 8px;"></span>
        <span style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;font-weight:800;color:${onDark ? '#ffffff' : T.ink};vertical-align:middle;">${escapeHtml(t)}</span>
      </div>`;

/** A small orange pill, e.g. FREE, next to a kicker. */
export const badgePill = (t: string) =>
  `<span style="display:inline-block;vertical-align:middle;margin-left:8px;padding:3px 8px 3px;border-radius:99px;background:${T.orange};color:#ffffff;font-family:${FONT};font-size:10px;line-height:1.2;letter-spacing:.14em;font-weight:800;text-transform:uppercase;">${escapeHtml(t)}</span>`;

const h2 = (t: string) =>
  `<h2 style="margin:0 0 10px;font-family:${FONT};font-size:23px;line-height:1.24;letter-spacing:-.025em;color:${T.ink};font-weight:700;">${escapeHtml(t)}</h2>`;

/** Trailing margin closes up when no button follows, so the gap stays even. */
const para = (t: string, hasButton: boolean) =>
  `<p style="margin:0 0 ${hasButton ? 18 : 0}px;font-family:${FONT};font-size:15px;line-height:1.65;color:${T.body};">${escapeHtml(t)}</p>`;

const pill = (
  link: Link | undefined,
  ctx: TrackCtx | undefined,
  content: string
) =>
  link
    ? `<a href="${escapeHtml(trackedHref(link.href, ctx, content))}" style="display:inline-block;background:${T.ink};color:#fff;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;text-decoration:none;padding:12px 22px;border-radius:99px;">${escapeHtml(link.cta)}</a>`
    : '';

/** Only wrap the image in a link when there is somewhere real to go. */
const maybeLink = (
  html: string,
  link: Link | undefined,
  ctx: TrackCtx | undefined,
  content: string
) =>
  link
    ? `<a href="${escapeHtml(trackedHref(link.href, ctx, content))}">${html}</a>`
    : html;

const copy = (s: Base, ctx?: TrackCtx) =>
  `${numbered(s.kicker, s.n)}${h2(s.title)}${para(s.body, !!s.link)}${pill(s.link, ctx, slugify(s.title))}`;

/**
 * The house primary button: orange, square-ish, the one the welcome email uses
 * for its main action. The black pill above is for "have a look" links inside
 * an issue, where no single link is the point of the email.
 */
const primaryButton = (href: string, cta: string) => `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:${T.orange};border-radius:10px;">
        <a href="${escapeHtml(href)}"
           style="display:inline-block;padding:14px 26px;font-family:${FONT};font-size:13px;font-weight:700;
                  letter-spacing:.08em;text-transform:uppercase;color:#ffffff;text-decoration:none;">${escapeHtml(cta)}</a>
      </td></tr>
    </table>`;

/**
 * Mobile rules for the 'download' shape. Any email that renders one has to put
 * this in its <style> block. It has its own classes because the shared `.col`
 * rule zeroes the padding, which is right for a bare column and puts the copy
 * flush against the edge of a tinted panel.
 */
export const DOWNLOAD_CSS = `
    .dl-img{display:block!important;width:auto!important;padding:22px 20px 0!important}
    .dl-copy{display:block!important;width:auto!important;padding:18px 20px 22px!important}`;

/**
 * Mobile rules for the shapes only an issue uses: the reel card and the
 * showcase grid. Same reason as DOWNLOAD_CSS for having their own classes: the
 * generic `.col` rule zeroes padding, which is wrong inside a coloured card.
 */
export const ISSUE_CSS = `
    .reel-copy{display:block!important;width:auto!important;padding:26px 22px 6px!important}
    .reel-media{display:block!important;width:auto!important;padding:16px 22px 26px!important}
    .reel-img{width:100%!important;max-width:220px!important;height:auto!important}
    video.reel-img{height:391px!important}
    .sc-cell{display:block!important;width:100%!important;padding:0 0 22px 0!important}
    .sc-gap{display:none!important}
    .sc-img{width:100%!important;height:auto!important}`;

/**
 * Video that plays inside the email, where the client can, and a still that
 * links out everywhere else.
 *
 * Support, from caniemail.com/features/html-video (checked 2026-09-25): Apple
 * Mail on macOS and iOS plays <video> (iOS needs the controls attribute and
 * may ignore autoplay). Gmail replaces <video> and <source> with <u> tags,
 * Outlook.com and Yahoo strip them, and Outlook for Windows does nothing
 * useful. So the default has to be the fallback, and the video is switched on
 * only where it will play.
 *
 * The switch is the pattern Litmus used for its own video email
 * (litmus.com/blog/how-to-code-html5-video-background-in-email): the video
 * wrapper is display:none inline, and a WebKit-only media query turns it on
 * through an ATTRIBUTE selector, div[class="x"]. Gmail and Outlook.com rewrite
 * class names and do not keep attribute selectors, so the rule never fires
 * there and the fallback stays. Apple Mail keeps both and plays the video.
 * A plain browser opening the HTML file (Chrome included) also matches, which
 * is why a raw preview shows the video: that is not what Gmail does.
 *
 * This block goes in the <style> OUTSIDE the mobile media query.
 */
export const VIDEO_CSS = `
  @media screen and (-webkit-min-device-pixel-ratio:0){
    div[class="vid-wrap"]{display:block!important;max-height:none!important;overflow:visible!important}
    div[class="vid-fall"]{display:none!important;max-height:0!important;overflow:hidden!important}
  }`;

export function renderSection(s: Section, ctx?: TrackCtx): string {
  switch (s.kind) {
    // Something the reader asked for, delivered. Tinted so it reads as its own
    // thing at the top of an email, phone on the left like the 'device' shape,
    // and the only orange button in the section. A download is not tracked:
    // UTM parameters on a zip URL measure nothing.
    case 'download': {
      const img = `<img src="${IMG}/${s.image}" width="130" alt="${escapeHtml(s.alt)}" style="display:block;width:130px;max-width:100%;height:auto;border:0;">`;
      return `
<tr><td class="p" style="padding:0 34px 26px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${T.tint};border-radius:14px;">
    <tr>
      <td class="dl-img" width="130" valign="middle" style="padding:22px 0 22px 24px;">${img}</td>
      <td class="dl-copy" valign="middle" style="padding:22px 24px;">
        ${s.badge ? kicker(s.kicker).replace('</div>', `${badgePill(s.badge)}</div>`) : kicker(s.kicker)}${h2(s.title)}${para(s.body, true)}${primaryButton(s.link.href, s.link.cta)}
        <div style="margin-top:10px;font-family:${FONT};font-size:12px;color:${T.mute};">${escapeHtml(s.meta)}</div>
      </td>
    </tr>
  </table>
</td></tr>`;
    }

    case 'browser': {
      const tag = slugify(s.title);
      const bar =
        s.link?.url ??
        s.link?.href.replace(/^https?:\/\//, '') ??
        'dirckmulder.com';
      const img = `<img src="${IMG}/${s.image}" width="100%" alt="${escapeHtml(s.alt)}" style="display:block;width:100%;border:0;">`;
      return `
<tr><td class="p" style="padding:0 34px 14px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#fbfaf8;border:1px solid ${T.rule};border-radius:14px;overflow:hidden;">
    <tr><td style="padding:11px 14px;border-bottom:1px solid ${T.rule};font-family:${FONT};font-size:11px;color:${T.mute};overflow:hidden;max-width:1px;white-space:nowrap;text-overflow:ellipsis;">
      <span style="color:#e4e2dd;letter-spacing:2px;">&#9679;&#9679;&#9679;</span>
      <span style="margin-left:10px;white-space:nowrap;">${escapeHtml(bar)}</span>
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
    <tr><td class="p" style="padding:22px 34px 30px;line-height:0;font-size:0;">${maybeLink(img, s.link, ctx, tag)}</td></tr>
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

    // A video that lives on Instagram. Email cannot play video, so the cover
    // frame carries a baked-in play mark (the welcome email's reel cards do the
    // same), and the whole card links out. The one dark block in an issue: a
    // reel is the loudest thing in it and the contrast says so.
    case 'reel': {
      const tag = slugify(s.title);
      const img = `<img class="reel-img" src="${IMG}/${s.image}" width="200" alt="${escapeHtml(s.alt)}" style="display:block;width:200px;height:auto;border-radius:12px;border:0;">`;
      const button = s.link
        ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#ffffff;border-radius:99px;">
            <a href="${escapeHtml(trackedHref(s.link.href, ctx, tag))}" style="display:inline-block;padding:11px 20px 11px 16px;font-family:${FONT};font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${T.ink};text-decoration:none;">
              <img src="${IMG}/icon-instagram.png" width="16" height="16" alt="" style="display:inline-block;width:16px;height:16px;border:0;vertical-align:-3px;margin-right:8px;">${escapeHtml(s.link.cta)}</a>
          </td></tr></table>`
        : '';
      // "at Mollie", said by their own mark, small, above the title. It is
      // where the thing happened, not a sponsor line, so it gets no box.
      const mark = s.mark
        ? `<img src="${IMG}/${s.mark.image}" width="${s.mark.width}" height="${s.mark.height}" alt="${escapeHtml(s.mark.alt)}" style="display:block;width:${s.mark.width}px;height:${s.mark.height}px;border:0;margin:2px 0 12px;">`
        : '';
      // The whole frame, never cropped: width fixed, height follows the
      // file, and the video keeps its own 9:16 box.
      const still = maybeLink(img, s.link, ctx, tag);
      const media = s.video
        ? `<div class="vid-wrap" style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
            <video class="reel-img" width="200" height="356" autoplay muted loop playsinline controls poster="${IMG}/${s.video.poster}" style="display:block;width:200px;height:356px;border-radius:12px;background:#000;object-fit:contain;">
              <source src="${IMG}/${s.video.src}" type="video/mp4">
            </video>
          </div>
          <div class="vid-fall">${still}</div>`
        : still;
      return `
<tr><td class="p" style="padding:0 34px 34px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${T.ink};border-radius:18px;">
    <tr>
      <td class="reel-copy" valign="middle" style="padding:30px 12px 30px 28px;font-family:${FONT};">
        ${numbered(s.kicker, s.n, true)}
        ${mark}
        <h2 style="margin:0 0 10px;font-family:${FONT};font-size:23px;line-height:1.24;letter-spacing:-.025em;color:#ffffff;font-weight:700;">${escapeHtml(s.title)}</h2>
        <p style="margin:0 0 ${s.link ? 20 : 0}px;font-family:${FONT};font-size:15px;line-height:1.65;color:#c9c9ce;">${escapeHtml(s.body)}</p>
        ${button}
      </td>
      <td class="reel-media" width="200" valign="middle" style="padding:26px 26px 26px 0;">${media}</td>
    </tr>
  </table>
</td></tr>`;
    }

    // "Made this month": the design work, as a gallery. Two columns on a
    // desktop client, one on a phone. Placed by issue.ts, always at the end of
    // the items, never by the drafter.
    case 'showcase': {
      const cell = (it: ShowcaseItem | undefined) => {
        if (!it)
          return `<td class="sc-cell" width="256" style="font-size:0;line-height:0;">&nbsp;</td>`;
        const img = `<img class="sc-img" src="${IMG}/${it.image}" width="256" alt="${escapeHtml(it.alt)}" style="display:block;width:256px;height:auto;border-radius:14px;border:1px solid ${T.rule};background:${T.tint};">`;
        const href = it.link
          ? trackedHref(it.link.href, ctx, `showcase-${slugify(it.caption)}`)
          : null;
        return `<td class="sc-cell" width="256" valign="top" style="padding:0 0 24px 0;">
          ${href ? `<a href="${escapeHtml(href)}">${img}</a>` : img}
          <div style="margin-top:11px;font-family:${FONT};font-size:13px;line-height:1.5;color:${T.body};">${escapeHtml(it.caption)}</div>
        </td>`;
      };
      const rows: string[] = [];
      for (let i = 0; i < s.items.length; i += 2) {
        rows.push(
          `<tr>${cell(s.items[i])}<td class="sc-gap" width="20" style="font-size:0;line-height:0;">&nbsp;</td>${cell(s.items[i + 1])}</tr>`
        );
      }
      return `
<tr><td class="p" style="padding:4px 34px 10px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:3px solid ${T.ink};">
    <tr><td style="padding:20px 0 22px;font-family:${FONT};">
      <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:800;color:${T.orangeDeep};margin-bottom:8px;">Made this month${s.code ? badgePill('Free') : ''}</div>
      <h2 style="margin:0;font-family:${FONT};font-size:28px;line-height:1.15;letter-spacing:-.03em;color:${T.ink};font-weight:800;">${escapeHtml(s.title)}</h2>
    </td></tr>
    <tr><td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join('')}</table>
    </td></tr>
    ${
      s.code
        ? `<tr><td style="padding:4px 0 6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${T.tint};border-radius:14px;"><tr>
        <td style="padding:20px 22px;font-family:${FONT};">
          ${s.note ? `<div style="font-size:15px;line-height:1.55;color:${T.ink};font-weight:600;margin-bottom:14px;">${escapeHtml(s.note)}</div>` : ''}
          ${primaryButton(trackedHref(s.code.href, ctx, 'showcase-get-the-code'), s.code.cta)}
        </td>
      </tr></table>
    </td></tr>`
        : ''
    }
    ${
      s.credit
        ? `<tr><td style="padding:14px 0 8px;font-family:${FONT};font-size:12px;line-height:1.6;color:${T.mute};">${escapeHtml(s.credit)}</td></tr>`
        : ''
    }
  </table>
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
      ${numbered(s.kicker, s.n)}
      <div style="font-size:16px;line-height:1.3;color:${T.ink};font-weight:700;margin-bottom:6px;">${escapeHtml(s.title)}</div>
      <div style="font-size:14px;line-height:1.55;color:${T.body};">${escapeHtml(s.body)}</div>
    </td>
  </tr></table>
</td></tr>`;
    }
  }
}

export interface Item extends Omit<Base, 'n'> {
  /**
   * web renders in browser chrome, app renders in a phone, reel renders as the
   * dark video card, note is a quiet row.
   */
  type: 'web' | 'app' | 'reel' | 'note';
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
  const shaped = items.map(({ type, ...base }, i): Section => {
    const rest = { ...base, n: i + 1 };
    if (type === 'reel') return { kind: 'reel', ...rest };
    if (type === 'web') {
      return web++ % 2 === 0
        ? { kind: 'browser', ...rest }
        : { kind: 'tinted', ...rest };
    }
    if (type === 'app') {
      return {
        kind: 'device',
        side: app++ % 2 === 0 ? 'left' : 'right',
        ...rest,
      };
    }
    return { kind: 'inline', ...rest };
  });

  if (!quote || shaped.length < 4) return shaped;

  // After the run of web items, which is the natural seam between "things I
  // wrote" and "things I built".
  const seam = items.findIndex(i => i.type !== 'web');
  const at = seam <= 0 ? Math.ceil(shaped.length / 2) : seam;
  return [
    ...shaped.slice(0, at),
    { kind: 'quote', ...quote },
    ...shaped.slice(at),
  ];
}
