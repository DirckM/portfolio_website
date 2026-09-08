/**
 * Experiment registry.
 *
 * Config lives in data rather than in code branches so concluding an
 * experiment is one edit, not a refactor, and the losing component stays in
 * the repo as a candidate for the next round.
 *
 * READ THIS BEFORE TRUSTING A NUMBER FROM IT. At roughly 60 blog visitors a
 * month this will not reach statistical significance. Detecting a 10% versus
 * 15% submission rate at 80% power needs about 690 exposures per arm, which at
 * current traffic is somewhere between four months and a year. The experiment
 * earns its place on the free-text answers, which are useful at n=5. The
 * counts are a tiebreaker, not a verdict.
 */

export interface Experiment {
  status: 'running' | 'concluded';
  variants: readonly string[];
  /** Percentages, must total 100. */
  weights: readonly number[];
  /** Set on conclusion. Everyone then gets this arm. */
  winner: string | null;
}

export type ExperimentKey = 'post-feedback-v1';

// Annotated rather than `as const`, so `status` keeps its union type and
// concluding an experiment stays a one-word edit rather than a type error.
export const EXPERIMENTS: Record<ExperimentKey, Experiment> = {
  'post-feedback-v1': {
    status: 'running',
    // Two arms, not four. A four-way split at this traffic would never resolve,
    // and shipping four half-considered widgets is indecision with a dashboard.
    variants: ['quick-verdict', 'reaction-row'],
    weights: [50, 50],
    winner: null,
  },
};

/**
 * xmur3 seed plus fnv1a, which is plenty for bucketing and is deterministic
 * across reloads and devices for the same visitor id.
 */
function hashToPercent(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^= h >>> 16) >>> 0) % 100;
}

/**
 * Which arm this visitor sees.
 *
 * The randomisation unit is the PERSON, not the pageview: the visitor id is
 * mixed with the experiment key and nothing else, so the same reader sees the
 * same widget on every post. Bucketing per view would make the numbers
 * meaningless and the experience feel broken.
 */
export function assignVariant(key: ExperimentKey, visitorId: string): string {
  const exp = EXPERIMENTS[key];
  if (exp.status === 'concluded' && exp.winner) return exp.winner;

  const bucket = hashToPercent(`${visitorId}:${key}`);
  let acc = 0;
  for (let i = 0; i < exp.variants.length; i++) {
    acc += exp.weights[i];
    if (bucket < acc) return exp.variants[i];
  }
  return exp.variants[exp.variants.length - 1];
}

export function isVariant(key: ExperimentKey, variant: string): boolean {
  return EXPERIMENTS[key].variants.includes(variant);
}

/**
 * A visitor id that lives only in this browser.
 *
 * Not an account, not a fingerprint, and never sent anywhere raw: the server
 * only ever stores a salted hash of it. localStorage can throw in a private
 * window or when a browser blocks site data, so every access is guarded and
 * the widget degrades to a per-session id rather than breaking the page.
 */
export function getVisitorId(): string {
  const KEY = 'dm_vid';
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    return 'ephemeral-' + Math.random().toString(36).slice(2);
  }
}
