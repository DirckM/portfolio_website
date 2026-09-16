/**
 * The welcome email, sent once, the moment someone confirms.
 *
 * This is the first thing a subscriber reads after clicking the confirmation
 * link, and until now that click led to a redirect and then silence for up to a
 * month. Silence after an opt-in is how a list goes cold before it is used.
 *
 * It is deliberately NOT an issue. No sections, no items, no issue number. One
 * photo, a short note in the first person, and one link back into the work.
 * Same chrome as issue.ts so the two read as coming from the same place, and
 * the same voice rules from brand.json: no semicolons, no em dashes, short
 * lines.
 */

import { escapeHtml } from '@/lib/escape-html';
import { T, FONT, SERIF, SITE, IMG } from './theme';

export interface Welcome {
  /** Per-subscriber, so the unsubscribe link keeps working in the inbox. */
  unsubscribeToken: string;
  /** How many tutorials exist, so the promise is a real number, not "lots". */
  postCount: number;
}

export const WELCOME_SUBJECT = 'You are on the list';

export function renderWelcome({ unsubscribeToken, postCount }: Welcome): string {
  const unsub = `${SITE}/api/newsletter/unsubscribe?t=${encodeURIComponent(unsubscribeToken)}`;
  const components = `${SITE}/components?utm_source=newsletter&utm_medium=email&utm_campaign=welcome`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>dirckmulder.com</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
  @media (max-width:620px){
    .w{width:100%!important}
    .p{padding-left:20px!important;padding-right:20px!important}
    .big{font-size:30px!important}
    .hero{width:100%!important;height:auto!important}
  }
</style></head><body style="margin:0;padding:0;background:${T.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">One email a month, and this is the only one you will get until the next one.${'&#8203;&nbsp;'.repeat(60)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${T.page};">
<tr><td align="center" style="padding:26px 10px 30px;">

<table role="presentation" class="w" width="600" cellpadding="0" cellspacing="0" border="0"
       style="width:600px;max-width:600px;background:${T.card};border-radius:22px;overflow:hidden;">

  <tr><td class="p" style="padding:28px 34px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="52" valign="middle" style="padding-right:11px;">
        <img src="${IMG}/avatar-orange.jpg" width="40" height="40" alt="Dirck Mulder"
             style="display:block;width:40px;height:40px;border-radius:99px;border:0;">
      </td>
      <td valign="middle" style="font-family:${FONT};">
        <div style="font-size:13px;font-weight:700;color:${T.ink};letter-spacing:-.01em;">Dirck Mulder</div>
        <div style="font-size:11px;color:${T.mute};margin-top:2px;">Designer and developer</div>
      </td>
      <td align="right" valign="middle" style="font-family:${FONT};font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${T.orangeDeep};font-weight:700;">Welcome</td>
    </tr></table>
  </td></tr>

  <tr><td class="p" style="padding:24px 34px 22px;">
    <h1 class="big" style="margin:0 0 12px;font-family:${FONT};font-size:37px;line-height:1.08;letter-spacing:-.038em;color:${T.ink};font-weight:800;">You are <span style="font-family:${SERIF};font-style:italic;font-weight:400;letter-spacing:-.01em;">in</span></h1>
    <p style="margin:0;font-family:${FONT};font-size:16px;line-height:1.65;color:${T.body};">
      Thanks for confirming. That is the admin over with, so here is what you
      actually signed up for.
    </p>
  </td></tr>

  <tr><td align="center" style="padding:0 34px 26px;">
    <img class="hero" src="${IMG}/welcome-hero.jpg" width="440" alt="Dirck Mulder"
         style="display:block;width:440px;max-width:100%;height:auto;border:0;border-radius:14px;">
  </td></tr>

  <tr><td class="p" style="padding:0 34px 8px;font-family:${FONT};font-size:16px;line-height:1.7;color:${T.body};">
    <p style="margin:0 0 16px;">
      That is me. I build web and mobile things, mostly on my own, and I write
      up the parts that were harder than they looked.
    </p>
    <p style="margin:0 0 16px;">
      Once a month you get one email. What I shipped, what broke on the way, and
      whatever came out of it that you can use. No drip sequence, no course, no
      second email next Tuesday because you opened this one.
    </p>
    <p style="margin:0 0 16px;">
      There are ${postCount} tutorials on the site already, each one welded to a
      component you can pull apart in the browser. That is the best place to
      start while you wait for the first issue.
    </p>
  </td></tr>

  <tr><td class="p" style="padding:6px 34px 34px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:${T.orange};border-radius:10px;">
        <a href="${escapeHtml(components)}"
           style="display:inline-block;padding:14px 26px;font-family:${FONT};font-size:13px;font-weight:700;
                  letter-spacing:.08em;text-transform:uppercase;color:#ffffff;text-decoration:none;">Browse the components</a>
      </td></tr>
    </table>
  </td></tr>

  <tr><td class="p" style="padding:0 34px 36px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${T.rule};">
      <tr>
        <td width="70" valign="top" style="padding:26px 16px 0 0;">
          <img src="${IMG}/signoff-dirck.jpg" width="54" height="54" alt="Dirck Mulder"
               style="display:block;width:54px;height:54px;border-radius:99px;border:0;">
        </td>
        <td valign="top" style="padding-top:26px;font-family:${FONT};">
          <div style="font-size:15px;line-height:1.65;color:${T.body};">
            If you ever want something covered, just reply to this. It comes
            straight to me.
          </div>
          <div style="margin-top:10px;font-size:14px;color:${T.ink};font-weight:600;">Dirck</div>
        </td>
      </tr>
    </table>
  </td></tr>

</table>

<table role="presentation" class="w" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
  <tr><td class="p" style="padding:18px 34px 6px;font-family:${FONT};font-size:11px;line-height:1.75;color:${T.mute};">
    You are getting this because you confirmed your signup at dirckmulder.com.
    <a href="${escapeHtml(unsub)}" style="color:${T.mute};">Unsubscribe in one click</a>.
    <div style="margin-top:6px;">Pure Studio, Dirck Mulder. KVK 98665103. The Netherlands.</div>
  </td></tr>
</table>

</td></tr></table></body></html>`;
}

/**
 * The plain-text alternative. A send with no text part is a gift to spam
 * filters, and this is the first email the address ever receives from us, which
 * is exactly when reputation is decided.
 */
export function renderWelcomeText({ unsubscribeToken, postCount }: Welcome): string {
  const unsub = `${SITE}/api/newsletter/unsubscribe?t=${encodeURIComponent(unsubscribeToken)}`;
  return [
    'YOU ARE IN',
    '',
    'Thanks for confirming. That is the admin over with, so here is what you actually signed up for.',
    '',
    'I build web and mobile things, mostly on my own, and I write up the parts that were harder than they looked.',
    '',
    'Once a month you get one email. What I shipped, what broke on the way, and whatever came out of it that you can use. No drip sequence, no course, no second email next Tuesday because you opened this one.',
    '',
    `There are ${postCount} tutorials on the site already, each one welded to a component you can pull apart in the browser:`,
    `${SITE}/components`,
    '',
    'If you ever want something covered, just reply to this. It comes straight to me.',
    '',
    'Dirck',
    '',
    '---',
    'You are getting this because you confirmed your signup at dirckmulder.com.',
    `Unsubscribe in one click: ${unsub}`,
    'Pure Studio, Dirck Mulder. KVK 98665103. The Netherlands.',
  ].join('\n');
}
