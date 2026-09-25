/**
 * Renders a newsletter issue.
 *
 * ONE renderer, called by both the preview route and the send route, so the
 * preview Dirck approves is byte-identical to what subscribers receive. That is
 * a correctness property, not a convenience: an approval flow where the thing
 * approved differs from the thing sent is not an approval flow.
 *
 * The generator only ever produces DATA (intro, items, photos). It never builds
 * HTML. That keeps the design in one file and stops a drafting model inventing
 * markup.
 */

import { escapeHtml } from '@/lib/escape-html';
import { T, FONT, SERIF, SITE, IMG } from './theme';
import {
  renderSection,
  DOWNLOAD_CSS,
  ISSUE_CSS,
  VIDEO_CSS,
  type Section,
  type TrackCtx,
  trackedHref,
  slugify,
} from './blocks';

export interface Issue {
  number: number;
  /** Issue slug, used as the utm_campaign on every outbound link. */
  slug: string;
  /** e.g. "September" */
  period: string;
  headline: string;
  /** One word inside the headline set in the serif italic. Optional. */
  headlineEmphasis?: string;
  standfirst: string;
  /**
   * The issue's own hero graphic, made for that month by scripts/make-cover.mjs.
   * A 1200x400 banner, shown at 600x200. Required: an issue without one is a template.
   */
  cover: { image: string; alt: string };
  sections: Section[];
  /**
   * "Made this month". Always rendered after the items and before the
   * sign-off, by this file, so the drafter cannot move or drop it.
   */
  showcase: Omit<Extract<Section, { kind: 'showcase' }>, 'kind'>;
  /** Filename in /public/email for the sign-off portrait. */
  signoffImage?: string;
  signoff: string;
  /** Per-subscriber, so the unsubscribe link in a delivered issue keeps working. */
  unsubscribeToken: string;
}

function headlineHtml(issue: Issue): string {
  const h = escapeHtml(issue.headline);
  if (!issue.headlineEmphasis) return h;
  const em = escapeHtml(issue.headlineEmphasis);
  return h.replace(
    em,
    `<span style="font-family:${SERIF};font-style:italic;font-weight:400;letter-spacing:-.01em;">${em}</span>`
  );
}

export function renderIssue(issue: Issue): string {
  // One campaign per issue, so PostHog can attribute a landing to the issue that
  // sent it. The unsubscribe link below is deliberately NOT tagged: it is not a
  // marketing click, and the database already records unsubscribes exactly.
  const ctx: TrackCtx = { campaign: issue.slug };
  const unsub = `${SITE}/api/newsletter/unsubscribe?t=${encodeURIComponent(issue.unsubscribeToken)}`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>dirckmulder.com</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>${VIDEO_CSS}
  @media (max-width:620px){
    .w{width:100%!important}
    .p{padding-left:20px!important;padding-right:20px!important}
    .big{font-size:28px!important;margin-bottom:10px!important}
    /* The first screen on a phone has to show the headline and the start of
       item 01, so everything above them is tightened here. */
    .hd{padding-top:18px!important}
    .cv{padding-top:14px!important}
    .hl{padding-top:20px!important;padding-bottom:26px!important}
    .sf{font-size:15px!important;line-height:1.55!important}
    /* Two-column rows collapse to stacked on a phone. Without this the phone
       mockup and its copy squeeze into 150px each and both become unreadable. */
    .col{display:block!important;width:100%!important;padding:0 0 18px 0!important}
    .hero{width:100%!important;height:auto!important}${DOWNLOAD_CSS}${ISSUE_CSS}
  }
</style></head><body style="margin:0;padding:0;background:${T.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(issue.standfirst)}${'&#8203;&nbsp;'.repeat(60)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${T.page};">
<tr><td align="center" style="padding:26px 10px 30px;">

<table role="presentation" class="w" width="600" cellpadding="0" cellspacing="0" border="0"
       style="width:600px;max-width:600px;background:${T.card};border-radius:22px;overflow:hidden;">

  <tr><td class="p hd" style="padding:28px 34px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="52" valign="middle" style="padding-right:11px;">
        <img src="${IMG}/avatar-orange.jpg" width="40" height="40" alt="Dirck Mulder"
             style="display:block;width:40px;height:40px;border-radius:99px;border:0;">
      </td>
      <td valign="middle" style="font-family:${FONT};">
        <div style="font-size:13px;font-weight:700;color:${T.ink};letter-spacing:-.01em;">Dirck Mulder</div>
        <div style="font-size:11px;color:${T.mute};margin-top:2px;">Issue ${String(issue.number).padStart(3, '0')} &middot; ${escapeHtml(issue.period)}</div>
      </td>
      <td align="right" valign="middle" style="font-family:${FONT};font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${T.orangeDeep};font-weight:700;">Shipped</td>
    </tr></table>
  </td></tr>

  <tr><td class="cv" style="padding:22px 0 0;line-height:0;font-size:0;">
    <img class="hero" src="${IMG}/${issue.cover.image}" width="600" alt="${escapeHtml(issue.cover.alt)}"
         style="display:block;width:600px;max-width:100%;height:auto;border:0;">
  </td></tr>

  <tr><td class="p hl" style="padding:30px 34px 34px;">
    <h1 class="big" style="margin:0 0 14px;font-family:${FONT};font-size:42px;line-height:1.04;letter-spacing:-.042em;color:${T.ink};font-weight:800;">${headlineHtml(issue)}</h1>
    <p class="sf" style="margin:0;font-family:${FONT};font-size:17px;line-height:1.62;color:${T.body};">${escapeHtml(issue.standfirst)}</p>
  </td></tr>

  ${issue.sections.map(s => renderSection(s, ctx)).join('')}

  ${renderSection({ kind: 'showcase', ...issue.showcase }, ctx)}

  <tr><td class="p" style="padding:0 34px 36px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${T.rule};">
      <tr>
        <td width="70" valign="top" style="padding:26px 16px 0 0;">
          <img src="${IMG}/${issue.signoffImage ?? 'signoff-dirck.jpg'}" width="54" height="54" alt="Dirck Mulder"
               style="display:block;width:54px;height:54px;border-radius:99px;border:0;">
        </td>
        <td valign="top" style="padding-top:26px;font-family:${FONT};">
          <div style="font-size:15px;line-height:1.65;color:${T.body};">${escapeHtml(issue.signoff)}</div>
          <div style="margin-top:10px;font-size:14px;color:${T.ink};font-weight:600;">Dirck</div>
        </td>
      </tr>
    </table>
  </td></tr>

</table>

<table role="presentation" class="w" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
  <tr><td class="p" style="padding:18px 34px 6px;font-family:${FONT};font-size:11px;line-height:1.75;color:${T.mute};">
    You are getting this because you signed up at dirckmulder.com.
    <a href="${escapeHtml(unsub)}" style="color:${T.mute};">Unsubscribe in one click</a>.
    <div style="margin-top:6px;">Pure Studio, Dirck Mulder. KVK 98665103. The Netherlands.</div>
  </td></tr>
</table>

</td></tr></table></body></html>`;
}

/**
 * The plain-text alternative, built from the same data.
 *
 * Not optional: a Resend send with no text part is a gift to spam filters, and
 * some people genuinely read in plain text.
 */
export function renderIssueText(issue: Issue): string {
  const lines: string[] = [
    issue.headline.toUpperCase(),
    '',
    issue.standfirst,
    '',
  ];
  const ctx: TrackCtx = { campaign: issue.slug };
  for (const s of issue.sections) {
    if (s.kind === 'quote') {
      lines.push(`"${s.text}"`, '');
      continue;
    }
    if (s.kind === 'showcase') continue; // rendered once, below
    lines.push(s.kicker.toUpperCase(), s.title, s.body);
    if (s.kind === 'download') lines.push(s.meta);
    // Only print a URL when there is a real destination. The HTML version drops
    // the button in that case, and the text version has to agree with it. The
    // same UTM rule applies, so a click from the text part is attributed too.
    if (s.link) {
      lines.push(
        s.kind === 'download'
          ? s.link.href
          : trackedHref(s.link.href, ctx, slugify(s.title))
      );
    }
    lines.push('');
  }
  lines.push('MADE THIS MONTH', issue.showcase.title, '');
  for (const it of issue.showcase.items) {
    lines.push(`- ${it.caption}`);
    if (it.link)
      lines.push(
        `  ${trackedHref(it.link.href, ctx, `showcase-${slugify(it.caption)}`)}`
      );
  }
  lines.push('');
  if (issue.showcase.code) {
    if (issue.showcase.note) lines.push(issue.showcase.note);
    lines.push(
      `${issue.showcase.code.cta}: ${trackedHref(issue.showcase.code.href, ctx, 'showcase-get-the-code')}`,
      ''
    );
  }
  if (issue.showcase.credit) lines.push(issue.showcase.credit, '');
  lines.push(
    issue.signoff,
    'Dirck',
    '',
    '--',
    'You are getting this because you signed up at dirckmulder.com.',
    `Unsubscribe: ${SITE}/api/newsletter/unsubscribe?t=${issue.unsubscribeToken}`,
    'Pure Studio, Dirck Mulder. KVK 98665103. The Netherlands.'
  );
  return lines.join('\n');
}
