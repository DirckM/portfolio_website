#!/bin/zsh
# Film one UI test driving the real app in a simulator.
#
#   ./record.sh <TestName> <take-name>
#   ./record.sh testRecordExample onboarding
#
# Writes, into takes/:
#   <take>.mov        the recording (H.264, the simulator's native resolution)
#   <take>.log        the full xcodebuild output, with the DEMOTAP/DEMOMARK lines
#   <take>.start      "RECSTART <unix time>", written just after the recorder starts
#   <take>.rec.log    the recorder's own output
#
# Build the test target once first (xcodebuild build-for-testing ...), this
# script only runs it, so a take is not delayed by a compile.
#
# Settings, as environment variables or edited below:
#   SIM_UDID     the simulator to film. By UDID, never by name: a name matches
#                several devices and "booted" matches whatever else is running.
#                Find it with: xcrun simctl list devices
#   PROJECT      path to the .xcodeproj
#   SCHEME       the scheme that holds the UI test target
#   TEST_CLASS   <UITestTarget>/<Class>, e.g. MyAppUITests/DemoRecording
#   DERIVED      derivedDataPath used by build-for-testing

set -u

SIM_UDID=${SIM_UDID:?set SIM_UDID to the simulator you want to film}
PROJECT=${PROJECT:-MyApp.xcodeproj}
SCHEME=${SCHEME:-MyApp}
TEST_CLASS=${TEST_CLASS:-MyAppUITests/DemoRecording}
DERIVED=${DERIVED:-build/dd}

TEST=${1:?usage: record.sh <TestName> <take-name>}
TAKE=${2:?usage: record.sh <TestName> <take-name>}

mkdir -p takes

# Boot this one simulator if it is not up. Never shut down or erase other
# devices, another project may be using them.
xcrun simctl bootstatus "$SIM_UDID" -b >/dev/null

# English keyboard only. With more than one keyboard language installed, iOS
# can show a multilingual typing tip over the keyboard in the middle of a take.
# If the tip still shows on the first take, restart THIS simulator once
# (xcrun simctl shutdown "$SIM_UDID") and run again.
xcrun simctl spawn "$SIM_UDID" defaults write -g AppleKeyboards -array "en_US@sw=QWERTY;hw=Automatic"
xcrun simctl spawn "$SIM_UDID" defaults write -g AppleKeyboardsExpanded -int 1

# Optional: a clean status bar. Remove if you want the real one.
xcrun simctl status_bar "$SIM_UDID" override --time "9:41" --batteryState charged --batteryLevel 100 \
  --cellularMode active --cellularBars 4 --wifiBars 3 2>/dev/null || true

# Start filming. H.264, because the default (HEVC) does not play everywhere.
xcrun simctl io "$SIM_UDID" recordVideo --codec=h264 --force "takes/$TAKE.mov" > "takes/$TAKE.rec.log" 2>&1 &
REC=$!
sleep 1.5
python3 -c "import time; print('RECSTART', time.time())" > "takes/$TAKE.start"

# The one test, nothing else.
xcodebuild test-without-building \
  -project "$PROJECT" -scheme "$SCHEME" -sdk iphonesimulator \
  -destination "id=$SIM_UDID" -derivedDataPath "$DERIVED" \
  -only-testing:"$TEST_CLASS/$TEST" \
  CODE_SIGNING_ALLOWED=NO > "takes/$TAKE.log" 2>&1
echo "test exit $?"

# SIGINT, not SIGKILL: the recorder needs to finish writing the file, or the
# .mov has no index and will not open.
sleep 1
kill -INT $REC
wait $REC

grep -E "DEMO(TAP|MARK|MISS|SWIPE)|error|failed|passed" "takes/$TAKE.log" | grep -v "^    " | head -80
echo "saved takes/$TAKE.mov"
