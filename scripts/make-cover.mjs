#!/usr/bin/env node
// The cover graphic for a newsletter issue. One command per month:
//
//   node scripts/make-cover.mjs --number 1 --month September \
//     --screen public/blog/dishy-demo/dishy-demo-onboarding.mp4 --at 1.5 \
//     --out public/email/cover-2026-09.jpg
//
// --screen   an app screen: a video (then --at picks the frame) or an image,
//            at the simulator's aspect (1206x2622, or half of it). It is put
//            inside Apple's iPhone 17 Pro bezel, whose screen opening is
//            exactly that size, so it drops in pixel for pixel.
// --photo    alternative to --screen for a month without an app: any image,
//            shown as a tilted print instead of a phone.
// --ground   background colour, default the site orange from theme.ts.
//
// Output is a 1200x400 banner, shown at 600x200 in the email (2x for retina).
// Wide and short on purpose: on a phone the cover is the first thing on screen,
// and a near-square block filled the whole first screen with it.
// Type is the house pair from src/lib/email/theme.ts: Inter for the number,
// Instrument Serif italic for the month.

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';

function args() {
  const out = {};
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i += 2) {
    if (!a[i].startsWith('--')) throw new Error(`unexpected argument ${a[i]}`);
    out[a[i].slice(2)] = a[i + 1];
  }
  return out;
}

const opt = args();
for (const k of ['number', 'month', 'out']) {
  if (!opt[k]) {
    console.error(
      `missing --${k}. See the header of scripts/make-cover.mjs for usage.`
    );
    process.exit(2);
  }
}
if (!opt.screen && !opt.photo) {
  console.error('give --screen <video|image> or --photo <image>');
  process.exit(2);
}

const ORANGE = '#ff7e35';
const INK = '#0d0d0f';
const ground = opt.ground ?? ORANGE;
const W = 1200;
const H = 400;
const BEZEL = resolve('public/blog/dishy-demo/iphone-17-pro-silver.png');

const tmp = mkdtempSync(join(tmpdir(), 'cover-'));
const dataUrl = p => {
  const ext = extname(p).slice(1).toLowerCase().replace('jpg', 'jpeg');
  return `data:image/${ext};base64,${readFileSync(p).toString('base64')}`;
};

/** A still from a video, or the image itself. */
function still(src, at) {
  if (!existsSync(src)) throw new Error(`not found: ${src}`);
  if (!/\.(mp4|mov|webm)$/i.test(src)) return dataUrl(src);
  const png = join(tmp, 'frame.png');
  execFileSync('ffmpeg', [
    '-v',
    'error',
    '-y',
    '-ss',
    String(at ?? 1),
    '-i',
    src,
    '-frames:v',
    '1',
    png,
  ]);
  return dataUrl(png);
}

// The bezel's own geometry, in percentages so the phone can be any size:
// 1350x2760 with the screen opening at 72,69, 1206x2622, corner radius 184.
const phone = opt.screen
  ? `<div class="phone">
       <div class="screen" style="background-image:url(${still(opt.screen, opt.at)})"></div>
       <img class="bezel" src="${dataUrl(BEZEL)}">
     </div>`
  : `<div class="print" style="background-image:url(${still(opt.photo, opt.at)})"></div>`;

const num = String(opt.number).padStart(3, '0');

const html = `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;800&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box}
  html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:${ground};font-family:Inter,sans-serif}
  .grain{position:absolute;inset:0;background:
      radial-gradient(700px 360px at 80% 20%,rgba(255,255,255,.22),rgba(255,255,255,0) 60%),
      radial-gradient(600px 360px at 0% 120%,rgba(196,75,16,.35),rgba(196,75,16,0) 60%)}
  .top{position:absolute;left:56px;top:40px;display:flex;gap:28px;
       font-size:16px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${INK}}
  .num{position:absolute;left:44px;top:92px;font-size:236px;line-height:.86;font-weight:800;
       letter-spacing:-.07em;color:#fff}
  .month{position:absolute;left:470px;top:160px;font-family:'Instrument Serif',Georgia,serif;font-style:italic;
         font-size:112px;line-height:1;color:${INK};letter-spacing:-.01em}
  .rule{position:absolute;left:474px;top:300px;width:80px;height:5px;background:${INK}}
  .by{position:absolute;left:572px;top:290px;font-size:18px;font-weight:500;color:${INK}}
  .phone{position:absolute;right:70px;top:34px;width:158px;aspect-ratio:1350/2760;transform:rotate(7deg);
         filter:drop-shadow(0 26px 34px rgba(90,30,0,.35))}
  .screen{position:absolute;left:5.333%;top:2.5%;width:89.333%;height:95%;border-radius:13.6%/6.65%;
          background:#000 center/cover no-repeat}
  .bezel{position:absolute;inset:0;width:100%;height:100%}
  .print{position:absolute;right:70px;top:40px;width:250px;height:310px;transform:rotate(5deg);
         background:#fff center/cover no-repeat;border:10px solid #fff;box-shadow:0 26px 40px rgba(90,30,0,.35)}
</style></head><body>
  <div class="grain"></div>
  <div class="top"><span>dirckmulder.com</span><span>Newsletter</span></div>
  <div class="num">${num}</div>
  <div class="month">${opt.month}</div>
  <div class="rule"></div><div class="by">What I shipped this month</div>
  ${phone}
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve(opt.out), type: 'jpeg', quality: 86 });
  console.log(`${opt.out}  ${W}x${H}`);
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
