import type { Metadata } from "next";
import Link from "next/link";
import faq from "@/lib/dishy-faq.json";

export const metadata: Metadata = {
  title: "Dishy Support",
  description:
    "Answers to the common questions about Dishy, and how to reach a person.",
};

type Entry = { q: string; a: string };
type Topic = { id: string; title: string; entries: Entry[] };

const TOPICS = (faq as { topics: Topic[] }).topics;
const SUPPORT_EMAIL = "support@dirckmulder.com";

export default function DishySupportPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Dishy Support</h1>
      <p className="mt-3 text-sm leading-relaxed text-library-gray">
        These are the same answers the app shows under Help, kept in one place
        so they cannot drift apart.
      </p>

      <div className="mt-8 rounded-lg border border-black/10 p-5">
        <h2 className="text-lg font-semibold text-black">Reach a person</h2>
        <p className="mt-2 text-sm leading-relaxed text-library-gray">
          Write to{" "}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>{" "}
          and a person replies. Tell us which iPhone you are on and what you
          expected to happen.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-library-gray">
          The app also has a chat under the You tab. It answers from the same
          text below, and anything it cannot answer goes to the address above.
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-black/10 p-5">
        <h2 className="text-lg font-semibold text-black">
          Billing and cancelling
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-library-gray">
          Subscriptions are sold and billed by Apple, so they are cancelled in
          iPhone Settings, at the top where your name is, then Subscriptions.
          Cancelling stops the renewal and you keep access until the period you
          paid for runs out. Deleting the app does not cancel anything.
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-black/10 p-5">
        <h2 className="text-lg font-semibold text-black">App Store review</h2>
        <p className="mt-2 text-sm leading-relaxed text-library-gray">
          Reviewing Dishy and need access without a purchase? Write to{" "}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>{" "}
          with the submission reference and we will enable an account for you
          the same day. A sandbox purchase also works and is not charged.
        </p>
      </div>

      <nav className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {TOPICS.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className="text-library-gray underline underline-offset-4 hover:text-black"
          >
            {t.title}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-12">
        {TOPICS.map((topic) => (
          <section key={topic.id} id={topic.id} className="scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight text-black">
              {topic.title}
            </h2>
            <dl className="mt-4 space-y-5">
              {topic.entries.map((entry) => (
                <div key={entry.q}>
                  <dt className="text-sm font-medium text-black">{entry.q}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-library-gray">
                    {entry.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <p className="mt-14 text-sm text-library-gray">
        See also the <Link className="underline" href="/privacy/dishy">Dishy privacy policy</Link>.
      </p>
    </article>
  );
}
