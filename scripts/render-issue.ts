/**
 * Render an issue to a local HTML file you can open in a browser, with every
 * image pointed at this checkout's public/ folder, so assets added in a branch
 * show up before they are deployed.
 *
 *   pnpm render-issue 2026-09 /tmp/issue.html          HTML part
 *   pnpm render-issue 2026-09 /tmp/issue.txt --text    plain-text part
 *
 * Same renderer as the send script and the preview route. Only the asset host
 * differs, and only in this file's output.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { issueBySlug } from '@/content/newsletter';
import { toIssue, validateIssueFile } from '@/lib/email/issue-file';
import { renderIssue, renderIssueText } from '@/lib/email/issue';

const [slug, out, flag] = process.argv.slice(2);
const file = issueBySlug(slug);
if (!file || !out) {
  console.error('usage: pnpm render-issue <slug> <out-file> [--text]');
  process.exit(2);
}
const problems = validateIssueFile(file);
if (problems.length) {
  console.error(
    `issue ${slug} does not pass its rules:\n  ${problems.join('\n  ')}`
  );
  process.exit(1);
}
const issue = toIssue(file, 'preview_token_not_real');
const publicDir = pathToFileURL(resolve('public')).href;
const body =
  flag === '--text'
    ? renderIssueText(issue)
    : renderIssue(issue).replace(
        /https:\/\/dirckmulder\.com\/(email|kits)\//g,
        `${publicDir}/$1/`
      );
writeFileSync(out, body);
console.log(out);
