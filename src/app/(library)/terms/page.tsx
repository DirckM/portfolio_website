import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms governing use of ${LEGAL.product}.`,
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-library-gray">
        Last updated: {LEGAL.lastUpdated}
      </p>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-library-gray [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-black [&_a]:underline">
        <p>
          These terms govern your use of {LEGAL.product} at{" "}
          <Link href={LEGAL.url}>{LEGAL.domain}</Link>. The site is operated by{" "}
          {LEGAL.controller.name}, KVK {LEGAL.controller.kvk}, BTW {LEGAL.controller.vat}, based in{" "}
          {LEGAL.controller.address}.
        </p>

        <h2>1. About this site</h2>
        <p>
          {LEGAL.domain} is a personal portfolio, blog, and component library.
          Content is provided for informational and inspirational purposes.
          Nothing on the site is sold; there is no commercial transaction
          between you and the site.
        </p>

        <h2>2. Component library</h2>
        <p>
          Code snippets and component examples are published for personal study
          and reuse. Unless a specific license is shown next to a component, you
          may use them in your own projects subject to attribution and standard
          fair-use principles. You may not republish the library as your own
          collection.
        </p>

        <h2>3. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Scrape, mirror, or republish the blog or library without permission;</li>
          <li>Abuse the contact form (spam, automated submissions);</li>
          <li>
            Attempt to probe the site for vulnerabilities outside a
            responsible-disclosure context.
          </li>
        </ul>

        <h2>4. Intellectual property</h2>
        <p>
          Text and design on {LEGAL.domain} are my copyright unless explicitly
          attributed otherwise. You may share short quotes with a link back;
          full-article reproduction requires written permission.
        </p>

        <h2>5. Limitation of liability</h2>
        <p>
          The site is provided &quot;as is&quot;. To the maximum extent
          permitted by Dutch law, I am not liable for indirect or consequential
          damages arising from your reliance on content. Nothing here limits
          liability that cannot be excluded by mandatory law.
        </p>

        <h2>6. Privacy</h2>
        <p>
          Personal data is handled as described in the{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>7. Changes</h2>
        <p>
          I may update these terms. Material changes are announced on this
          page. Continued use after the effective date constitutes acceptance.
        </p>

        <h2>8. Governing law</h2>
        <p>
          These terms are governed by the laws of the Netherlands, without
          prejudice to mandatory consumer law in your country of residence.
        </p>
      </div>
    </article>
  );
}
