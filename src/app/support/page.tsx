import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection } from "@/components/legal/LegalSection";
import { StaticPageShell } from "@/components/layout/StaticPageShell";
import { ApiBillingPortal } from "@/components/developers/ApiBillingPortal";
import {
  SITE_HELLO_EMAIL,
  SITE_HELLO_MAILTO,
  SITE_SUPPORT_EMAIL,
  SITE_SUPPORT_MAILTO,
} from "@/lib/site/contact";
import { SITE_LEGAL_URLS } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with yournewhandle — handle checker, generator, API keys, and billing.",
  alternates: { canonical: SITE_LEGAL_URLS.support },
};

export default function SupportPage() {
  return (
    <StaticPageShell
      title="Support"
      description="Help with the free tools, API subscriptions, billing, and account access."
    >
      <LegalSection id="contact" title="Contact us">
        <p>
          <strong className="font-medium text-zinc-300">Technical support &amp; API</strong>
          <br />
          <a href={SITE_SUPPORT_MAILTO} className="text-dr-blue-light hover:underline">
            {SITE_SUPPORT_EMAIL}
          </a>
          <span className="block mt-1 text-xs">
            API keys, rate limits, check accuracy, checkout issues, Enterprise plans.
          </span>
        </p>
        <p>
          <strong className="font-medium text-zinc-300">General inquiries</strong>
          <br />
          <a href={SITE_HELLO_MAILTO} className="text-dr-blue-light hover:underline">
            {SITE_HELLO_EMAIL}
          </a>
          <span className="block mt-1 text-xs">
            Partnerships, feedback, privacy questions, press.
          </span>
        </p>
        <p className="text-xs">We aim to reply within one business day (AEST).</p>
      </LegalSection>

      <LegalSection title="Billing &amp; subscriptions">
        <p>
          Paid API plans are billed through Stripe. To update your card, view invoices, or cancel:
        </p>
        <div className="rounded-xl border border-dr-border bg-[rgb(12_16_28/0.5)] p-5">
          <p className="mb-3 text-xs text-dr-muted">
            Enter the email address you used at Stripe Checkout.
          </p>
          <ApiBillingPortal />
        </div>
        <p className="text-xs">
          Or use{" "}
          <Link href="/developers#manage-billing" className="text-dr-blue-light hover:underline">
            Manage billing on the developers page
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Common questions">
        <div className="space-y-4">
          <div>
            <p className="font-medium text-zinc-300">Where is my API key?</p>
            <p className="mt-1">
              After Stripe Checkout, your key appears on the success page (starts with{" "}
              <code className="text-zinc-400">ynh_live_</code>). It is shown once — copy it
              immediately. Lost it? Email{" "}
              <a href={SITE_SUPPORT_MAILTO} className="text-dr-blue-light hover:underline">
                {SITE_SUPPORT_EMAIL}
              </a>{" "}
              from your checkout email.
            </p>
          </div>
          <div>
            <p className="font-medium text-zinc-300">Why does a platform show &ldquo;Unknown&rdquo;?</p>
            <p className="mt-1">
              Some platforms block automated checks or return ambiguous responses. Results are
              best-effort — always verify on the platform before registering a name.
            </p>
          </div>
          <div>
            <p className="font-medium text-zinc-300">How do I use the free checker?</p>
            <p className="mt-1">
              Go to the{" "}
              <Link href="/" className="text-dr-blue-light hover:underline">
                homepage
              </Link>
              , enter a handle, and run Light Check (top 50 platforms) or Deep Check (full catalog).
              No account required.
            </p>
          </div>
          <div>
            <p className="font-medium text-zinc-300">API documentation</p>
            <p className="mt-1">
              Full reference, plans, and limits:{" "}
              <Link href="/developers" className="text-dr-blue-light hover:underline">
                /developers
              </Link>
              .
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="Legal">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link href="/terms" className="text-dr-blue-light hover:underline">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="text-dr-blue-light hover:underline">
              Privacy Policy
            </Link>
          </li>
        </ul>
      </LegalSection>
    </StaticPageShell>
  );
}
