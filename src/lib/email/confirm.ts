/**
 * The double opt-in confirmation email, and the "you are already subscribed"
 * reply to a repeat signup.
 *
 * ONE renderer, called by both the subscribe route and the preview route, so
 * the design that gets approved is byte-identical to the one that is sent. That
 * is the same correctness property issue.ts and welcome.ts hold, and the reason
 * this moved out of the route: the markup used to live inline in
 * subscribe/route.ts, where nothing could render it without sending it.
 *
 * Built on theme.ts, not shell.ts. theme.ts is the house style Dirck arrived at
 * by rejecting two other directions, and its own docstring says it is the style
 * for every email the site sends. The confirmation email was the last thing
 * still on the older yellow shell, which meant the first mail a subscriber ever
 * received looked like a different sender from the second.
 */

import { escapeHtml } from '@/lib/escape-html';
import { T, FONT, SERIF, SITE, IMG } from './theme';
import { CONSENT_TEXT } from '@/lib/newsletter';

export const CONFIRM_SUBJECT = 'Confirm your email';
export const ALREADY_SUBJECT = 'You are already subscribed';

interface Rendered {
  html: string;
  text: string;
}

function shell(preheader: string, body: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>dirckmulder.com</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
  @media (max-width:620px){
    .w{width:100%!important}
    .p{padding-left:20px!important;padding-right:20px!important}
    .big{font-size:28px!important}
  }
</style></head><body style="margin:0;padding:0;background:${T.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}${'&#8203;&nbsp;'.repeat(60)}</div>

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
      <td align="right" valign="middle" style="font-family:${FONT};font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${T.orangeDeep};font-weight:700;">One step left</td>
    </tr></table>
  </td></tr>

  ${body}

</table>

<table role="presentation" class="w" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
  <tr><td class="p" style="padding:18px 34px 6px;font-family:${FONT};font-size:11px;line-height:1.75;color:${T.mute};">
    Pure Studio, Dirck Mulder. KVK 98665103. The Netherlands.
  </td></tr>
</table>

</td></tr></table></body></html>`;
}

/** Step one of double opt-in: the link that proves the address is theirs. */
export function renderConfirmEmail({
  site,
  confirmToken,
}: {
  site: string;
  confirmToken: string;
}): Rendered {
  const link = `${site}/api/newsletter/confirm?t=${confirmToken}`;

  const body = `
  <tr><td class="p" style="padding:24px 34px 8px;">
    <h1 class="big" style="margin:0 0 12px;font-family:${FONT};font-size:34px;line-height:1.1;letter-spacing:-.035em;color:${T.ink};font-weight:800;">One <span style="font-family:${SERIF};font-style:italic;font-weight:400;letter-spacing:-.01em;">click</span> and you are on the list</h1>
    <p style="margin:0;font-family:${FONT};font-size:16px;line-height:1.65;color:${T.body};">
      You asked to hear what I am building. Confirm below and that is the whole
      admin done, for good.
    </p>
  </td></tr>

  <tr><td class="p" style="padding:24px 34px 6px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:${T.orange};border-radius:10px;">
        <a href="${escapeHtml(link)}"
           style="display:inline-block;padding:15px 30px;font-family:${FONT};font-size:13px;font-weight:700;
                  letter-spacing:.08em;text-transform:uppercase;color:#ffffff;text-decoration:none;">Confirm my email</a>
      </td></tr>
    </table>
  </td></tr>

  <tr><td class="p" style="padding:6px 34px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${T.mute};">
    Button not working? Paste this into your browser:<br>
    <a href="${escapeHtml(link)}" style="color:${T.orangeDeep};word-break:break-all;">${escapeHtml(link)}</a>
  </td></tr>

  <tr><td class="p" style="padding:22px 34px 34px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${T.tint};border-radius:12px;">
      <tr><td style="padding:16px 18px;font-family:${FONT};font-size:12px;line-height:1.6;color:${T.mute};">
        <strong style="color:${T.body};">What you agreed to.</strong>
        ${escapeHtml(CONSENT_TEXT)}
        <div style="margin-top:8px;">Did not ask for this? Ignore this email and nothing happens. The link expires in three days.</div>
      </td></tr>
    </table>
  </td></tr>`;

  const text = [
    'ONE CLICK AND YOU ARE ON THE LIST',
    '',
    'You asked to hear what I am building. Confirm below and that is the whole admin done, for good.',
    '',
    link,
    '',
    `What you agreed to: ${CONSENT_TEXT}`,
    '',
    'Did not ask for this? Ignore this email and nothing happens. The link expires in three days.',
    '',
    'Pure Studio, Dirck Mulder. KVK 98665103. The Netherlands.',
  ].join('\n');

  return {
    html: shell('One click and you are on the list.', body),
    text,
  };
}

/**
 * A repeat signup from an address that is already confirmed.
 *
 * Deliberately says nothing a stranger could learn from: the subscribe route
 * answers identically for a new address and an existing one, so this email is
 * the only place the difference shows, and it goes to the address itself.
 */
export function renderAlreadySubscribedEmail(): Rendered {
  const body = `
  <tr><td class="p" style="padding:24px 34px 34px;">
    <h1 class="big" style="margin:0 0 12px;font-family:${FONT};font-size:34px;line-height:1.1;letter-spacing:-.035em;color:${T.ink};font-weight:800;">You are already <span style="font-family:${SERIF};font-style:italic;font-weight:400;letter-spacing:-.01em;">in</span></h1>
    <p style="margin:0 0 14px;font-family:${FONT};font-size:16px;line-height:1.65;color:${T.body};">
      Nothing to do. The next issue lands in your inbox on its own.
    </p>
    <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.6;color:${T.mute};">
      Every issue carries a one-click unsubscribe at the bottom, so leaving is
      never more than that.
    </p>
  </td></tr>`;

  return {
    html: shell('You are already on the list. Nothing to do.', body),
    text: [
      'YOU ARE ALREADY IN',
      '',
      'Nothing to do. The next issue lands in your inbox on its own.',
      '',
      'Every issue carries a one-click unsubscribe at the bottom, so leaving is never more than that.',
      '',
      'Pure Studio, Dirck Mulder. KVK 98665103. The Netherlands.',
    ].join('\n'),
  };
}
