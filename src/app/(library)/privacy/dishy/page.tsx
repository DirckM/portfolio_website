import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

/**
 * Dishy's privacy policy.
 *
 * This URL is what App Store Connect's required Privacy Policy field points at,
 * and it is also the Privacy link on Dishy's paywall, so it has to resolve
 * forever. Do not rename the route.
 *
 * Every claim below was checked against the code on 2026-09-03, not assumed:
 * fridge photos are proxied and never stored, the only server-side record of a
 * scan is a count plus a random device UUID for rate limiting, and Dishy has no
 * accounts yet. When sign-in ships this page needs a new section, because a
 * policy that describes an app you no longer have is the same problem as no
 * policy at all.
 */
export const metadata: Metadata = {
  title: "Dishy Privacy Policy",
  description: "What Dishy stores, what leaves your phone, and what it never collects.",
};

const SUBPROCESSORS = [
  {
    name: "Apple",
    purpose: "Payment and subscription billing",
    region: "EU/US (SCC)",
    url: "https://www.apple.com/legal/privacy/",
  },
  {
    name: "RevenueCat",
    purpose: "Subscription status, keyed to an anonymous app identifier",
    region: "US (SCC)",
    url: "https://www.revenuecat.com/privacy",
  },
  {
    name: "Supabase",
    purpose: "Backend that proxies fridge-photo analysis and rate limits it",
    region: "EU/US (SCC)",
    url: "https://supabase.com/privacy",
  },
  {
    name: "Google (Gemini API)",
    purpose: "Reads a fridge photo and returns a list of ingredients",
    region: "EU/US (SCC)",
    url: "https://policies.google.com/privacy",
  },
  {
    name: "PostHog",
    purpose: "Product analytics, EU-hosted",
    region: "EU",
    url: "https://posthog.com/privacy",
  },
];

export default function DishyPrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Dishy Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-library-gray">Last updated: 2026-09-03</p>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-library-gray [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-black [&_a]:underline">
        <p>
          Dishy plans a week of dinners and prices the shopping list. This page
          explains what it stores, what leaves your phone and what it never
          collects. It follows the EU General Data Protection Regulation (GDPR).
        </p>
        <p>
          The short version: <strong>Dishy keeps your plan on your phone.</strong>{" "}
          There is no account, nothing to log in to, and your answers, your
          shopping list and your cooking history are not uploaded anywhere.
        </p>

        <h2>1. Who is responsible</h2>
        <p>
          {LEGAL.controller.name}, based in {LEGAL.controller.address} (KVK{" "}
          {LEGAL.controller.kvk}, BTW {LEGAL.controller.vat}). For anything on
          this page:{" "}
          <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>.
        </p>

        <h2>2. What stays on your phone</h2>
        <p>
          Your onboarding answers, your weekly plan, your shopping list, what is
          in your pantry and what you have cooked are written to Dishy&apos;s own
          storage on your device. None of it is sent to a server. Delete the app
          and it is gone with it, because there is no copy anywhere else.
        </p>

        <h2>3. Fridge photos</h2>
        <p>
          If you use the fridge scan, the photos you pick are sent to our server,
          which forwards them to Google&apos;s Gemini API to be read, and returns
          a list of ingredients. <strong>The photos are not stored.</strong> They
          exist only for the length of that one request, on our side and on
          Google&apos;s.
        </p>
        <p>
          The only record kept of a scan is the number of photos, the time, and a
          random identifier generated on your device. That exists to stop one
          device making thousands of requests, and it is not linked to your name,
          your email or your Apple Account. Legal basis: performance of the
          contract for the feature you asked for (Art. 6(1)(b) GDPR), and
          legitimate interest in preventing abuse (Art. 6(1)(f)).
        </p>

        <h2>4. Your subscription</h2>
        <p>
          Dishy is a paid subscription. <strong>Apple takes the payment</strong>,
          so card details never reach us and we never see them. Apple tells
          RevenueCat, which we use to check whether your subscription is active.
          That check is keyed to an anonymous identifier, not to you.
        </p>
        <p>
          Cancelling is done in Apple&apos;s own subscription settings, which is
          the only place Apple permits it. Dishy links you there.
        </p>

        <h2>5. Analytics</h2>
        <p>
          Dishy records which screens are used and which features are tapped, so
          it can be improved. This is EU-hosted through PostHog and uses a random
          identifier from your device. The events carry things like which
          onboarding step was reached and how many dinners a plan filled.{" "}
          <strong>
            They do not carry your name, your email, your photos, your address or
            your shopping list.
          </strong>{" "}
          Legal basis: legitimate interest in improving the app (Art. 6(1)(f)).
        </p>

        <h2>6. What Dishy never does</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>No advertising, and no ad identifiers.</li>
          <li>No selling or sharing your data with anyone for their own use.</li>
          <li>No tracking you across other apps or websites.</li>
          <li>No access to your contacts, your location or your health data.</li>
          <li>
            Camera and photo access are used only when you start a fridge scan,
            and only for the photos you choose.
          </li>
        </ul>

        <h2>7. Who processes data for us</h2>
        <p>
          These are the only third parties involved. Transfers outside the EU
          rely on Standard Contractual Clauses (SCC).
        </p>
        <ul className="list-disc space-y-1 pl-6">
          {SUBPROCESSORS.map((s) => (
            <li key={s.name}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.name}
              </a>{" "}
              — {s.purpose} ({s.region}).
            </li>
          ))}
        </ul>

        <h2>8. How long anything is kept</h2>
        <p>
          Data on your phone is kept until you delete it or delete the app. Scan
          counts are kept for 30 days for rate limiting and then removed.
          Analytics events are retained by PostHog for up to 12 months.
          Subscription records are kept as long as Apple and our bookkeeping
          obligations require, which in the Netherlands is seven years for
          financial records.
        </p>

        <h2>9. Your rights</h2>
        <p>
          Under the GDPR you can ask for access to, correction of, or deletion of
          any personal data we hold, object to processing based on legitimate
          interest, and request a copy of your data. In practice there is very
          little to ask for, because almost everything lives only on your phone
          and is not linked to you. Write to{" "}
          <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a> and
          you will get an answer within 30 days. You can also complain to the
          Dutch DPA, the{" "}
          <a
            href="https://autoriteitpersoonsgegevens.nl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Autoriteit Persoonsgegevens
          </a>
          .
        </p>

        <h2>10. Children</h2>
        <p>
          Dishy is not aimed at children and does not knowingly collect data from
          anyone under 16.
        </p>

        <h2>11. Changes</h2>
        <p>
          When Dishy changes in a way that affects this page, the page changes
          with it and the date at the top moves. Material changes will be
          announced in the app.
        </p>

        <p className="pt-4">
          <Link href="/privacy">Privacy policy for {LEGAL.domain}</Link> ·{" "}
          <Link href="/terms">Terms</Link>
        </p>
      </div>
    </article>
  );
}
