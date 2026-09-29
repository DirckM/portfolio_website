/**
 * The numbers `pnpm designs-stats <slug>` prints, from rows already fetched.
 * Pure, so scripts/designs.test.ts can check them without a database.
 */

export interface StatsInput {
  events: { kind: string; subscriber_id: string | null }[];
  links: {
    id: string;
    subscriber_id: string;
    method: string;
    created_at: string;
  }[];
  visits: { share_id: string; has_signed_up: boolean }[];
  referred: { id: string; status: string; referred_by_share: string }[];
  /** subscriber id to email, for the sharers only. Dirck's own list. */
  emails: Map<string, string>;
}

export interface Stats {
  tokenVisits: { total: number; people: number };
  downloads: { total: number; people: number };
  buttons: Record<string, number>;
  sharesByMethod: Record<string, number>;
  unusedLinks: {
    id: string;
    email: string;
    method: string;
    created_at: string;
  }[];
  visitedNoSignup: { id: string; email: string; visits: number }[];
  referrers: {
    email: string;
    links: number;
    visits: number;
    signups: number;
    confirmed: number;
  }[];
}

export function summarise(d: StatsInput): Stats {
  const of = (kind: string) => d.events.filter(e => e.kind === kind);
  const people = (rows: { subscriber_id: string | null }[]) =>
    new Set(rows.map(r => r.subscriber_id).filter(Boolean)).size;
  const email = (id: string) => d.emails.get(id) ?? id;

  const buttons: Record<string, number> = {};
  for (const e of d.events) buttons[e.kind] = (buttons[e.kind] ?? 0) + 1;

  const sharesByMethod: Record<string, number> = {};
  for (const l of d.links)
    sharesByMethod[l.method] = (sharesByMethod[l.method] ?? 0) + 1;

  const visitsBy = new Map<string, number>();
  for (const v of d.visits)
    visitsBy.set(v.share_id, (visitsBy.get(v.share_id) ?? 0) + 1);
  const signupsBy = new Map<string, typeof d.referred>();
  for (const s of d.referred) {
    signupsBy.set(s.referred_by_share, [
      ...(signupsBy.get(s.referred_by_share) ?? []),
      s,
    ]);
  }

  const unusedLinks = d.links
    .filter(l => !visitsBy.get(l.id))
    .map(l => ({
      id: l.id,
      email: email(l.subscriber_id),
      method: l.method,
      created_at: l.created_at,
    }));

  const visitedNoSignup = d.links
    .filter(l => (visitsBy.get(l.id) ?? 0) > 0 && !signupsBy.get(l.id)?.length)
    .map(l => ({
      id: l.id,
      email: email(l.subscriber_id),
      visits: visitsBy.get(l.id)!,
    }));

  const bySharer = new Map<
    string,
    { links: number; visits: number; signups: number; confirmed: number }
  >();
  for (const l of d.links) {
    const r = bySharer.get(l.subscriber_id) ?? {
      links: 0,
      visits: 0,
      signups: 0,
      confirmed: 0,
    };
    const signups = signupsBy.get(l.id) ?? [];
    r.links += 1;
    r.visits += visitsBy.get(l.id) ?? 0;
    r.signups += signups.length;
    r.confirmed += signups.filter(s => s.status === 'confirmed').length;
    bySharer.set(l.subscriber_id, r);
  }
  const referrers = [...bySharer.entries()]
    .map(([id, r]) => ({ email: email(id), ...r }))
    .sort(
      (a, b) =>
        b.signups - a.signups || b.visits - a.visits || b.links - a.links
    );

  return {
    tokenVisits: {
      total: of('page_view_token').length,
      people: people(of('page_view_token')),
    },
    downloads: { total: of('download').length, people: people(of('download')) },
    buttons,
    sharesByMethod,
    unusedLinks,
    visitedNoSignup,
    referrers,
  };
}
