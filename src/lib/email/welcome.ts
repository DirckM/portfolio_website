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
import type { Kit } from '@/lib/kits';
import { T, FONT, SERIF, SITE, IMG } from './theme';
import { DOWNLOAD_CSS } from './blocks';
import { renderKitSection, renderKitText } from './kit';

export interface Welcome {
  /** Per-subscriber, so the unsubscribe link keeps working in the inbox. */
  unsubscribeToken: string;
  /** How many tutorials exist, so the promise is a real number, not "lots". */
  postCount: number;
  /**
   * The kit they signed up for, if the form was a giveaway. It goes at the very
   * top: it is the reason they are here, and burying it under the welcome
   * makes the person scroll for the one thing they came for.
   */
  kit?: Kit | null;
}

export const WELCOME_SUBJECT = 'You are on the list';

export function welcomeSubject(kit?: Kit | null): string {
  return kit ? `Your ${kit.name}, and you are on the list` : WELCOME_SUBJECT;
}

export function renderWelcome({ unsubscribeToken, postCount, kit }: Welcome): string {
  const unsub = `${SITE}/api/newsletter/unsubscribe?t=${encodeURIComponent(unsubscribeToken)}`;
  const components = `${SITE}/components?utm_source=newsletter&utm_medium=email&utm_campaign=welcome`;
  const instagram = 'https://www.instagram.com/dirckmulder/';
  const tiktok = 'https://www.tiktok.com/@dirckmulder';
  const reels = [
    {
      href: 'https://www.instagram.com/reel/DdN_CY9o4_U/',
      img: 'reel-2.jpg',
      title: 'The transformer is a weird thing',
      blurb: 'The maths behind the thing we all casually call AI and the people who somehow figured it out.',
    },
    {
      href: 'https://www.instagram.com/reel/DbC_50xokPJ/',
      img: 'reel-1.jpg',
      title: 'If you use AI, you need this',
      blurb: 'A feedback loop, so you can stop solving the same problem twice and acting surprised both times.',
    },
  ];

  // Two fixed 236px cells rather than percentages. Outlook resolves a percentage
  // width against the wrong container often enough that a fixed pair is the only
  // one that lands the same way everywhere.
  const reelCell = (r: (typeof reels)[number]) => `<td class="col" width="236" valign="top">
            <a href="${escapeHtml(r.href)}" style="text-decoration:none;">
              <img class="reelimg" src="${IMG}/${r.img}" width="236" alt="Watch on Instagram"
                   style="display:block;width:236px;max-width:100%;height:auto;border:0;border-radius:12px;">
              <div style="margin-top:10px;font-family:${FONT};font-size:14px;line-height:1.35;font-weight:700;letter-spacing:-.015em;color:${T.ink};">${escapeHtml(r.title)}</div>
              <div style="margin-top:5px;font-family:${FONT};font-size:12px;line-height:1.5;color:${T.body};">${escapeHtml(r.blurb)}</div>
              <div style="margin-top:8px;font-family:${FONT};font-size:12px;font-weight:700;color:${T.orangeDeep};">Watch on Instagram</div>
            </a>
          </td>`;

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
    .col{display:block!important;width:100%!important;padding:0 0 16px 0!important}
    .reelimg{width:100%!important}${DOWNLOAD_CSS}
  }
</style></head><body style="margin:0;padding:0;background:${T.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${kit ? `Your ${escapeHtml(kit.name)} is inside. ` : ''}Thanks for signing up. You’ll hear from me once a month.${'&#8203;&nbsp;'.repeat(60)}</div>

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

  ${kit ? `<tr><td style="height:24px;line-height:24px;font-size:0;">&nbsp;</td></tr>${renderKitSection(kit)}` : ''}

  <tr><td class="p" style="padding:${kit ? 4 : 24}px 34px 22px;">
    <h1 class="big" style="margin:0 0 12px;font-family:${FONT};font-size:37px;line-height:1.08;letter-spacing:-.038em;color:${T.ink};font-weight:800;">You are <span style="font-family:${SERIF};font-style:italic;font-weight:400;letter-spacing:-.01em;">in</span>.</h1>
    <p style="margin:0;font-family:${FONT};font-size:16px;line-height:1.65;color:${T.body};">
      Thanks for signing up. You’ll hear from me once a month. That feels
      frequent enough to be useful and infrequent enough that we don’t start
      resenting each other.
    </p>
    <p style="margin:12px 0 0;font-family:${FONT};font-size:16px;line-height:1.65;color:${T.body};">
      Here’s what you signed up for.
    </p>
  </td></tr>

  <tr><td class="p" style="padding:0 34px 26px;">
    <img class="hero" src="${IMG}/welcome-hero.jpg" width="532" alt="Dirck Mulder"
         style="display:block;width:532px;max-width:100%;height:auto;border:0;border-radius:14px;">
  </td></tr>

  <tr><td class="p" style="padding:0 34px 8px;font-family:${FONT};font-size:16px;line-height:1.7;color:${T.body};">
    <p style="margin:0 0 16px;">
      That’s me. I design and build things for the web and mobile, mostly by
      myself. Then I write about the parts that took three days despite looking
      like they should take twenty minutes.
    </p>
    <p style="margin:0 0 16px;">
      Once a month, you’ll get one email: what I shipped, what broke along the
      way, and anything useful I learned while staring at the problem.
    </p>
    <p style="margin:0 0 16px;">
      No drip sequence. No surprise course. No “just circling back” email next
      Tuesday because you made the mistake of opening this one.
    </p>
    <p style="margin:0 0 16px;">
      There are already ${postCount} tutorials on the site. Each one comes with a
      working component you can poke, pull apart, and occasionally blame when
      your own version stops working.
    </p>
    <p style="margin:0 0 16px;">
      That’s probably the best place to start while you wait for the first
      issue.
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

  <tr><td class="p" style="padding:0 34px 30px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background:${T.tint};border-radius:14px;">
      <tr><td style="padding:22px 24px;font-family:${FONT};">
        <div style="font-size:15px;line-height:1.65;color:${T.body};margin-bottom:16px;">
          Most things I make appear on Instagram and TikTok first, usually while
          they’re still fresh and before I’ve found the energy to turn them into
          a proper write-up.
        </div>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding-right:10px;">
            <a href="${escapeHtml(instagram)}" style="text-decoration:none;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                     style="border:1px solid ${T.rule};border-radius:99px;background:#ffffff;">
                <tr>
                  <td style="padding:9px 4px 9px 16px;" valign="middle">
                    <img src="${IMG}/icon-instagram.png" width="18" height="18" alt=""
                         style="display:block;width:18px;height:18px;border:0;">
                  </td>
                  <td style="padding:9px 18px 9px 8px;font-family:${FONT};font-size:13px;font-weight:700;color:${T.ink};" valign="middle">Instagram</td>
                </tr>
              </table>
            </a>
          </td>
          <td>
            <a href="${escapeHtml(tiktok)}" style="text-decoration:none;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                     style="border:1px solid ${T.rule};border-radius:99px;background:#ffffff;">
                <tr>
                  <td style="padding:9px 4px 9px 16px;" valign="middle">
                    <img src="${IMG}/icon-tiktok.png" width="18" height="18" alt=""
                         style="display:block;width:18px;height:18px;border:0;">
                  </td>
                  <td style="padding:9px 18px 9px 8px;font-family:${FONT};font-size:13px;font-weight:700;color:${T.ink};" valign="middle">TikTok</td>
                </tr>
              </table>
            </a>
          </td>
        </tr></table>

        <!-- Email cannot play video, so each cell is the cover frame with the
             play mark baked into the JPEG, linking out to the reel. A CSS
             overlay is the web answer and Outlook ignores the positioning it
             needs. Caption sits UNDER each one, not beside it. -->
        <div style="margin-top:22px;font-family:${FONT};font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${T.mute};font-weight:700;">Latest reels</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;"><tr>
          ${reelCell(reels[0])}
          <td width="12" class="col" style="font-size:0;line-height:0;">&nbsp;</td>
          ${reelCell(reels[1])}
        </tr></table>
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
            If there’s something you’d like me to cover, reply to this email. It
            comes straight to me, not a support bot pretending its name is
            Sarah.
          </div>
          <div style="margin-top:10px;font-size:14px;color:${T.ink};font-weight:600;">Dirck</div>
        </td>
      </tr>
    </table>
  </td></tr>

</table>

<table role="presentation" class="w" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
  <tr><td class="p" style="padding:18px 34px 6px;font-family:${FONT};font-size:11px;line-height:1.75;color:${T.mute};">
    You’re getting this because you confirmed your signup at dirckmulder.com.
    Changed your mind already? Fair enough.
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
export function renderWelcomeText({ unsubscribeToken, postCount, kit }: Welcome): string {
  const unsub = `${SITE}/api/newsletter/unsubscribe?t=${encodeURIComponent(unsubscribeToken)}`;
  return [
    ...(kit ? renderKitText(kit) : []),
    'YOU ARE IN.',
    '',
    'Thanks for signing up. You’ll hear from me once a month. That feels frequent enough to be useful and infrequent enough that we don’t start resenting each other.',
    '',
    'Here’s what you signed up for.',
    '',
    'That’s me. I design and build things for the web and mobile, mostly by myself. Then I write about the parts that took three days despite looking like they should take twenty minutes.',
    '',
    'Once a month, you’ll get one email: what I shipped, what broke along the way, and anything useful I learned while staring at the problem.',
    '',
    'No drip sequence. No surprise course. No “just circling back” email next Tuesday because you made the mistake of opening this one.',
    '',
    `There are already ${postCount} tutorials on the site. Each one comes with a working component you can poke, pull apart, and occasionally blame when your own version stops working.`,
    '',
    'That’s probably the best place to start while you wait for the first issue:',
    `${SITE}/components`,
    '',
    'Most things I make appear on Instagram and TikTok first, usually while they’re still fresh and before I’ve found the energy to turn them into a proper write-up.',
    'Instagram: https://www.instagram.com/dirckmulder/',
    'TikTok: https://www.tiktok.com/@dirckmulder',
    '',
    'LATEST REELS',
    '',
    'The transformer is a weird thing. The maths behind the thing we all casually call AI and the people who somehow figured it out.',
    'https://www.instagram.com/reel/DdN_CY9o4_U/',
    '',
    'If you use AI, you need this. A feedback loop, so you can stop solving the same problem twice and acting surprised both times.',
    'https://www.instagram.com/reel/DbC_50xokPJ/',
    '',
    'If there’s something you’d like me to cover, reply to this email. It comes straight to me, not a support bot pretending its name is Sarah.',
    '',
    'Dirck',
    '',
    '---',
    'You’re getting this because you confirmed your signup at dirckmulder.com. Changed your mind already? Fair enough.',
    `Unsubscribe in one click: ${unsub}`,
    'Pure Studio, Dirck Mulder. KVK 98665103. The Netherlands.',
  ].join('\n');
}
