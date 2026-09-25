import XCTest

/// Drives the real app at a human pace while `simctl io recordVideo` films it.
///
/// A normal UI test taps as fast as XCTest can, which is right for a test and
/// unwatchable on a wall. Here every tap waits a beat before it lands and the
/// screen is left alone long enough to be read.
///
/// Every action prints one line to the test log:
///
///     DEMOTAP   <unix time> <x> <y>                 a tap, centre of the element, in points
///     DEMOSWIPE <unix time> <x1> <y1> <x2> <y2>     a drag, in points
///     DEMOMARK  <unix time> <label>                 a named moment ("launched", "end")
///     DEMOMISS  <element>                           an element that never showed up
///
/// XCTest taps leave no trace in a recording, so the log is what lets an editor
/// draw a finger where the finger would have been, and what `demo-edit.py`
/// uses to keep the half second before each tap. The log clock and the video
/// clock are NOT the same clock, so treat the times as approximate and read
/// exact cut points off the frames.
///
/// Add this file to your UI test target. Everything in <ANGLE_BRACKETS> is a
/// placeholder for your app's own accessibility identifiers or button labels.
final class DemoRecording: XCTestCase {
    private var app: XCUIApplication!

    // MARK: - Helpers

    private func mark(_ label: String) {
        print("DEMOMARK \(Date().timeIntervalSince1970) \(label)")
    }

    /// Wait for the element, pause `before` so the viewer sees where the finger
    /// is going, tap, then leave the result on screen for `after`.
    private func press(_ el: XCUIElement, wait: TimeInterval = 20, before: Double = 0.7, after: Double = 1.2) {
        guard el.waitForExistence(timeout: wait) else {
            print("DEMOMISS \(el.debugDescription.prefix(120))")
            return
        }
        Thread.sleep(forTimeInterval: before)
        let f = el.frame
        print("DEMOTAP \(Date().timeIntervalSince1970) \(f.midX) \(f.midY)")
        el.tap()
        Thread.sleep(forTimeInterval: after)
    }

    /// Same, by accessibility identifier or button label.
    private func press(_ id: String, wait: TimeInterval = 20, before: Double = 0.7, after: Double = 1.2) {
        press(app.buttons[id], wait: wait, before: before, after: after)
    }

    /// A slow scroll, the way a person drags, not a flick.
    private func swipeUp(_ amount: CGFloat = 0.35) {
        let size = app.frame.size
        let fromY: CGFloat = 0.72
        let start = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: fromY))
        let end = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: fromY - amount))
        print("DEMOSWIPE \(Date().timeIntervalSince1970) \(size.width / 2) \(size.height * fromY) \(size.width / 2) \(size.height * (fromY - amount))")
        start.press(forDuration: 0.05, thenDragTo: end, withVelocity: .slow, thenHoldForDuration: 0.1)
    }

    /// Type like a person: one character at a time.
    private func typeSlowly(_ field: XCUIElement, _ text: String, perChar: Double = 0.08) {
        for ch in text {
            field.typeText(String(ch))
            Thread.sleep(forTimeInterval: perChar)
        }
    }

    // MARK: - The take

    /// One take, start to finish. Record one test per video.
    ///
    /// Tune the pacing by watching the take, not by reading this file: `before`
    /// is how long the viewer waits for the next tap, `after` is how long the
    /// result stays up. A screen with text on it needs longer than you think.
    func testRecordExample() {
        app = XCUIApplication()
        // Launch arguments your app reads to start from a clean, seeded state.
        // A demo should never depend on whatever was left in the simulator.
        app.launchArguments = ["<-reset-state>", "<-seed-demo-data>"]
        app.launch()
        mark("launched")
        Thread.sleep(forTimeInterval: 2.5)          // let the first screen be read

        press("<Get started>", before: 1.5)
        press("<Option A>", before: 1.0)
        press("<Continue>", before: 0.4)

        // A text field, filled the way a person would.
        let field = app.searchFields.firstMatch
        if field.waitForExistence(timeout: 20) {
            press(field, before: 0.6, after: 0.4)
            typeSlowly(field, "<search text>")
            Thread.sleep(forTimeInterval: 0.8)
        }
        press("<result_identifier>", before: 0.4)

        // Optional steps: only tap what is actually there.
        if app.buttons["<Not now>"].waitForExistence(timeout: 3) {
            press("<Not now>", before: 1.2)
        }

        // Wait for the payoff screen, however long it takes to build, then hold on it.
        _ = app.buttons["<Final screen button>"].waitForExistence(timeout: 90)
        mark("reveal")
        Thread.sleep(forTimeInterval: 3.0)
        swipeUp(0.3)
        Thread.sleep(forTimeInterval: 2.5)
        mark("end")
    }
}
