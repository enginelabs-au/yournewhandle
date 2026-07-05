import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection } from "@/components/legal/LegalSection";
import { StaticPageShell } from "@/components/layout/StaticPageShell";
import { SITE_HELLO_EMAIL, SITE_SUPPORT_EMAIL } from "@/lib/site/contact";
import { LEGAL_LAST_UPDATED, SITE_DOMAIN, SITE_LEGAL_URLS, SITE_URL } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How yournewhandle.com collects, uses, and protects your information.",
  alternates: { canonical: SITE_LEGAL_URLS.privacy },
};

export default function PrivacyPage() {
  return (
    <StaticPageShell
      title="Privacy Policy"
      description={`Last updated ${LEGAL_LAST_UPDATED}. This policy describes how we handle information when you use ${SITE_URL}.`}
    >
      <LegalSection title="1. Who we are">
        <p>
          yournewhandle ({SITE_DOMAIN}) provides handle generation and username availability tools,
          including an optional paid API. For privacy questions contact{" "}
          <a href={`mailto:${SITE_HELLO_EMAIL}`} className="text-dr-blue-light hover:underline">
            {SITE_HELLO_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>
          <strong className="font-medium text-zinc-300">Free web app.</strong> When you use the
          checker or generator, handles you type or generate are processed to perform availability
          checks. We do not require an account for the free tier. Basic usage analytics (see below)
          may be collected.
        </p>
        <p>
          <strong className="font-medium text-zinc-300">Paid API &amp; billing.</strong> If you
          subscribe, Stripe processes your payment and customer details. We store your checkout
          email, subscription status, and API key metadata needed to authenticate requests and enforce
          rate limits.
        </p>
        <p>
          <strong className="font-medium text-zinc-300">Support.</strong> If you email us, we receive
          the content of your message and your email address.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use information">
        <ul className="list-disc space-y-2 pl-5">
          <li>Operate the checker, generator, and API</li>
          <li>Authenticate API requests and apply plan limits</li>
          <li>Process subscriptions and billing through Stripe</li>
          <li>Respond to support requests</li>
          <li>Improve reliability, security, and product performance</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Third-party services">
        <p>We use trusted providers to run the Service, including:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-zinc-300">Stripe</strong> — payments and customer
            portal
          </li>
          <li>
            <strong className="font-medium text-zinc-300">Vercel</strong> — hosting and analytics
          </li>
          <li>
            <strong className="font-medium text-zinc-300">Upstash</strong> — rate limiting and API
            key storage
          </li>
          <li>
            <strong className="font-medium text-zinc-300">Google (Gemini)</strong> — optional AI
            handle suggestions on Pro/Enterprise plans
          </li>
        </ul>
        <p>
          Username checks query third-party platforms and public endpoints. We do not control how
          those services handle requests or log data.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies &amp; analytics">
        <p>
          We may use cookies or similar technologies for essential site function, preferences (such
          as theme and language), and aggregated analytics to understand usage. You can control
          cookies through your browser settings.
        </p>
      </LegalSection>

      <LegalSection title="6. Retention">
        <p>
          We retain information only as long as needed to provide the Service, comply with legal
          obligations, resolve disputes, and enforce agreements. API usage counters and cached check
          results may be stored for limited periods for performance.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <p>
          Depending on your location, you may have rights to access, correct, or delete personal
          information we hold. Contact{" "}
          <a href={`mailto:${SITE_HELLO_EMAIL}`} className="text-dr-blue-light hover:underline">
            {SITE_HELLO_EMAIL}
          </a>{" "}
          to make a request. Stripe holds payment data under its own privacy policy.
        </p>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>
          We use industry-standard measures to protect data in transit and at rest. No method of
          transmission over the internet is 100% secure.
        </p>
      </LegalSection>

      <LegalSection title="9. Children">
        <p>The Service is not directed at children under 13. We do not knowingly collect their data.</p>
      </LegalSection>

      <LegalSection title="10. Changes">
        <p>
          We may update this Privacy Policy. The date at the top will reflect the latest version.
          Continued use after changes constitutes acceptance where permitted by law.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Privacy inquiries:{" "}
          <a href={`mailto:${SITE_HELLO_EMAIL}`} className="text-dr-blue-light hover:underline">
            {SITE_HELLO_EMAIL}
          </a>
          . Technical support:{" "}
          <a href={`mailto:${SITE_SUPPORT_EMAIL}`} className="text-dr-blue-light hover:underline">
            {SITE_SUPPORT_EMAIL}
          </a>
          .
        </p>
        <p>
          See our{" "}
          <Link href="/terms" className="text-dr-blue-light hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </StaticPageShell>
  );
}
