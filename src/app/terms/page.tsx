import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection } from "@/components/legal/LegalSection";
import { StaticPageShell } from "@/components/layout/StaticPageShell";
import { PLATFORM_COUNT } from "@/lib/platforms-registry";
import { SITE_HELLO_EMAIL, SITE_SUPPORT_EMAIL } from "@/lib/site/contact";
import { LEGAL_LAST_UPDATED, SITE_DOMAIN, SITE_LEGAL_URLS, SITE_URL } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for yournewhandle.com — free handle tools and paid API subscriptions.",
  alternates: { canonical: SITE_LEGAL_URLS.terms },
};

export default function TermsPage() {
  return (
    <StaticPageShell
      title="Terms of Service"
      description={`Last updated ${LEGAL_LAST_UPDATED}. These terms apply to ${SITE_URL} and related services operated at ${SITE_DOMAIN}.`}
    >
      <LegalSection title="1. Agreement">
        <p>
          By accessing or using yournewhandle (the &ldquo;Service&rdquo;), you agree to these Terms of
          Service. If you do not agree, do not use the Service.
        </p>
      </LegalSection>

      <LegalSection title="2. The Service">
        <p>
          yournewhandle provides a free web application for generating pronounceable handles and
          checking username availability across approximately {PLATFORM_COUNT} third-party platforms,
          plus optional paid API access (Starter, Pro, and Enterprise plans) as described on our{" "}
          <Link href="/developers" className="text-dr-blue-light hover:underline">
            developer documentation
          </Link>
          .
        </p>
        <p>
          Availability results are <strong className="font-medium text-zinc-300">best-effort</strong>.
          Platforms change without notice, rate-limit automated checks, or return ambiguous responses.
          Always confirm availability directly on each platform before registering a username or
          purchasing a domain.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts &amp; API keys">
        <p>
          Paid API access requires completing Stripe Checkout. Your API key is shown once after
          successful payment and is tied to your subscription. You are responsible for keeping your
          key confidential and for all usage under your key.
        </p>
      </LegalSection>

      <LegalSection title="4. Subscriptions &amp; billing">
        <p>
          Paid plans are billed through Stripe on a recurring basis unless cancelled. Enterprise
          plans may include a monthly platform fee plus metered usage charges as shown at checkout
          and on the developers page. Prices and limits may change with reasonable notice; continued
          use after changes constitutes acceptance.
        </p>
        <p>
          Manage billing, update payment methods, view invoices, or cancel via the Stripe customer
          portal on the{" "}
          <Link href="/developers#manage-billing" className="text-dr-blue-light hover:underline">
            developers page
          </Link>
          .
        </p>
        <p>
          Refunds are handled at our discretion except where required by applicable law. Cancelling
          stops future charges; access continues until the end of the current billing period unless
          stated otherwise.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Abuse the Service, exceed published rate limits, or attempt to bypass access controls</li>
          <li>Use the Service to harass, impersonate, or violate third-party platform terms</li>
          <li>Scrape or resell the Service in bulk without written permission</li>
          <li>Reverse engineer or interfere with the security or operation of the Service</li>
        </ul>
        <p>
          We may suspend or terminate access, including API keys, for violations or to protect the
          Service and other users.
        </p>
      </LegalSection>

      <LegalSection title="6. Intellectual property">
        <p>
          The Service, including its design, engine, and documentation, is owned by us or our
          licensors. Generated handle suggestions are provided for your use; we do not claim
          ownership of names you choose, but we do not guarantee that any suggestion is unique,
          trademark-free, or available everywhere.
        </p>
      </LegalSection>

      <LegalSection title="7. Disclaimer of warranties">
        <p>
          THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES
          OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, AND NON-INFRINGEMENT.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL,
          ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM RELATED TO THE
          SERVICE IS LIMITED TO THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS BEFORE THE CLAIM,
          OR AUD $100 IF YOU USE ONLY THE FREE TIER.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>
          We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date at the top
          will change when we do. Material changes may be communicated via the site or email where
          appropriate.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about these Terms:{" "}
          <a href={`mailto:${SITE_HELLO_EMAIL}`} className="text-dr-blue-light hover:underline">
            {SITE_HELLO_EMAIL}
          </a>
          . API and account support:{" "}
          <a href={`mailto:${SITE_SUPPORT_EMAIL}`} className="text-dr-blue-light hover:underline">
            {SITE_SUPPORT_EMAIL}
          </a>
          .
        </p>
        <p>
          See also our{" "}
          <Link href="/privacy" className="text-dr-blue-light hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/support" className="text-dr-blue-light hover:underline">
            Support
          </Link>{" "}
          page.
        </p>
      </LegalSection>
    </StaticPageShell>
  );
}
