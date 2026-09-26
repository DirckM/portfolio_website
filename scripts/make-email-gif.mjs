#!/usr/bin/env node
// Turn a deterministic screen render (Remotion, 60 fps constant) into an
// email-safe GIF for the "Made this month" grid, and a matching mp4.
//
//   node scripts/make-email-gif.mjs <in.mp4> <out.gif> [--len 3] [--width 320] [--colors 96] [--from 1] [--start <s>]
//
// WHY THESE NUMBERS. A GIF frame delay is a whole number of centiseconds, so
// only 100/n fps is exact: 50, 33.3, 25, 20, 16.7 ... The first version used
// 12 fps, which GIF cannot represent: the encoder alternated 8 and 9 cs delays
// (80,90,80,80,90...) and the motion visibly limped. 20 fps is the rate that is
// exact on BOTH sides: a 5 cs delay, and every third frame of a 60 fps source,
// so each GIF step covers the same slice of motion. 25 fps would need 2.4
// source frames per step, which judders in the other direction.
//
// THE LOOP. The script searches for the segment of --len seconds whose last
// frame is closest to its first (so the jump back is invisible), among starts
// at or after --from seconds. Pass --start to pin it by hand instead. The
// first frame is also the one Outlook shows, so --from should skip any intro
// that starts on an empty or unflattering frame.
//
// Dithering: bayer, scale 5, which on flat UI colours gives a stable pattern
// between frames instead of the crawling noise of error diffusion.
//
// Budget: under ~1 MB per GIF. It prints the size.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const [input, output] = argv;
const opt = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? Number(argv[i + 1]) : dflt;
};
if (!input || !output) {
  console.error(
    'usage: node scripts/make-email-gif.mjs <in.mp4> <out.gif> [--len 3] [--width 320] [--colors 96] [--from 1] [--start s]'
  );
  process.exit(2);
}

const FPS = 20;
const len = opt('len', 3);
const width = opt('width', 320);
const colors = opt('colors', 96);
const from = opt('from', 1);
let start = opt('start', NaN);

const probe = JSON.parse(
  execFileSync('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v',
    '-show_entries',
    'stream=r_frame_rate,duration',
    '-of',
    'json',
    input,
  ]).toString()
).streams[0];
const [num, den] = probe.r_frame_rate.split('/').map(Number);
if (num / den !== 60) {
  console.warn(
    `WARNING: source is ${num / den} fps, not 60. The 20 fps steps will not be even.`
  );
}

if (Number.isNaN(start)) {
  // Tiny grey frames at the GIF's own rate, compared as raw bytes.
  const W = 48;
  const raw = execFileSync('ffmpeg', [
    '-v',
    'error',
    '-i',
    input,
    '-vf',
    `fps=${FPS},scale=${W}:-2,format=gray`,
    '-f',
    'rawvideo',
    '-',
  ]);
  const probeSmall = execFileSync('ffmpeg', [
    '-v',
    'error',
    '-i',
    input,
    '-frames:v',
    '1',
    '-vf',
    `scale=${W}:-2,format=gray`,
    '-f',
    'rawvideo',
    '-',
  ]);
  const size = probeSmall.length;
  const frames = Math.floor(raw.length / size);
  const frame = i => raw.subarray(i * size, (i + 1) * size);
  const diff = (a, b) => {
    let d = 0;
    for (let k = 0; k < size; k++) d += Math.abs(a[k] - b[k]);
    return d / size;
  };
  const n = Math.round(len * FPS);
  let best = { d: Infinity, i: 0 };
  for (let i = Math.round(from * FPS); i + n < frames; i++) {
    // The frame after the last one should equal the first: that is a seamless loop.
    const d = diff(frame(i), frame(i + n));
    if (d < best.d) best = { d, i };
  }
  start = best.i / FPS;
  console.log(
    `loop: start ${start.toFixed(2)}s, end-to-start difference ${best.d.toFixed(2)} (0 = identical)`
  );
}

const dir = mkdtempSync(join(tmpdir(), 'gif-'));
const pal = join(dir, 'pal.png');
const chain = `fps=${FPS},scale=${width}:-2:flags=lanczos`;
execFileSync('ffmpeg', [
  '-v',
  'error',
  '-y',
  '-ss',
  String(start),
  '-t',
  String(len),
  '-i',
  input,
  '-vf',
  `${chain},palettegen=max_colors=${colors}:stats_mode=diff`,
  pal,
]);
execFileSync('ffmpeg', [
  '-v',
  'error',
  '-y',
  '-ss',
  String(start),
  '-t',
  String(len),
  '-i',
  input,
  '-i',
  pal,
  '-lavfi',
  `${chain}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
  '-loop',
  '0',
  output,
]);
// The same segment as an mp4, for the designs page: constant frame rate,
// H.264 yuv420p, moov atom first so it starts before it has fully loaded.
const mp4 = output.replace(/\.gif$/, '.mp4');
execFileSync('ffmpeg', [
  '-v',
  'error',
  '-y',
  '-ss',
  String(start),
  '-t',
  String(len),
  '-i',
  input,
  '-an',
  '-vf',
  `fps=30,scale=${Math.round((width * 1.25) / 2) * 2}:-2:flags=lanczos`,
  '-fps_mode',
  'cfr',
  '-c:v',
  'libx264',
  '-pix_fmt',
  'yuv420p',
  '-crf',
  '26',
  '-preset',
  'slow',
  '-movflags',
  '+faststart',
  mp4,
]);
rmSync(dir, { recursive: true, force: true });
console.log(
  `${output}  ${Math.round(statSync(output).size / 1024)} KB, ${FPS} fps, 5 cs per frame`
);
console.log(`${mp4}  ${Math.round(statSync(mp4).size / 1024)} KB`);
