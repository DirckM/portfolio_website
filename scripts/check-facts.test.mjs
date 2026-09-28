#!/usr/bin/env node
/**
 * Regression test for the fact gate.
 *
 * This exists because the gate disarmed itself once already. Adding negation
 * handling to stop a false positive widened the window far enough that the
 * real false claim started passing, and nothing would have reported that: a
 * gate that silently stops failing looks exactly like a gate that has nothing
 * to catch. So the two cases that defined the fix are pinned here, and CI runs
 * this before it trusts the gate on real posts.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

const CASES = [
  {
    name: 'catches a version claimed for an engine that never shipped the feature',
    // The exact sentence the generator published on 2026-09-07.
    body: 'Using `animation-timeline: scroll()`. The only decision is what a browser without scroll-driven animations does, which as of late 2026 is roughly one visitor in six (Chrome and Edge 115+, Firefox 132+, Safari 18+).',
    expect: 'fail',
  },
  {
    name: 'allows a correctly negated mention of the same engine',
    body: 'Using `animation-timeline: scroll()`. Chrome and Edge have shipped it unflagged since Chrome 115 and Safari since 26, but Firefox still hides it behind the `layout.css.scroll-driven-animations.enabled` flag in stable as of Firefox 152.',
    expect: 'pass',
  },
  {
    name: 'catches a version earlier than the one the feature actually landed in',
    body: 'Using `animation-timeline: scroll()`, supported in Safari 18+.',
    expect: 'fail',
  },
  {
    name: 'does not pair a claim with a feature from a different paragraph',
    // The gradient-border post, reduced. Both sentences are true and BCD agrees
    // with both. Before claims were scoped to their own paragraph, the gate
    // cross-multiplied them and reported four contradictions in a correct post.
    body:
      '`@property` has been Baseline since July 2024, when Firefox 128 became the last engine to ship it.'
      + '\n\n'
      + 'Or watch `background-clip: border-area`, which paints a background straight into the border box. Firefox has not shipped it at all.',
    expect: 'pass',
  },
  {
    name: 'still catches a false claim made in the same paragraph as its feature',
    // The scoping must not become an escape hatch: claim and feature together.
    body: 'Or watch `background-clip: border-area`, which Firefox 128 shipped.',
    expect: 'fail',
  },
  {
    name: 'passes a post that makes no browser-support claim at all',
    body: 'Using `animation-timeline: scroll()` to drive a bar from scroll position.',
    expect: 'pass',
  },
];

let failed = 0;
for (const c of CASES) {
  const slug = `zz-facttest-${Math.random().toString(36).slice(2, 8)}`;
  const file = path.join(BLOG_DIR, `${slug}.mdx`);
  fs.writeFileSync(
    file,
    `---\ntitle: "t"\ndescription: "d"\ndate: "2026-01-01"\ncategory: "Components"\ncomponentSlug: "${slug}"\n---\n\n${c.body}\n`
  );
  let actual;
  try {
    execFileSync('node', ['scripts/check-facts.mjs', slug], { stdio: 'pipe' });
    actual = 'pass';
  } catch {
    actual = 'fail';
  } finally {
    fs.rmSync(file, { force: true });
  }
  if (actual !== c.expect) {
    console.error(`FAIL  ${c.name}\n      expected ${c.expect}, got ${actual}`);
    failed++;
  } else {
    console.log(`ok    ${c.name}`);
  }
}

if (failed) {
  console.error(`\n${failed} self-test(s) failed. The fact gate is not trustworthy — fix it before relying on it.`);
  process.exit(1);
}
console.log(`\nAll ${CASES.length} self-tests passed.`);
