#!/usr/bin/env python3
"""Cut a paced simulator take down to the moments that move.

Each frame's scene score says whether the picture changed: a run of changed
frames is something happening, a gap is a still screen. Cutting inside a gap
is invisible, because the frame either side of the cut is the same picture. So
the edit keeps every burst of motion, a reading hold after it, the half second
before each tap so the finger lands before the screen reacts, and drops the
rest.

Inputs, all in one folder (record.sh writes the first three):
    takes/<name>.mov     the recording
    takes/<name>.log     the test log with DEMOTAP / DEMOSWIPE / DEMOMARK lines
    takes/<name>.start   "RECSTART <unix time>"
    takes/<name>.scene   per-frame scene scores. Made for you if missing, with:

    ffmpeg -i takes/<name>.mov -vf "scale=150:-1,select='gte(scene,0)',metadata=print:key=lavfi.scene_score:file=takes/<name>.scene" -f null -

The test needs a DEMOMARK "launched" (or "ready") where the take starts and a
DEMOMARK "end" where it stops.

Usage:
    python3 demo-edit.py takes onboarding                       # print the edit as JSON
    python3 demo-edit.py takes onboarding --cut out/onboarding.mp4
    python3 demo-edit.py takes onboarding --cut out/onboarding.mp4 --width 604

The JSON lists the kept segments in frames plus every tap, swipe and mark moved
onto the output timeline, which is what an editor like Remotion needs to draw a
finger on the footage. --cut renders the cut itself with ffmpeg instead.

--width 604 matters for the web: a full-resolution simulator take (1206 wide
for an iPhone 17 Pro) may not play in a browser at all. To scale a finished
video on its own:

    ffmpeg -i in.mp4 -vf "scale=604:-2" -c:v libx264 -crf 23 -pix_fmt yuv420p -movflags +faststart -an out.mp4

Clocks: the test log and the video are not the same clock. RECORDER_LEAD below
lines them up roughly, and the lag between them still wanders by around half a
second from take to take. Good enough for keeping a window around a tap. Not
good enough for an exact cut point: read those off the frames.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

HOLD = 1.25          # seconds a finished screen stays up before the cut
PRE_TAP = 0.5        # finger visible this long before the tap lands
BURST_GAP = 0.3      # changed frames closer than this belong to one burst
SCENE_MIN = 0.001    # a scene score above this counts as "the picture changed"
FPS = 30
# record.sh writes RECSTART 1.5 s after starting the recorder, and the recorder
# takes a moment to write its first frame. This moves log times onto the video.
RECORDER_LEAD = 1.45


def scene_file(dirp: Path, name: str) -> Path:
    out = dirp / f"{name}.scene"
    if not out.exists():
        src = dirp / f"{name}.mov"
        subprocess.run(
            ["ffmpeg", "-v", "error", "-i", str(src), "-vf",
             f"scale=150:-1,select='gte(scene,0)',metadata=print:key=lavfi.scene_score:file={out}",
             "-f", "null", "-"],
            check=True,
        )
    return out


def edit(dirp: Path, name: str) -> dict:
    start = float((dirp / f"{name}.start").read_text().split()[1]) - RECORDER_LEAD
    log = (dirp / f"{name}.log").read_text()
    taps, swipes, marks = [], [], {}
    for line in log.splitlines():
        m = re.match(r"DEMOTAP ([\d.]+) ([\d.]+) ([\d.]+)", line)
        if m:
            taps.append((float(m[1]) - start, float(m[2]), float(m[3])))
        m = re.match(r"DEMOSWIPE ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)", line)
        if m:
            swipes.append((float(m[1]) - start, *map(float, m.groups()[1:])))
        m = re.match(r"DEMOMARK ([\d.]+) (\S+)", line)
        if m:
            marks[m[2]] = float(m[1]) - start

    # Frames whose picture actually changed. An app with ambient motion keeps
    # the recorder writing frames, so frame timestamps alone say nothing: the
    # scene score of each frame against the last one does.
    sc = scene_file(dirp, name).read_text()
    ts = [float(x) for x in re.findall(r"pts_time:([\d.]+)", sc)]
    ss = [float(x) for x in re.findall(r"scene_score=([\d.]+)", sc)]
    pts = [t for t, v in zip(ts, ss) if v > SCENE_MIN]

    t0 = marks.get("launched", marks.get("ready"))
    if t0 is None or "end" not in marks:
        sys.exit(f"{name}: the log needs DEMOMARK launched (or ready) and DEMOMARK end")
    t0 += 0.3
    t1 = marks["end"]
    pts = [p for p in pts if t0 <= p <= t1]
    if not pts:
        sys.exit(f"{name}: no changed frames between the marks. Wrong .start or .scene file?")

    bursts, s, prev = [], pts[0], pts[0]
    for p in pts[1:]:
        if p - prev > BURST_GAP:
            bursts.append((s, prev))
            s = p
        prev = p
    bursts.append((s, prev))

    win = [(t0, t0 + 2.2)]                                  # the opening screen, read
    win += [(a - 0.05, b + HOLD) for a, b in bursts]
    win += [(t - PRE_TAP, t + 0.15) for t, *_ in taps]
    win += [(t - PRE_TAP, t + 1.2) for t, *_ in swipes]
    win.append((t1 - 2.0, t1))                              # land on the last screen
    win = sorted((max(t0, a), min(t1, b)) for a, b in win)
    segs = [list(win[0])]
    for a, b in win[1:]:
        if a <= segs[-1][1] + 0.2:
            segs[-1][1] = max(segs[-1][1], b)
        else:
            segs.append([a, b])

    # Output time for a source time, clamped into the kept footage.
    def out(t):
        acc = 0.0
        for a, b in segs:
            if t < a:
                return acc
            if t <= b:
                return acc + (t - a)
            acc += b - a
        return acc

    frames = lambda x: round(x * FPS)
    return {
        "src": f"{name}.mov",
        "segments": [{"from": frames(a), "len": frames(b) - frames(a)} for a, b in segs],
        "seconds": [[round(a, 3), round(b, 3)] for a, b in segs],
        "taps": [{"at": frames(out(t)), "x": x, "y": y} for t, x, y in taps],
        "swipes": [{"at": frames(out(t)), "x1": a, "y1": b, "x2": c, "y2": d} for t, a, b, c, d in swipes],
        "marks": {k: frames(out(v)) for k, v in marks.items()},
        "duration": sum(frames(b) - frames(a) for a, b in segs),
        "sourceSeconds": round(t1 - t0, 1),
    }


def cut(dirp: Path, name: str, result: dict, dest: Path, width: int | None) -> None:
    parts = []
    for i, (a, b) in enumerate(result["seconds"]):
        parts.append(f"[0:v]trim=start={a}:end={b},setpts=PTS-STARTPTS[v{i}]")
    n = len(result["seconds"])
    chain = "".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0"
    chain += f",scale={width}:-2[out]" if width else "[out]"
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(dirp / f"{name}.mov"),
         "-filter_complex", ";".join(parts + [chain]), "-map", "[out]",
         "-r", str(FPS), "-c:v", "libx264", "-crf", "23", "-pix_fmt", "yuv420p",
         "-movflags", "+faststart", "-an", str(dest)],
        check=True,
    )
    print(f"wrote {dest}: {result['duration'] / FPS:.1f}s from {result['sourceSeconds']}s", file=sys.stderr)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("takes", type=Path, help="folder with <name>.mov/.log/.start")
    ap.add_argument("names", nargs="+", help="take names, e.g. onboarding")
    ap.add_argument("--cut", type=Path, help="render the cut to this mp4 (one take only)")
    ap.add_argument("--width", type=int, help="scale the cut to this width, e.g. 604")
    args = ap.parse_args()

    results = {n: edit(args.takes, n) for n in args.names}
    if args.cut:
        if len(args.names) != 1:
            sys.exit("--cut takes exactly one take name")
        cut(args.takes, args.names[0], results[args.names[0]], args.cut, args.width)
    print(json.dumps(results, indent=1))


if __name__ == "__main__":
    main()
