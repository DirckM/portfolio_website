/**
 * Every newsletter issue, by slug. Add the import when you add a file.
 *
 * A static list rather than a directory scan, so the preview route, the send
 * script and the type checker all see exactly the same set of issues.
 */

import type { IssueFile } from '@/lib/email/issue-file';
import issue202609 from './2026-09';

export const ISSUES: IssueFile[] = [issue202609];

export function issueBySlug(slug: string | null | undefined): IssueFile | null {
  if (!slug) return null;
  return ISSUES.find(i => i.slug === slug) ?? null;
}

/**
 * The newest issue that is out of draft: what a new subscriber gets the moment
 * they confirm. 'approved' counts, because that is the status an issue keeps
 * while it goes out to the list.
 */
export function latestReleasedIssue(
  issues: IssueFile[] = ISSUES
): IssueFile | null {
  return (
    issues
      .filter(i => i.status !== 'draft')
      .sort((a, b) => b.number - a.number)[0] ?? null
  );
}
