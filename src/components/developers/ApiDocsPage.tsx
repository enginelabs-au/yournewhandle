"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ApiBillingPortal } from "@/components/developers/ApiBillingPortal";
import { ApiCheckoutSuccess } from "@/components/developers/ApiCheckoutSuccess";
import { ApiSubscribeButton } from "@/components/developers/ApiSubscribeButton";
import {
  API_DOC_ENDPOINTS,
  API_DOC_SECTIONS,
  API_ERROR_CODES,
  API_V1_PREFIX,
  API_VERSION,
} from "@/lib/api/docs-spec";
import { API_PLAN_LIMITS, API_PLAN_PRICING, ENTERPRISE_USAGE_TIERS } from "@/lib/api/plans";
import { PLATFORM_COUNT } from "@/lib/platforms-registry";
import {
  SITE_HELLO_EMAIL,
  SITE_HELLO_MAILTO,
  SITE_SUPPORT_EMAIL,
  SITE_SUPPORT_MAILTO,
} from "@/lib/site/contact";

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="api-code-block overflow-x-auto rounded-xl border border-dr-border bg-[rgb(8_12_20/0.85)] p-4 text-xs leading-relaxed text-emerald-200/90">
      <code>{children}</code>
    </pre>
  );
}

function SectionHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description?: string;
}) {
  return (
    <header id={id} className="scroll-mt-28 border-b border-dr-border pb-4">
      <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-dr-muted">{description}</p>
      ) : null}
    </header>
  );
}

export function ApiDocsPage() {
  const [activeId, setActiveId] = useState("overview");

  useEffect(() => {
    const sectionIds = [
      ...API_DOC_SECTIONS.map((section) => section.id),
      ...API_DOC_ENDPOINTS.map((endpoint) => endpoint.id),
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, []);

  const sidebarLinks = [
    ...API_DOC_SECTIONS.map((section) => ({
      id: section.id,
      label: section.title,
    })),
    ...API_DOC_ENDPOINTS.map((endpoint) => ({
      id: endpoint.id,
      label: `${endpoint.method} ${endpoint.path.replace("/api/v1", "")}`,
    })),
  ];

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-[1400px] flex-1 gap-8 px-4 py-8 lg:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav
            aria-label="API documentation"
            className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-dr-border bg-[rgb(12_16_28/0.6)] p-3"
          >
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-dr-muted">
              On this page
            </p>
            <ul className="space-y-0.5">
              {sidebarLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className={`block rounded-lg px-2 py-1.5 text-xs transition-colors ${
                      activeId === link.id
                        ? "bg-cyan-500/10 font-medium text-dr-blue-light"
                        : "text-dr-muted hover:text-zinc-200"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="min-w-0 flex-1 space-y-12">
          <div className="api-docs-hero rounded-2xl border border-dr-border bg-gradient-to-br from-cyan-950/30 via-transparent to-purple-950/20 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-dr-blue-light">
              Developer API · v{API_VERSION}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-zinc-50 sm:text-4xl">
              yournewhandle API
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dr-muted sm:text-base">
              Paid programmatic access to the full phonetic generator, batch username
              checks across {PLATFORM_COUNT} platforms, and AI handle suggestions — the
              same engine that powers the web studio.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <CodeBlock>{`Base URL: ${API_V1_PREFIX}`}</CodeBlock>
            </div>
          </div>

          <section className="space-y-4">
            <SectionHeading
              id="overview"
              title="Overview"
              description={API_DOC_SECTIONS.find((s) => s.id === "overview")?.description}
            />
            <ul className="list-disc space-y-2 pl-5 text-sm text-dr-muted">
              <li>JSON REST API under <code className="text-zinc-300">/api/v1</code></li>
              <li>Bearer token authentication for paid endpoints</li>
              <li>Rate limits by plan with standard response headers</li>
              <li>Platform checks use the same NickCheckr-backed pipeline as the web app</li>
            </ul>
          </section>

          <section className="space-y-4">
            <SectionHeading
              id="authentication"
              title="Authentication"
              description={API_DOC_SECTIONS.find((s) => s.id === "authentication")?.description}
            />
            <p className="text-sm text-dr-muted">
              Include your API key on every authenticated request:
            </p>
            <CodeBlock>{`Authorization: Bearer ynh_live_your_secret_key`}</CodeBlock>
            <p className="text-sm text-dr-muted">
              Subscribe via Stripe Checkout. Your API key appears on the success page
              after payment and is tied to your subscription.
            </p>
          </section>

          <section className="space-y-4">
            <SectionHeading
              id="plans"
              title="Plans & limits"
              description={API_DOC_SECTIONS.find((s) => s.id === "plans")?.description}
            />
            <div className="rounded-xl border border-cyan-500/25 bg-cyan-950/15 p-4 text-sm text-dr-muted">
              <p className="font-medium text-zinc-200">Getting your API key</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed">
                <li>Choose a plan below and complete Stripe Checkout.</li>
                <li>
                  After payment, your key appears on the success page (starts with{" "}
                  <code className="text-zinc-300">ynh_live_</code>). Copy it immediately — it is
                  shown once.
                </li>
                <li>
                  Send it on every request:{" "}
                  <code className="text-zinc-300">Authorization: Bearer YOUR_API_KEY</code>
                </li>
                <li>
                  Manage billing or cancel anytime via{" "}
                  <a href="#manage-billing" className="text-dr-blue-light hover:underline">
                    Manage billing
                  </a>{" "}
                  at the bottom of this page (use the email from checkout).
                </li>
              </ol>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {(["starter", "pro", "enterprise"] as const).map((plan) => (
                <div
                  key={plan}
                  className="flex flex-col rounded-xl border border-dr-border bg-[rgb(12_16_28/0.5)] p-4"
                >
                  <p className="text-sm font-semibold text-zinc-100">
                    {API_PLAN_PRICING[plan].label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-dr-blue-light">
                    {API_PLAN_PRICING[plan].price}
                  </p>
                  <p className="mt-2 text-xs text-dr-muted">
                    {API_PLAN_PRICING[plan].description}
                  </p>
                  <ul className="mt-3 flex-1 space-y-1 text-[11px] text-dr-muted">
                    {plan === "enterprise" ? (
                      <>
                        <li className="font-medium text-zinc-300">Platform fee: $199/mo</li>
                        <li className="pt-1 font-medium text-zinc-300">Usage (graduated, billed monthly):</li>
                        {ENTERPRISE_USAGE_TIERS.map((tier) => (
                          <li key={tier.label} className="pl-2">
                            <span className="text-zinc-400">{tier.label}:</span> {tier.detail}
                          </li>
                        ))}
                        <li className="pt-1 font-medium text-zinc-300">API rate limits:</li>
                        <li className="pl-2">
                          {API_PLAN_LIMITS.enterprise.requestsPerMinute} req/min ·{" "}
                          {API_PLAN_LIMITS.enterprise.requestsPerDay.toLocaleString()} req/day max
                        </li>
                      </>
                    ) : (
                      <>
                        <li>{API_PLAN_LIMITS[plan].requestsPerDay.toLocaleString()} req/day</li>
                        <li>{API_PLAN_LIMITS[plan].requestsPerMinute} req/min</li>
                      </>
                    )}
                    <li>
                      Batch: {API_PLAN_LIMITS[plan].maxBatchHandles} handles ×{" "}
                      {API_PLAN_LIMITS[plan].maxBatchPlatforms} platforms
                    </li>
                    <li>
                      Deep check: {API_PLAN_LIMITS[plan].allowDeepCheck ? "Yes" : "Light only"}
                    </li>
                    <li>
                      AI generate: {API_PLAN_LIMITS[plan].allowAiGenerate ? "Yes" : "No"}
                    </li>
                  </ul>
                  <ApiSubscribeButton
                    plan={plan}
                    label={
                      plan === "enterprise"
                        ? "Subscribe — $199/mo + usage"
                        : `Subscribe — ${API_PLAN_PRICING[plan].price}`
                    }
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeading
              id="rate-limits"
              title="Rate limits"
              description={API_DOC_SECTIONS.find((s) => s.id === "rate-limits")?.description}
            />
            <p className="text-sm text-dr-muted">
              Authenticated responses include quota headers:
            </p>
            <CodeBlock>{`X-RateLimit-Limit-Minute: 120
X-RateLimit-Remaining-Minute: 116
X-RateLimit-Limit-Day: 25000
X-RateLimit-Remaining-Day: 24818`}</CodeBlock>
            <p className="text-sm text-dr-muted">
              When exceeded, the API returns <code className="text-zinc-300">429</code> with{" "}
              <code className="text-zinc-300">Retry-After</code> seconds.
            </p>
          </section>

          <section className="space-y-4">
            <SectionHeading
              id="errors"
              title="Errors"
              description={API_DOC_SECTIONS.find((s) => s.id === "errors")?.description}
            />
            <div className="overflow-x-auto rounded-xl border border-dr-border">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="border-b border-dr-border bg-[rgb(12_16_28/0.8)] text-dr-muted">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Code</th>
                    <th className="px-4 py-2 font-semibold">HTTP</th>
                    <th className="px-4 py-2 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {API_ERROR_CODES.map((entry) => (
                    <tr key={entry.code} className="border-b border-dr-border/60">
                      <td className="px-4 py-2 font-mono text-emerald-300/90">{entry.code}</td>
                      <td className="px-4 py-2 text-dr-muted">{entry.status}</td>
                      <td className="px-4 py-2 text-dr-muted">{entry.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CodeBlock>{`{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Retry after the reset time.",
    "retryAfter": 60
  }
}`}</CodeBlock>
          </section>

          <section className="space-y-10">
            <SectionHeading
              id="endpoints"
              title="Endpoints"
              description={API_DOC_SECTIONS.find((s) => s.id === "endpoints")?.description}
            />

            {API_DOC_ENDPOINTS.map((endpoint) => (
              <div
                key={endpoint.id}
                id={endpoint.id}
                className="scroll-mt-28 space-y-4 rounded-2xl border border-dr-border bg-[rgb(10_14_24/0.55)] p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${
                      endpoint.method === "GET"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {endpoint.method}
                  </span>
                  <code className="text-sm text-zinc-200">{endpoint.path}</code>
                  {endpoint.auth ? (
                    <span className="rounded-full border border-dr-border px-2 py-0.5 text-[10px] text-dr-muted">
                      Auth required
                    </span>
                  ) : (
                    <span className="rounded-full border border-dr-border px-2 py-0.5 text-[10px] text-dr-muted">
                      Public
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-zinc-100">{endpoint.title}</h3>
                  <p className="mt-1 text-sm text-dr-muted">{endpoint.summary}</p>
                </div>

                {endpoint.requestBody ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dr-muted">
                      Request body
                    </p>
                    <CodeBlock>{endpoint.requestBody}</CodeBlock>
                  </div>
                ) : null}

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dr-muted">
                    Response
                  </p>
                  <CodeBlock>{endpoint.responseBody}</CodeBlock>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dr-muted">
                    Example
                  </p>
                  <CodeBlock>{endpoint.curl}</CodeBlock>
                </div>

                {endpoint.notes?.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-xs text-dr-muted">
                    {endpoint.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>

          <CheckoutStatusBanner />

          <section id="manage-billing" className="scroll-mt-28 rounded-2xl border border-cyan-500/25 bg-cyan-950/20 p-6 text-center">
            <h2 className="text-lg font-semibold text-zinc-100">Manage billing</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-dr-muted">
              Update your card, view invoices, or cancel your subscription in the
              Stripe customer portal.
            </p>
            <ApiBillingPortal />
          </section>

          <section
            id="contact"
            className="scroll-mt-28 rounded-2xl border border-dr-border bg-[rgb(12_16_28/0.5)] p-6"
          >
            <h2 className="text-lg font-semibold text-zinc-100">Contact</h2>
            <p className="mt-2 max-w-xl text-sm text-dr-muted">
              Questions about the API, billing, or enterprise plans? Reach out — we typically
              reply within one business day.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href={SITE_HELLO_MAILTO} className="font-medium text-dr-blue-light hover:underline">
                  {SITE_HELLO_EMAIL}
                </a>
                <span className="text-dr-muted"> — general inquiries</span>
              </li>
              <li>
                <a
                  href={SITE_SUPPORT_MAILTO}
                  className="font-medium text-dr-blue-light hover:underline"
                >
                  {SITE_SUPPORT_EMAIL}
                </a>
                <span className="text-dr-muted"> — technical support &amp; API access</span>
              </li>
            </ul>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}

function CheckoutStatusBanner() {
  return (
    <Suspense fallback={null}>
      <CheckoutStatusBannerInner />
    </Suspense>
  );
}

function CheckoutStatusBannerInner() {
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const sessionId = searchParams.get("session_id");
  const [showCancelled] = useState(() => checkout === "cancelled");

  useEffect(() => {
    if (checkout === "cancelled") {
      window.history.replaceState(null, "", "/developers");
    }
  }, [checkout]);

  if (checkout === "success" && sessionId) {
    return (
      <div className="mb-8">
        <ApiCheckoutSuccess sessionId={sessionId} />
      </div>
    );
  }

  if (showCancelled) {
    return (
      <section className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-dr-muted">
        Checkout was cancelled. Choose a plan below when you are ready.
      </section>
    );
  }

  return null;
}

export function ApiDocsPageWithSuspense() {
  return (
    <Suspense fallback={null}>
      <ApiDocsPage />
    </Suspense>
  );
}
