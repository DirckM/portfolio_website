export const LEGAL = {
  product: "Dirck Mulder",
  domain: "dirckmulder.com",
  url: "https://dirckmulder.com",
  controller: {
    name: "Pure Studio (Dirck Mulder)",
    address: "The Netherlands",
    kvk: "98665103",
    vat: "NL005345618B56" as string | null,
  },
  contactEmail: "contact@dirckmulder.com",
  privacyEmail: "privacy@dirckmulder.com",
  lastUpdated: "2026-05-24",
  subprocessors: [
    { name: "PostHog", purpose: "Product analytics (EU-hosted)", region: "EU", url: "https://posthog.com/privacy" },
    { name: "Resend", purpose: "Contact form email delivery", region: "EU/US (SCC)", url: "https://resend.com/legal/privacy-policy" },
    { name: "Vercel", purpose: "Website hosting and edge delivery", region: "EU/US (SCC)", url: "https://vercel.com/legal/privacy-policy" },
  ],
} as const;
