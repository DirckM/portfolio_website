/**
 * The shared shell for every email dirckmulder.com sends.
 *
 * This is the first branded HTML email in the hub, so it sets the house style.
 * Design decisions and why, since email undoes most of what you know from the web:
 *
 * - Table layout and fully inline styles. Outlook renders through Word, which
 *   ignores flexbox, grid, and most of a <style> block.
 * - 600px, single column. The safe width across every client since 2010.
 * - The masthead is the wordmark as TEXT, not an image. There is no logo
 *   (brand.json has svg_path: null), and text still renders when images are
 *   blocked, which is most first opens.
 * - Yellow #fcdc3c is the accent, not the site's orange. An email is editorial,
 *   so it follows the personal-brand system in brand.json: black ink, white
 *   paper, one yellow accent used sparingly. brand.json says explicitly never to
 *   put the yellow behind body text, so it appears only as a rule and a
 *   highlight.
 * - The one button is flat orange #ff7e35, the site's accent. Outlook cannot
 *   render a CSS gradient, and a button that falls back to nothing is worse
 *   than a flat colour that matches the site's end stop.
 * - Europa Nuova is the brand display face but has no webfont, so it is simply
 *   absent here. The fallback chain IS the font in email. Do not @import a face
 *   that does not exist.
 *
 * Voice rules from brand.json bind the boilerplate too: no semicolons, no em
 * dashes, first person, short lines.
 */

import { escapeHtml } from '@/lib/escape-html';

export const BRAND = {
  ink: '#000000',
  paper: '#ffffff',
  body: '#333333',
  secondary: '#6b6b6b',
  rule: '#e5e5e5',
  accent: '#fcdc3c', // editorial accent, sparingly
  action: '#ff7e35', // the site's orange, buttons only
} as const;

const FONT =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export interface ShellOptions {
  /** Preview text shown in the inbox list next to the subject. */
  preheader: string;
  /** Inner HTML of the message body. */
  body: string;
  /** Rendered under the rule at the bottom. Unsubscribe lives here. */
  footer?: string;
}

export function renderShell({ preheader, body, footer }: ShellOptions): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>dirckmulder.com</title>
<style>
  @media (max-width: 620px) {
    .wrap { width: 100% !important; padding: 24px 20px !important; }
    .h1 { font-size: 24px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;">
  <!-- Preheader: shown in the inbox list, hidden in the message itself. The
       run of nbsp stops Gmail pulling body copy in after it. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(preheader)}
    ${'&#8203;&nbsp;'.repeat(60)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f0;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0"
               style="width:600px;max-width:600px;background:${BRAND.paper};padding:40px;">

          <tr>
            <td style="padding-bottom:8px;">
              <span style="font-family:${FONT};font-size:15px;font-weight:700;letter-spacing:-0.02em;color:${BRAND.ink};">dirckmulder.com</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;">
              <div style="height:4px;width:44px;background:${BRAND.accent};font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <tr>
            <td style="font-family:${FONT};font-size:16px;line-height:1.6;color:${BRAND.body};">
              ${body}
            </td>
          </tr>

          <tr>
            <td style="padding-top:40px;">
              <div style="height:1px;background:${BRAND.rule};font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style="padding-top:16px;font-family:${FONT};font-size:12px;line-height:1.6;color:${BRAND.secondary};">
              ${footer ?? ''}
              <div style="margin-top:12px;">Pure Studio, Dirck Mulder. KVK 98665103. The Netherlands.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** A primary action button that survives Outlook. */
export function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
  <tr><td style="background:${BRAND.action};">
    <a href="${escapeHtml(href)}"
       style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:13px;font-weight:600;
              letter-spacing:0.08em;text-transform:uppercase;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
  </td></tr>
</table>`;
}

export function h1(text: string): string {
  return `<h1 class="h1" style="margin:0 0 20px;font-family:${FONT};font-size:28px;line-height:1.25;
    font-weight:700;letter-spacing:-0.02em;color:${BRAND.ink};">${escapeHtml(text)}</h1>`;
}

export function p(html: string): string {
  return `<p style="margin:0 0 16px;">${html}</p>`;
}
