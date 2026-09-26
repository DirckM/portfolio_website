#!/usr/bin/env node
// Cover frame for a reel card in an email: one frame of the video with a play
// mark baked in, because email cannot play video and Outlook ignores the CSS
// positioning an overlay would need. Same look as public/email/reel-*.jpg.
//
//   node scripts/make-reel-thumb.mjs <video.mp4> <seconds> <public/email/out.jpg>
//
// Pick <seconds> by looking at the frames first: a sharp one, not a
// motion-blurred one, with no burnt-in caption word cut in half.
// Output is 400x711 (9:16), shown at 200px wide, so it is 2x on retina.

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const [video, at, out] = process.argv.slice(2);
if (!video || !at || !out) {
  console.error(
    'usage: node scripts/make-reel-thumb.mjs <video.mp4> <seconds> <out.jpg>'
  );
  process.exit(2);
}

// Where the play mark sits, as a % from the top. Put it where there is no face.
const PLAY_Y = Number(process.env.PLAY_Y ?? 50);
const W = 400;
const H = 711;
const dir = mkdtempSync(join(tmpdir(), 'reel-thumb-'));
const frame = join(dir, 'frame.png');
execFileSync('ffmpeg', [
  '-v',
  'error',
  '-y',
  '-ss',
  String(at),
  '-i',
  video,
  '-frames:v',
  '1',
  frame,
]);
const src = `data:image/png;base64,${readFileSync(frame).toString('base64')}`;

const html = `<!doctype html><html><head><style>
  html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#000}
  .f{position:absolute;inset:0;background:url(${src}) center/cover no-repeat}
  .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.35) 100%)}
  .play{position:absolute;left:50%;top:${PLAY_Y}%;width:92px;height:92px;margin:-46px 0 0 -46px;border-radius:50%;
        background:rgba(13,13,15,.55);border:3px solid rgba(255,255,255,.92);box-sizing:border-box;
        backdrop-filter:blur(6px)}
  .play:after{content:"";position:absolute;left:36px;top:26px;border-style:solid;border-width:18px 0 18px 28px;
        border-color:transparent transparent transparent #fff}
</style></head><body><div class="f"></div><div class="shade"></div><div class="play"></div></body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.setContent(html);
  await page.screenshot({ path: resolve(out), type: 'jpeg', quality: 82 });
  console.log(`${out}  ${W}x${H}`);
} finally {
  await browser.close();
  rmSync(dir, { recursive: true, force: true });
}
