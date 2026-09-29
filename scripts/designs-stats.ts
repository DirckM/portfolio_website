/**
 * Demand for an issue's designs, from the database. Read-only.
 *
 *   pnpm designs-stats 2026-09
 *
 * Token visits are email clicks on "Get the code". Everything else comes from
 * the buttons on /designs/<slug>. Share links are one per share action, so a
 * link that was copied and never opened shows up by name. This prints sharers'
 * email addresses: it is Dirck's own list, in his own terminal.
 */
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pgSelect } from '@/lib/db';
import { designsIssue } from '@/lib/designs';
import { summarise } from '@/lib/designs-stats';

for (const f of [
  '.env.local',
  join(homedir(), 'Documents/Project Hub/projects-hub/.env'),
]) {
  if (existsSync(f)) process.loadEnvFile(f);
}

async function rows<T>(table: string, query: string): Promise<T[]> {
  const res = await pgSelect<T>(table, `${query}&limit=100000`);
  if (!res.ok) {
    throw new Error(
      `Could not read ${table}: ${res.error}\nIs supabase/migrations/20260925_0001_issue_sends.sql applied?`
    );
  }
  return res.data;
}

const inList = (ids: string[]) => `(${ids.map(i => `"${i}"`).join(',')})`;

async function main() {
  const slug = process.argv[2];
  if (!designsIssue(slug)) {
    console.error(
      'usage: pnpm designs-stats <slug>   (an issue with showcase.designs)'
    );
    process.exit(2);
  }
  const events = await rows<{ kind: string; subscriber_id: string | null }>(
    'button_events',
    `page=eq.designs&issue_slug=eq.${slug}&select=kind,subscriber_id`
  );
  const links = await rows<{
    id: string;
    subscriber_id: string;
    method: string;
    created_at: string;
  }>(
    'share_links',
    `issue_slug=eq.${slug}&select=id,subscriber_id,method,created_at&order=created_at.asc`
  );
  const ids = links.map(l => l.id);
  const visits = ids.length
    ? await rows<{ share_id: string; has_signed_up: boolean }>(
        'share_visits',
        `share_id=in.${inList(ids)}&select=share_id,has_signed_up`
      )
    : [];
  const referred = ids.length
    ? await rows<{ id: string; status: string; referred_by_share: string }>(
        'subscribers',
        `referred_by_share=in.${inList(ids)}&select=id,status,referred_by_share`
      )
    : [];
  const sharers = [...new Set(links.map(l => l.subscriber_id))];
  const emails = new Map(
    (sharers.length
      ? await rows<{ id: string; email: string }>(
          'subscribers',
          `id=in.${inList(sharers)}&select=id,email`
        )
      : []
    ).map(s => [s.id, s.email])
  );

  const s = summarise({ events, links, visits, referred, emails });
  console.log(`Designs, issue ${slug}`);
  console.log(
    `  email clicks (token visits)  ${s.tokenVisits.total} (${s.tokenVisits.people} people)`
  );
  console.log(
    `  downloads                    ${s.downloads.total} (${s.downloads.people} people)`
  );
  console.log(
    `  share links by method        ${JSON.stringify(s.sharesByMethod)}`
  );
  console.log(`  every button                 ${JSON.stringify(s.buttons)}`);
  console.log(`  share links never opened     ${s.unusedLinks.length}`);
  for (const l of s.unusedLinks)
    console.log(`    ${l.id}  ${l.email}  ${l.method}  ${l.created_at}`);
  console.log(`  opened, no signup            ${s.visitedNoSignup.length}`);
  for (const l of s.visitedNoSignup)
    console.log(`    ${l.id}  ${l.email}  ${l.visits} visitor(s)`);
  console.log('  referrers (links, visitors, signups, confirmed)');
  for (const r of s.referrers.slice(0, 10)) {
    console.log(
      `    ${r.email}  ${r.links}  ${r.visits}  ${r.signups}  ${r.confirmed}`
    );
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
