/**
 * PostgREST access to the `portfolio` schema, with plain fetch.
 *
 * No `@supabase/supabase-js` on purpose. The hub deliberately keeps its
 * dependency list tiny and talks to PostgREST directly (see
 * projects-hub/scripts/lib/portal-sync.ts), and this is a handful of HTTP calls.
 *
 * Every function returns a result object and never throws. A route handler that
 * has to wrap each call in try/catch eventually forgets one, and a signup form
 * that 500s because the database hiccuped is worse than one that says "try
 * again". Same discipline as bulk-convert/src/lib/email.ts.
 *
 * The schema is NOT `public`, so every request has to name it: `Accept-Profile`
 * on reads, `Content-Profile` on writes. Without those headers PostgREST looks
 * in `public`, finds nothing, and returns a 404 that reads like a missing table.
 */

const TIMEOUT_MS = 8000;
const SCHEMA = 'portfolio';

export interface DbConfig {
  url: string;
  serviceKey: string;
}

export type DbResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

/**
 * The hub .env grew naming variants over time. Accept them in order of
 * preference rather than forcing a rename that breaks other scripts.
 */
function firstFilled(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n]?.trim();
    if (v) return v;
  }
  return undefined;
}

export function dbConfig(): DbConfig | null {
  const url = firstFilled(
    'PORTFOLIO_SUPABASE_URL',
    'PROJECT_HUB_PUBLIC_SUPABASE_URL',
    'SUPABASE_PROJECT_URL_PROJECT_HUB'
  );
  const serviceKey = firstFilled(
    'PORTFOLIO_SUPABASE_SERVICE_KEY',
    'PROJECT_HUB_SERVICE_ROLE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  );
  if (!url || !serviceKey) return null;
  return { url: url.replace(/\/+$/, ''), serviceKey };
}

export function dbConfigured(): boolean {
  return dbConfig() !== null;
}

interface RequestOptions {
  method: string;
  /** Writes name the schema with Content-Profile, reads with Accept-Profile. */
  write?: boolean;
  /** Extra headers as a plain record, so the spread below stays typed. */
  headers?: Record<string, string>;
  body?: string;
}

async function request<T>(
  path: string,
  { method, write, headers, body }: RequestOptions
): Promise<DbResult<T>> {
  const cfg = dbConfig();
  if (!cfg) return { ok: false, error: 'Database not configured' };

  try {
    const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
      method,
      body,
      headers: {
        apikey: cfg.serviceKey,
        Authorization: `Bearer ${cfg.serviceKey}`,
        'Content-Type': 'application/json',
        [write ? 'Content-Profile' : 'Accept-Profile']: SCHEMA,
        ...headers,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });

    const text = await res.text();
    if (!res.ok) {
      // PGRST106 means the schema is not in Settings > API > Exposed schemas.
      // Say so, because the raw message reads like an auth failure and sends
      // people hunting for a bad key for an hour.
      const hint = text.includes('PGRST106')
        ? ' (the `portfolio` schema is not exposed in Supabase: Settings > API > Exposed schemas)'
        : '';
      return { ok: false, error: `${res.status} ${text}${hint}`, status: res.status };
    }

    return { ok: true, data: (text ? JSON.parse(text) : null) as T };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

/** GET rows. `query` is a PostgREST query string without the leading `?`. */
export function pgSelect<T>(table: string, query = ''): Promise<DbResult<T[]>> {
  return request<T[]>(`${table}${query ? `?${query}` : ''}`, { method: 'GET' });
}

/** INSERT rows, returning what was written. */
export function pgInsert<T>(
  table: string,
  rows: Record<string, unknown> | Record<string, unknown>[],
  { returning = true }: { returning?: boolean } = {}
): Promise<DbResult<T[]>> {
  return request<T[]>(table, {
    method: 'POST',
    write: true,
    headers: { Prefer: returning ? 'return=representation' : 'return=minimal' },
    body: JSON.stringify(rows),
  });
}

/**
 * PATCH rows matching `query`.
 *
 * Always pass a filter that includes the expected current state, e.g.
 * `id=eq.x&status=eq.pending`. That makes the update conditional, so two
 * concurrent requests cannot both believe they won.
 */
export function pgPatch<T>(
  table: string,
  query: string,
  patch: Record<string, unknown>
): Promise<DbResult<T[]>> {
  return request<T[]>(`${table}?${query}`, {
    method: 'PATCH',
    write: true,
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  });
}
