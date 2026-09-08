#!/usr/bin/env node
/**
 * Fact gate for blog posts.
 *
 * Every other gate in this repo, and nearly every content gate the industry
 * ships, verifies that a page *works*. None of them verify that a sentence is
 * *true*. That is not a hypothetical gap: this repo published a post claiming
 * "Firefox 132+" supports CSS scroll-driven animations while Firefox still
 * hides them behind a flag. The render gate passed it, because the page
 * rendered perfectly. It was wrong, not broken.
 *
 * Browser support is the one class of claim that is machine-checkable for free,
 * offline, with no model and no judgement. @mdn/browser-compat-data is the same
 * dataset MDN's own support tables are built from.
 *
 * The check: find every "Browser NNN" claim in the prose, find every web
 * feature the post actually discusses, and fail when the two contradict. A
 * version number asserted for an engine that BCD says has never shipped the
 * feature (`version_added: false`, `"preview"`, or flag-gated) is a lie, and
 * this exits non-zero rather than letting it reach a reader.
 *
 *   node scripts/check-facts.mjs                 # every post
 *   node scripts/check-facts.mjs <slug> [<slug>] # only these
 */

import fs from 'node:fs';
import path from 'node:path';
import bcd from '@mdn/browser-compat-data' with { type: 'json' };

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

/** BCD keys use these names; the prose uses the human ones. */
const ENGINES = {
  chrome: ['chrome', 'chromium'],
  firefox: ['firefox'],
  safari: ['safari'],
  edge: ['edge'],
  opera: ['opera'],
};

/** "Firefox 132+", "Chrome and Edge 115+", "Safari 18". */
const CLAIM_RE =
  /\b(Chrome|Chromium|Firefox|Safari|Edge|Opera)\s+(?:and\s+\w+\s+)?v?(\d+)(?:\.\d+)?\s*\+?/gi;

/**
 * Walk the BCD tree once and index every leaf by its dotted path and by its
 * last segment, so a post mentioning `animation-timeline` resolves without the
 * author having to name `css.properties.animation-timeline`.
 */
function indexBcd(node, prefix, out) {
  for (const [key, value] of Object.entries(node)) {
    if (key === '__compat') {
      const dotted = prefix.join('.');
      const leaf = prefix[prefix.length - 1];
      out.byPath.set(dotted, value);
      if (!out.byLeaf.has(leaf)) out.byLeaf.set(leaf, []);
      out.byLeaf.get(leaf).push({ path: dotted, compat: value });
      continue;
    }
    if (value && typeof value === 'object') indexBcd(value, [...prefix, key], out);
  }
  return out;
}

const INDEX = indexBcd(
  { css: bcd.css, api: bcd.api, html: bcd.html, javascript: bcd.javascript },
  [],
  { byPath: new Map(), byLeaf: new Map() }
);

/** Normalise one BCD support entry into a verdict for one engine. */
function shipped(compat, engine) {
  const names = ENGINES[engine] ?? [engine];
  for (const name of names) {
    let entry = compat.support?.[name];
    if (!entry) continue;
    if (Array.isArray(entry)) {
      // The first entry without flags is the real, shipped one.
      entry = entry.find(e => !e.flags) ?? entry[0];
    }
    if (!entry) continue;
    const added = entry.version_added;
    if (added === false || added === null) return { state: 'never' };
    if (added === 'preview') return { state: 'preview' };
    if (entry.flags?.length) return { state: 'flagged' };
    if (typeof added === 'string') return { state: 'shipped', since: parseFloat(added) };
  }
  return { state: 'unknown' };
}

/**
 * "Firefox 152" in "Firefox still hides it behind a flag as of Firefox 152" is
 * the opposite of a support claim, and flagging it would be a false positive.
 * A gate that cries wolf gets switched off, so a negated mention is skipped
 * rather than reported. Deliberately biased toward silence here: the positive
 * claims are the dangerous ones, and a missed negative costs nothing.
 */
const NEGATION =
  /\b(no|not|never|without|lacks?|lacking|missing|behind|flag|flagged|still|yet|un(?:supported|flagged)|except|unlike|absent|does ?n'?t|doesn't|cannot|can't|nightly|preview|until|before|older|prior)\b/i;

function isNegated(claim) {
  // A tight window only. Sentence-level negation is unreliable in both
  // directions: "a browser WITHOUT scroll-driven animations ... (Chrome 115+,
  // Firefox 132+)" carries a negation cue and a false support matrix in one
  // sentence, and a wide window silently disarms the whole gate. So the cue
  // must sit directly against the version to count.
  const NEAR = 36;
  const lead = claim.before.slice(-NEAR);
  return NEGATION.test(lead);
}

/**
 * Which features does this post actually discuss? Look for BCD leaf names that
 * appear in the post as code (`animation-timeline`) or inside a fenced block.
 * Only multi-part names are considered, because single words like "grid" or
 * "color" collide with ordinary prose and would make this noisy enough to
 * ignore, and a gate people ignore is not a gate.
 */
function featuresIn(text) {
  const found = new Map();
  for (const [leaf, entries] of INDEX.byLeaf) {
    if (!leaf.includes('-') || leaf.length < 8) continue;
    const re = new RegExp(`(\`|\\b)${leaf.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    if (re.test(text)) {
      for (const e of entries) found.set(e.path, e.compat);
    }
  }
  return found;
}

function checkPost(slug) {
  const file = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return [`${slug}: no such post`];

  const raw = fs.readFileSync(file, 'utf-8');
  const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
  const failures = [];

  const features = featuresIn(body);
  if (features.size === 0) return failures; // nothing checkable, not a failure

  const claims = [...body.matchAll(CLAIM_RE)]
    .map(m => ({
      engine: m[1].toLowerCase() === 'chromium' ? 'chrome' : m[1].toLowerCase(),
      version: parseFloat(m[2]),
      text: m[0].trim(),
      // Context before the mention, for the negation test below.
      before: body.slice(Math.max(0, m.index - 160), m.index),
      after: body.slice(m.index, m.index + 120),
    }))
    .filter(c => !isNegated(c));

  for (const claim of claims) {
    for (const [fpath, compat] of features) {
      const s = shipped(compat, claim.engine);
      if (s.state === 'never' || s.state === 'preview' || s.state === 'flagged') {
        failures.push(
          `${slug}: claims "${claim.text}" but BCD says ${fpath} has ` +
            `version_added=${s.state === 'preview' ? '"preview"' : s.state} for ` +
            `${claim.engine}. That engine has not shipped it.`
        );
      } else if (s.state === 'shipped' && claim.version < s.since) {
        failures.push(
          `${slug}: claims "${claim.text}" but BCD says ${fpath} landed in ` +
            `${claim.engine} ${s.since}, later than the version claimed.`
        );
      }
    }
  }
  return failures;
}

const args = process.argv.slice(2);
const slugs = args.length
  ? args
  : fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx')).map(f => f.replace(/\.mdx$/, ''));

const all = slugs.flatMap(checkPost);
if (all.length) {
  console.error('Fact gate FAILED:\n');
  for (const f of all) console.error('  ' + f);
  console.error(
    `\n${all.length} contradiction(s) against @mdn/browser-compat-data ${bcd.__meta.version}.`
  );
  process.exit(1);
}
console.log(`OK ${slugs.length} post(s): no browser-support claim contradicts BCD ${bcd.__meta.version}.`);
