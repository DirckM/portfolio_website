/**
 * Demand for an issue's designs, from the database.
 *
 *   pnpm designs-stats 2026-09
 *
 * Downloads and shares come from portfolio.design_events (a click on the
 * /designs page, never its GET). Referred signups are subscribers who came in
 * through a shared link: source designs:<slug> with a referred_by code.
 * Read-only.
 */
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pgSelect } from '@/lib/db';
import { designsIssue } from '@/lib/designs';

for (const f of [
  '.env.local',
  join(homedir(), 'Documents/Project Hub/projects-hub/.env'),
]) {
  if (existsSync(f)) process.loadEnvFile(f);
}

async function main() {
  const slug = process.argv[2];
  if (!designsIssue(slug)) {
    console.error(
      'usage: pnpm designs-stats <slug>   (an issue with showcase.designs)'
    );
    process.exit(2);
  }
  const events = await pgSelect<{ kind: string; subscriber_id: string }>(
    'design_events',
    `issue_slug=eq.${slug}&select=kind,subscriber_id&limit=100000`
  );
  if (!events.ok) {
    console.error(`Could not read design_events: ${events.error}`);
    console.error(
      'Is supabase/migrations/20260925_0001_issue_sends.sql applied?'
    );
    process.exit(1);
  }
  const count = (kind: string) => events.data.filter(e => e.kind === kind);
  const people = (rows: { subscriber_id: string }[]) =>
    new Set(rows.map(r => r.subscriber_id)).size;
  const signups = await pgSelect<{
    status: string;
    referred_by: string | null;
  }>(
    'subscribers',
    `source=like.${encodeURIComponent(`designs:${slug}*`)}&select=status,referred_by&limit=100000`
  );
  const rows = signups.ok ? signups.data : [];
  const referred = rows.filter(r => r.referred_by);
  console.log(`Designs, issue ${slug}`);
  console.log(
    `  downloads        ${count('download').length} (${people(count('download'))} people)`
  );
  console.log(
    `  shares           ${count('share').length} (${people(count('share'))} people)`
  );
  console.log(
    `  signups via page ${rows.length} (${rows.filter(r => r.status === 'confirmed').length} confirmed)`
  );
  console.log(
    `  of which referred ${referred.length} (${referred.filter(r => r.status === 'confirmed').length} confirmed)`
  );
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
