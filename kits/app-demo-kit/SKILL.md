---
name: app-demo-kit
description: Record a smooth, pre-rendered demo of a real iOS app for a talk, a landing page or a blog post. A UI test drives the app at human pace and logs every tap, simctl films the simulator, a script cuts the still stretches out by scene score, and the video plays inside Apple's iPhone bezel next to a chapter list that follows playback. Use when the user says "demo video of my app", "app walkthrough for my talk", "record the simulator", "make the app demo play by itself", "demo slide", "screen recording of my iOS app but smooth", or is about to do a live demo on stage. Not for animating UI that is not a running app (use a motion tool like Remotion for that) and not for Android.
---

# App demo kit

Film the real app, driven by a test, and play the recording. The walkthrough
looks smooth because nothing in it is improvised: every tap lands at a pace
chosen in code, and the dead time between taps is cut out afterwards.

## When to use it

- A talk or pitch where the app has to be shown. Play a recording. Do not demo
  live on stage: a live demo depends on wifi, a warm simulator and your hands
  not shaking, and a recording depends on nothing.
- A landing page or blog post that should show the app moving.
- Any time a screen recording made by hand looks hesitant, with the pointer
  wandering and pauses where you were thinking.

## What is in here

```
templates/
  DemoRecording.swift   UI test with paced press/swipe helpers and DEMOTAP/DEMOMARK/DEMOSWIPE logging
  record.sh             boots one simulator by UDID, English keyboard, films one test with simctl
  demo-edit.py          cuts the take down to the moments that move, from ffmpeg scene scores + the tap log
  deck/index.html       the video in an iPhone bezel with a chapter list that follows playback
```

## The order

1. **Make the app start clean.** Give it launch arguments that reset state and
   seed demo data, so every take starts from the same screen with the same
   content. A demo that depends on what was left in the simulator cannot be
   re-recorded after a UI change.

2. **Write the take as a UI test.** Copy `templates/DemoRecording.swift` into
   the UI test target and replace the `<placeholders>` with the app's own
   accessibility identifiers or button labels. One test per video. `press()`
   waits `before` so the viewer sees where the finger goes and holds `after` so
   the result can be read. Tune those numbers by watching the take. Put a
   `mark("launched")` at the start and `mark("end")` at the end.

3. **Build once, then film.** `xcodebuild build-for-testing` with the same
   `-derivedDataPath` as `record.sh`, then:

   ```
   SIM_UDID=<udid> PROJECT=MyApp.xcodeproj SCHEME=MyApp TEST_CLASS=MyAppUITests/DemoRecording \
     ./record.sh testRecordExample onboarding
   ```

   Use a dedicated simulator, picked by UDID (`xcrun simctl list devices`).
   Check the grep at the end for `DEMOMISS` lines: an element that never showed
   up means the take is wrong, re-record it.

4. **Cut the dead time.** `python3 demo-edit.py takes onboarding --cut
   out/onboarding.mp4 --width 604`. It keeps every burst of motion plus a
   reading hold, the half second before each tap, and drops still stretches.
   Cuts land inside still screens, so they are invisible. Without `--cut` it
   prints the edit as JSON (segments, taps, swipes and marks on the output
   timeline), for an editor that draws a finger on the footage. XCTest taps
   leave no trace in a recording, so that is the only way a viewer sees one.

5. **Put it in the phone.** Download Apple's iPhone bezel from
   https://developer.apple.com/design/resources/ (Product Bezels). For iPhone 17
   Pro the PNG is 1350x2760 and its screen opening is 1206x2622 at 72,69, which
   is exactly the simulator's own resolution, so the footage drops in pixel for
   pixel. Save it as `deck/iphone-17-pro-silver.png`. The bezel is Apple's
   marketing artwork, so check their terms before publishing it. Another model
   needs its own numbers, measured from the PNG's alpha channel.

6. **Chapters.** Copy the cut video to `deck/demo.mp4`, scrub it, and write one
   `<li data-at="seconds">` per part. The list lights the part that is playing
   and fills a line under it, so you can talk over the video without clicking.

7. **On stage**, open `deck/index.html` full screen. Space pauses, R restarts.
   Keep the real app open in a simulator next to it for questions.

## Gotchas

- **Keyboard.** Set the simulator keyboard to English only before filming
  (`record.sh` does this). With more keyboard languages installed, a
  multilingual typing tip can pop up over the keyboard in the middle of a take.
  If it still appears, restart that one simulator and film again.
- **The browser will not play the full-resolution take.** A 1206x2622 H.264
  file may simply not play in a browser. Scale to about 604 wide:
  `ffmpeg -i in.mp4 -vf "scale=604:-2" -c:v libx264 -crf 23 -pix_fmt yuv420p -movflags +faststart -an out.mp4`
- **Record H.264.** `simctl io recordVideo` defaults to HEVC. `record.sh`
  passes `--codec=h264`.
- **The log clock is not the video clock.** The times in the test log and the
  frames of the video drift apart by a second or more, and not by the same
  amount every take. `demo-edit.py` corrects with a fixed offset, which is fine
  for keeping a window around a tap. Read exact cut points off the frames.
- **Stop the recorder with SIGINT.** Killing it hard leaves a `.mov` without an
  index that will not open. `record.sh` sends `kill -INT` and waits.
- **Long renders.** If you composite the take in a video tool and a long take
  crashes the render, split it or cut it with `demo-edit.py --cut` first.
- **Dropped frames on busy screens.** If a heavy screen stutters, film it a few
  times and keep the cleanest take. `minterpolate=fps=60:mi_mode=blend` fills a
  one or two frame gap without warping text.
- **No live demos.** Worth repeating.

## Example

This kit is generalised from the setup behind the Dishy app demos, written up
at https://dirckmulder.com/blog/how-i-made-the-dishy-demo-videos
