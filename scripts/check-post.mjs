// Render gate for a blog post. Loads /blog/<slug> in a real browser and fails
// if the demos are broken.
//
// This exists because `next build` cannot catch a broken post. The <LiveStep>
// boxes are react-live, which compiles JSX in the browser against a scope
// object, and an unknown component or a codeId that does not exist in
// live-step-codes.ts produces a blank or erroring box at runtime while the
// build stays green. Anything generating posts automatically needs this gate,
// not a build, to know whether it succeeded.
//
// Usage:
//   node scripts/check-post.mjs <slug>              starts its own next server
//   BASE_URL=http://localhost:3000 node scripts/check-post.mjs <slug>
//
// Exits 0 when the post renders, 1 with a reason when it does not.

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const slug = args.find(a => !a.startsWith('--'));
const PORT = process.env.PORT || '3111';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

if (!slug) {
  console.error('usage: node scripts/check-post.mjs <slug> [--strict]');
  process.exit(1);
}

const failures = [];
const warnings = [];
const fail = reason => failures.push(reason);

// Things a NEW post must have, but that 11 of the original 63 posts are missing.
// Warn when checking the existing corpus, fail under --strict, which is what the
// weekly generator runs.
const requireForNew = reason => (STRICT ? failures : warnings).push(reason);

// --- static checks, before we pay for a browser ------------------------------

const postPath = join(ROOT, 'src/content/blog', `${slug}.mdx`);
if (!existsSync(postPath)) {
  console.error(`FAIL ${slug}: src/content/blog/${slug}.mdx does not exist`);
  process.exit(1);
}

const raw = readFileSync(postPath, 'utf-8');
const { data: frontmatter, content } = matter(raw);

for (const field of ['title', 'description', 'date', 'category', 'componentSlug']) {
  if (!frontmatter[field]) fail(`frontmatter is missing "${field}"`);
}

// Every codeId the post references must exist, otherwise LiveStep gets ''.
const codeIds = [...content.matchAll(/codeId=["']([^"']+)["']/g)].map(m => m[1]);
if (codeIds.length === 0) fail('the post has no <LiveStep codeId="..."> demos');

const codesSource = readFileSync(join(ROOT, 'src/lib/live-step-codes.ts'), 'utf-8');
for (const id of codeIds) {
  if (!codesSource.includes(`'${id}'`) && !codesSource.includes(`"${id}"`)) {
    fail(`codeId "${id}" is not defined in src/lib/live-step-codes.ts`);
  }
}

// componentSlug has to resolve, or the header demo and the "View component"
// link in BlogPostLayout both dead-end.
const registrySource = readFileSync(join(ROOT, 'src/lib/components-registry.ts'), 'utf-8');
if (!registrySource.includes(`'${frontmatter.componentSlug}'`)) {
  fail(`componentSlug "${frontmatter.componentSlug}" is not in components-registry.ts`);
}

const previewsSource = readFileSync(join(ROOT, 'src/lib/component-previews.tsx'), 'utf-8');
const demosBlock = previewsSource.slice(previewsSource.indexOf('export const fullDemos'));
if (!demosBlock.includes(`'${frontmatter.componentSlug}'`)) {
  requireForNew(
    `componentSlug "${frontmatter.componentSlug}" has no entry in fullDemos, so the post renders without its hero demo`
  );
}

if (failures.length > 0) {
  console.error(`FAIL ${slug}:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

// --- browser check ----------------------------------------------------------

let server;
async function startServer() {
  if (process.env.BASE_URL) return; // caller already has one running

  server = spawn('pnpm', ['start', '--port', PORT], {
    cwd: ROOT,
    stdio: 'ignore',
    detached: false,
  });

  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok || res.status === 404) return;
    } catch {
      // not up yet
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`server did not come up on ${BASE_URL} within 90s`);
}

function stopServer() {
  if (server && !server.killed) server.kill('SIGTERM');
}

let exitCode = 0;
try {
  await startServer();

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(String(err)));

  const response = await page.goto(`${BASE_URL}/blog/${slug}`, {
    waitUntil: 'networkidle',
    timeout: 60_000,
  });

  if (!response || !response.ok()) {
    fail(`/blog/${slug} returned ${response ? response.status() : 'no response'}`);
  }

  // react-live mounts on the client, so give the demos a beat to compile.
  await page.waitForTimeout(2500);

  const errorText = await page.$$eval('[data-live-error]', nodes =>
    nodes.map(n => n.textContent.trim()).filter(Boolean)
  );
  for (const text of errorText) {
    fail(`a LiveStep failed to compile: ${text.slice(0, 200)}`);
  }

  const previews = await page.$$eval('[data-live-preview]', nodes =>
    nodes.map(n => ({
      empty: n.children.length === 0 && n.textContent.trim() === '',
      html: n.innerHTML.slice(0, 80),
    }))
  );

  if (previews.length === 0) {
    fail('no LiveStep demos rendered on the page at all');
  }
  previews.forEach((p, i) => {
    if (p.empty) fail(`LiveStep demo #${i + 1} rendered an empty box`);
  });

  const realErrors = consoleErrors.filter(
    e => !/favicon|Download the React DevTools|hydrat/i.test(e)
  );
  for (const e of realErrors.slice(0, 5)) {
    fail(`console error: ${e.slice(0, 200)}`);
  }

  await browser.close();
} catch (err) {
  fail(String(err.message || err));
} finally {
  stopServer();
}

for (const w of warnings) console.warn(`WARN ${slug}: ${w}`);

if (failures.length > 0) {
  console.error(`FAIL ${slug}:`);
  for (const f of failures) console.error(`  - ${f}`);
  exitCode = 1;
} else {
  console.log(`OK ${slug}: ${codeIds.length} demo(s) rendered clean`);
}

process.exit(exitCode);
