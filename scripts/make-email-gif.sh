#!/usr/bin/env bash
# Turn a screen recording into an email-safe GIF for the "Made this month" grid.
#
#   scripts/make-email-gif.sh <input.mp4> <output.gif> [start-seconds] [length-seconds] [width]
#
# Defaults: start 4, length 3, width 384 (a 256px tile at 1.5x).
#
# START MID-ANIMATION, on a frame where the screen is fully built. Outlook for
# Windows shows only the first frame of a GIF, so frame one is the still that a
# third of readers will ever see. An intro that fades in from white would give
# them a blank tile.
#
# Budget: under ~1 MB per GIF. Four of them sit in one email, and Gmail clips a
# message whose HTML passes 102 KB but images load separately, so the limit
# here is the reader's data plan and load time, not a hard cap. The script
# prints the size so an over-budget one is obvious.
set -euo pipefail
in="$1"; out="$2"; ss="${3:-4}"; len="${4:-3}"; w="${5:-384}"
fps="${FPS:-12}"
pal="$(mktemp -t gifpal).png"
ffmpeg -v error -y -ss "$ss" -t "$len" -i "$in" \
  -vf "fps=$fps,scale=$w:-1:flags=lanczos,palettegen=max_colors=96:stats_mode=diff" "$pal"
ffmpeg -v error -y -ss "$ss" -t "$len" -i "$in" -i "$pal" \
  -lavfi "fps=$fps,scale=$w:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" \
  -loop 0 "$out"
rm -f "$pal"
bytes=$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out")
echo "$out  $((bytes / 1024)) KB"
