/**
 * Build the "Get the code" zip for an issue's showcase.
 *
 *   pnpm make-showcase-zip 2026-09
 *
 * Reads `showcase.designs.sources` from src/content/newsletter/<slug>.ts and
 * turns each screen of the mobile-designs library into a standalone folder:
 * index.html plus the assets it actually uses, no build step. Writes
 * public/kits/showcase-<slug>-<hash>.zip (the hash is of the contents, so a
 * changed zip gets a new URL and no cache serves the old one) and updates the
 * zip name and size in the issue file.
 *
 * What it changes on the way, and why:
 *  - The shared CSS loses every comment and the mascot rules of the design
 *    lab it came from. Those name a client's product and have no business in a
 *    public download. The script fails if any of those names survive.
 *  - Fonts load from Google Fonts and Fontshare instead of shipping as files.
 *    Cabinet Grotesk and General Sans are Fontshare fonts whose licence does
 *    not cover passing the files on, and the rest are on Google Fonts anyway.
 *  - Photos: only CC0 ones ship. A CC BY-SA photo is swapped for a CC0 one
 *    rather than shipped without the attribution it needs.
 *
 * Before zipping, every text file is checked for private paths, email
 * addresses, key-shaped strings and the client names above. Any hit stops it.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { issueBySlug } from '@/content/newsletter';

const HUB = process.env.PROJECT_HUB ?? join(homedir(), 'Documents/Project Hub');
const slug = process.argv[2];
const file = issueBySlug(slug);
if (!file?.showcase.designs) {
  console.error(
    'usage: pnpm make-showcase-zip <slug>   (the issue needs showcase.designs.sources)'
  );
  process.exit(2);
}
const designs = file.showcase.designs;

/** Photos that may ship: CC0 only (see mobile-designs/README.md). */
const PHOTO_SWAP: Record<string, string> = {
  'jp-fuji.jpg': 'night-lights.jpg', // CC BY-SA on Wikimedia, author not recorded
};
const PHOTO_LICENCE: Record<string, string> = {
  'jp-torii.jpg': 'CC0, StockSnap',
  'jp-neon.jpg': 'CC0, StockSnap',
  'night-lights.jpg': 'CC0, StockSnap',
};

const FORBIDDEN: [RegExp, string][] = [
  [/\/Users\//, 'a private path'],
  [/Project Hub/i, 'a private path'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, 'an email address'],
  [
    /\b(sk|pk|rk)_(live|test)_[A-Za-z0-9]+|\bre_[A-Za-z0-9]{16,}|eyJ[A-Za-z0-9_-]{20,}|sbp_[A-Za-z0-9]{20,}/,
    'a key',
  ],
  [/life\s*back/i, 'a client product name'],
  [/\bbrian\b/i, 'a client mascot name'],
  [/\bdaan\b/i, 'a person'],
];

const FLUENT_MIT = `Fluent Emoji, https://github.com/microsoft/fluentui-emoji

MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

const out = mkdtempSync(join(tmpdir(), `showcase-${slug}-`));
const root = join(out, `designs-${slug}`);
mkdirSync(root, { recursive: true });

function cleanCss(css: string): string {
  return (
    css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/[^{}]*\.brian[^{}]*\{[^{}]*\}/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  );
}

function fontsCss(): string {
  // Every family the library uses, from the two free font CDNs. No font files
  // ship in the zip: it stays small and no font licence is stretched.
  return (
    `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Hanken+Grotesk:wght@300..800&family=Geist+Mono:wght@300..700&family=Newsreader:opsz,wght@6..72,300..600&display=swap');\n` +
    `@import url('https://api.fontshare.com/v2/css?f[]=general-sans@300,400,500,600,700&f[]=cabinet-grotesk@400,500,700,800&display=swap');\n`
  );
}

const readme: string[] = [];
for (const src of designs.sources) {
  const lib = join(HUB, src.dir);
  const htmlPath = join(lib, 'screens', `${src.screen}.html`);
  if (!existsSync(htmlPath)) throw new Error(`missing ${htmlPath}`);
  const dest = join(root, src.name);
  const assets = join(dest, 'assets');
  mkdirSync(assets, { recursive: true });

  let html = readFileSync(htmlPath, 'utf8');
  for (const [from, to] of Object.entries(PHOTO_SWAP))
    html = html.replaceAll(from, to);
  html = html.replaceAll('../assets/', 'assets/');
  // House style for anything a reader sees: no em or en dashes in the prose.
  html = html.replace(/\s*[\u2014\u2013]\s*/g, ', ');

  const used = new Set<string>();
  for (const m of html.matchAll(
    /assets\/([A-Za-z0-9_./-]+\.(?:css|js|svg|png|jpe?g|webp|woff2))/g
  ))
    used.add(m[1]);
  // 47 builds image paths in JS: 'assets/emoji3d/' + img + '.png'. Ship the
  // ones whose names appear as strings in the page.
  if (html.includes("assets/emoji3d/'")) {
    const names = new Set([...html.matchAll(/'([a-z0-9]+)'/g)].map(m => m[1]));
    for (const f of readdirSync(join(lib, 'assets', 'emoji3d'))) {
      if (f.endsWith('.png') && names.has(f.replace(/\.png$/, '')))
        used.add(`emoji3d/${f}`);
    }
  }

  const photos: string[] = [];
  for (const rel of used) {
    const from = join(lib, 'assets', rel);
    const to = join(assets, rel);
    mkdirSync(dirname(to), { recursive: true });
    if (rel.startsWith('photos/')) {
      const name = rel.slice('photos/'.length);
      if (!PHOTO_LICENCE[name])
        throw new Error(
          `${name} has no CC0 licence on record, refusing to ship it`
        );
      photos.push(`${name} (${PHOTO_LICENCE[name]})`);
    }
    if (rel === 'fonts.css') {
      writeFileSync(to, fontsCss());
    } else if (rel.endsWith('.css')) {
      writeFileSync(to, cleanCss(readFileSync(from, 'utf8')));
    } else {
      copyFileSync(from, to);
    }
  }
  writeFileSync(join(dest, 'index.html'), html);
  if ([...used].some(u => u.startsWith('emoji3d/'))) {
    // MIT asks for its notice to travel with the files.
    writeFileSync(join(assets, 'emoji3d', 'LICENSE.txt'), FLUENT_MIT);
  }

  const item = file.showcase.items[designs.sources.indexOf(src)];
  readme.push(
    `## ${src.name}/`,
    '',
    item?.caption ?? '',
    '',
    `Open \`${src.name}/index.html\` in a browser.`,
    ...(used.has('avatars/a5.svg') ||
    [...used].some(u => u.startsWith('avatars/'))
      ? ['Avatar: DiceBear "Personas" by Draftbit, CC BY 4.0.']
      : []),
    ...([...used].some(u => u.startsWith('emoji3d/'))
      ? [
          'Stickers: Microsoft Fluent Emoji 3D, MIT licence (assets/emoji3d/LICENSE.txt).',
        ]
      : []),
    ...(photos.length ? [`Photos: ${photos.join(', ')}.`] : []),
    ''
  );
}

writeFileSync(
  join(root, 'README.md'),
  [
    `# ${file.showcase.title}`,
    '',
    `The code for the screens in "Made this month", issue ${String(file.number).padStart(3, '0')} (${file.period}) of Dirck Mulder's newsletter. dirckmulder.com/newsletter`,
    '',
    'Each folder is one screen: plain HTML, CSS and a little JavaScript, no build step. Open its index.html in a browser. Free to learn from and reuse in your own work.',
    '',
    '## Credit',
    '',
    file.showcase.credit,
    '',
    ...readme,
    '## Fonts',
    '',
    'No font files are included. Fraunces, Hanken Grotesk, Geist Mono, Newsreader and Plus Jakarta Sans load from Google Fonts, General Sans and Cabinet Grotesk from Fontshare (fontshare.com). You need to be online for them.',
    '',
  ].join('\n')
);

// ------------------------------------------------------------ sanitise
const problems: string[] = [];
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const files = walk(root).sort();
for (const f of files) {
  if (!/\.(html|css|js|md|svg|json)$/.test(f)) continue;
  const text = readFileSync(f, 'utf8');
  for (const [re, what] of FORBIDDEN) {
    const m = re.exec(text);
    if (m) problems.push(`${relative(root, f)}: ${what} ("${m[0]}")`);
  }
}
if (problems.length) {
  console.error(`Refusing to zip, found:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}

// ------------------------------------------------------------------ zip
const hash = createHash('sha256');
for (const f of files) hash.update(relative(root, f)).update(readFileSync(f));
const name = `showcase-${slug}-${hash.digest('hex').slice(0, 10)}.zip`;
const zipPath = resolve('public/kits', name);
rmSync(zipPath, { force: true });
execFileSync('zip', ['-rqX', zipPath, `designs-${slug}`], { cwd: out });
const kb = Math.round(statSync(zipPath).size / 1024);
const size = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;

for (const f of files)
  console.log(
    `  ${String(Math.round(statSync(f).size / 1024)).padStart(5)} KB  ${relative(root, f)}`
  );
console.log(`${zipPath}  ${size}`);

// Point the issue file at the new zip, and drop the one it replaces.
const issuePath = resolve('src/content/newsletter', `${slug}.ts`);
const before = readFileSync(issuePath, 'utf8');
const old = /zip: '([^']+)'/.exec(before)?.[1];
writeFileSync(
  issuePath,
  before
    .replace(/zip: '[^']+'/, `zip: '${name}'`)
    .replace(/(designs: \{\s*zip: '[^']+',\s*size: )'[^']+'/, `$1'${size}'`)
);
if (old && old !== name && old.startsWith('showcase-'))
  rmSync(resolve('public/kits', old), { force: true });
rmSync(out, { recursive: true, force: true });
