import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Dishy Privacy Policy",
  description:
    "What Dishy collects, what it sends to a server, and what it never stores.",
};

const UPDATED = "2026-09-16";

export default function DishyPrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Dishy Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-library-gray">Last updated: {UPDATED}</p>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-library-gray [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-black [&_a]:underline">
        <p>
          Dishy is a meal-planning app for iPhone. This policy covers the app
          only. For the website, see the{" "}
          <Link href="/privacy">main privacy policy</Link>.
        </p>
        <p>
          Dishy is local-first. Your week, your plan and your shopping list are
          stored on your phone and the app works with the radio off. The
          sections below describe the few things that do leave the device.
        </p>

        <h2>1. Who is responsible</h2>
        <p>
          {LEGAL.controller.name}, based in {LEGAL.controller.address}. For
          privacy questions:{" "}
          <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>. For
          help with the app:{" "}
          <a href="mailto:support@dirckmulder.com">support@dirckmulder.com</a>.
        </p>

        <h2>2. Your account</h2>
        <p>
          An account is optional and the app works fully without one. Nothing is
          withheld if you never sign in. If you do sign in, we store your{" "}
          <strong>email address</strong> so the account can be recognised on
          your next device. Signing in with Apple or Google passes us whatever
          that provider releases, which is an email address and nothing more.
          Legal basis: performance of a contract (Art. 6(1)(b) GDPR).
        </p>
        <p>
          You can delete your account from inside the app, under the You tab.
          That removes the account and anything stored against it from our
          servers. Your week stays on your phone, because it was never anywhere
          else. Your subscription is billed by Apple and is not cancelled by
          deleting the account.
        </p>

        <h2>3. The fridge scan</h2>
        <p>
          When you photograph your fridge, the photo is sent to a server
          function which forwards it to <strong>Google Gemini</strong> to read
          what is in it. The result comes back as a list of ingredients.
        </p>
        <p>
          <strong>The photo is not stored.</strong> It is held in memory for the
          length of the request and discarded. We keep a count of scans and a
          random device identifier so the feature cannot be abused, and that
          identifier is not linked to your account or your email.
        </p>
        <p>
          The app asks your permission before the first scan. If you decline,
          the feature does not run. Legal basis: your consent (Art. 6(1)(a)
          GDPR). You can withdraw it at any time under the You tab, separately
          from the chat, and the rest of the app is unaffected.
        </p>

        <h2>4. The support chat</h2>
        <p>
          The in-app chat sends your question to a server function, which
          forwards it to <strong>Google Gemini</strong> along with the app&apos;s
          published help text. Nothing else is sent: not your plan, not your
          shopping list, not your account, not your email.
        </p>
        <p>
          The app asks your permission before the first question. Your questions
          are not kept as a transcript and are not readable by us. A count of
          questions is recorded against a random identifier so the service
          cannot be flooded, and a question you report as a bad answer is stored
          so it can be looked at. Nothing in either record identifies you. Legal
          basis: your consent (Art. 6(1)(a) GDPR), withdrawable at any time
          under the You tab.
        </p>

        <h2>5. Analytics</h2>
        <p>
          Dishy records which screens are used and which steps of setup are
          completed, through <strong>PostHog</strong> (EU-hosted). These events
          carry no email address, no account id and no content of your plan.
          Legal basis: legitimate interest in knowing which parts of the app
          work (Art. 6(1)(f) GDPR).
        </p>

        <h2>6. Crashes and performance</h2>
        <p>
          The app reports crashes, hangs and performance figures such as launch
          time, energy use and peak memory. These come from Apple&apos;s own
          MetricKit, which the operating system collects and aggregates on the
          device and hands to the app about once a day. They are counts and
          timings, never a stack trace containing your data, and they carry no
          email address, no account id and nothing from your plan.
        </p>
        <p>
          We send them to PostHog, the same EU-hosted processor as the analytics
          above. No crash-reporting company is involved and nothing extra leaves
          your phone to a third party. Legal basis: legitimate interest in the
          app not being broken (Art. 6(1)(f) GDPR).
        </p>

        <h2>7. Purchases</h2>
        <p>
          Subscriptions are sold by Apple. We never see your payment details.{" "}
          <strong>RevenueCat</strong> tells the app whether a subscription is
          active, against an identifier Apple provides. Legal basis for both
          RevenueCat and Apple: performance of the contract to supply the app
          (Art. 6(1)(b) GDPR).
        </p>

        <h2>8. Who processes data for us</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase</strong> (EU) — accounts and rate-limit records.
          </li>
          <li>
            <strong>Google Gemini</strong> — fridge photos and chat questions,
            processed to produce the answer and not used to train models on your
            data.
          </li>
          <li>
            <strong>RevenueCat</strong> — subscription status.
          </li>
          <li>
            <strong>PostHog</strong> (EU) — anonymous product analytics, plus crash and performance figures from MetricKit.
          </li>
          <li>
            <strong>Apple</strong> — the App Store, payments and, if you use it,
            Sign in with Apple.
          </li>
        </ul>
        <p>
          <strong>Transfers outside the EU.</strong> Supabase and PostHog hold
          data in the EU. Google, RevenueCat and Apple are United States
          companies, so a fridge photo, a chat question, your subscription
          status and your Apple sign-in may be processed there. Those transfers
          rely on the European Commission&apos;s Standard Contractual Clauses,
          and where the provider is certified, on the EU-US Data Privacy
          Framework. You can ask us for a copy of the safeguards.
        </p>

        <h2>9. How long we keep things</h2>
        <p>
          Account records live until you delete the account. Rate-limit rows are
          pruned. Photos and chat questions are not retained at all. Analytics
          events are kept in aggregate.
        </p>

        <h2>10. Your rights</h2>
        <p>
          Under the GDPR you can ask for access, correction, erasure, a copy of
          your data, or object to processing. Deleting your account in the app
          does most of this immediately. For anything else, write to{" "}
          <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>. You
          may also complain to the Autoriteit Persoonsgegevens.
        </p>

        <h2>11. Children</h2>
        <p>
          Dishy is not aimed at children and we do not knowingly collect data
          from anyone under 16.
        </p>

        <h2>12. Changes</h2>
        <p>
          If this policy changes materially, the date at the top changes with
          it.
        </p>
      </div>
    </article>
  );
}
