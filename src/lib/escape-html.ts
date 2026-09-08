/**
 * Escape a value for interpolation into HTML.
 *
 * Lifted out of src/app/api/contact/route.ts so the newsletter routes and the
 * email templates share one implementation rather than three that drift.
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
