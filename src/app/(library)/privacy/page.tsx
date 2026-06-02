import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${LEGAL.product} handles your data under the EU GDPR.`,
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-library-gray">
        Last updated: {LEGAL.lastUpdated}
      </p>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-library-gray [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-black [&_a]:underline">
        <p>
          This policy explains how {LEGAL.product} (&quot;I&quot;) handle your
          data when you visit <Link href={LEGAL.url}>{LEGAL.domain}</Link>. I
          follow the EU General Data Protection Regulation (GDPR).
        </p>

        <h2>1. Data controller</h2>
        <p>
          {LEGAL.controller.name}, based in {LEGAL.controller.address} (KVK{" "}
          {LEGAL.controller.kvk}, BTW {LEGAL.controller.vat}). For privacy questions:{" "}
          <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>.
        </p>

        <h2>2. What I collect</h2>
        <p>
          <strong>Contact form:</strong> name, email, and message content
          submitted through the contact form. Delivered by Resend so I can
          reply. Legal basis: consent (Art. 6(1)(a) GDPR).
        </p>
        <p>
          <strong>Product analytics:</strong> PostHog (EU-hosted) records which
          pages and components are viewed. It uses a random anonymous
          identifier in your browser. Legal basis: legitimate interest in
          improving the site (Art. 6(1)(f)). PostHog cookies are essential to
          the analytics feature and not used for advertising.
        </p>
        <p>
          <strong>Server logs:</strong> Vercel logs IP address and user-agent
          for security and abuse prevention. Retained up to 30 days.
        </p>

        <h2>3. Subprocessors</h2>
        <p>
          EU/US transfers rely on Standard Contractual Clauses (SCC).
        </p>
        <ul className="list-disc pl-6 space-y-1">
          {LEGAL.subprocessors.map((s) => (
            <li key={s.name}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.name}
              </a>{" "}
              — {s.purpose} ({s.region}).
            </li>
          ))}
        </ul>

        <h2>4. Retention</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Contact form messages: 12 months, then deleted.</li>
          <li>Server logs: up to 30 days.</li>
          <li>Analytics events: 12 months, then aggregated.</li>
        </ul>

        <h2>5. Your rights</h2>
        <p>Under the GDPR you have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access the personal data held about you;</li>
          <li>Correct or delete it;</li>
          <li>Restrict or object to processing;</li>
          <li>Receive your data in a portable format;</li>
          <li>
            Lodge a complaint with the Dutch Data Protection Authority (
            <a
              href="https://autoriteitpersoonsgegevens.nl"
              target="_blank"
              rel="noopener noreferrer"
            >
              Autoriteit Persoonsgegevens
            </a>
            ).
          </li>
        </ul>
        <p>
          Email{" "}
          <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a> to
          exercise any of these rights. I respond within 30 days.
        </p>

        <h2>6. Cookies</h2>
        <p>
          Only essential cookies are used. There are no advertising cookies and
          no cross-site profiling.
        </p>

        <h2>7. Changes</h2>
        <p>
          I may update this policy as the site evolves. The &quot;Last
          updated&quot; date above reflects the most recent revision.
        </p>
      </div>
    </article>
  );
}
