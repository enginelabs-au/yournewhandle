"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";

type CheckoutSuccessProps = {
  sessionId: string;
};

type SessionPayload = {
  ready: boolean;
  plan?: string;
  apiKey?: string;
  portalUrl?: string | null;
  message?: string;
};

export function ApiCheckoutSuccess({ sessionId }: CheckoutSuccessProps) {
  const [payload, setPayload] = useState<SessionPayload | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const response = await fetch(
      `/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`,
    );
    const data = (await response.json()) as SessionPayload;
    setPayload(data);
    setLoading(response.status === 202 || !data.ready);
  }, [sessionId]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!loading) {
      return;
    }

    const timer = window.setInterval(() => {
      void loadSession();
    }, 2500);

    return () => window.clearInterval(timer);
  }, [loading, loadSession]);

  async function copyKey() {
    if (!payload?.apiKey) {
      return;
    }
    await navigator.clipboard.writeText(payload.apiKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6">
      <div className="flex items-start gap-3">
        {loading ? (
          <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-emerald-300" />
        ) : (
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-zinc-100">
            {loading ? "Finalizing your subscription…" : "Subscription active"}
          </h2>
          <p className="mt-1 text-sm text-dr-muted">
            {loading
              ? payload?.message ??
                "We are provisioning your API key. This usually takes a few seconds."
              : "Save your API key now — it is shown once on this page."}
          </p>

          {payload?.apiKey ? (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <code className="api-code-block flex-1 rounded-lg px-3 py-2 text-xs text-emerald-200">
                  {payload.apiKey}
                </code>
                <button
                  type="button"
                  onClick={copyKey}
                  className="dr-all-tools-btn inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <CodeExample apiKey={payload.apiKey} />

              {payload.portalUrl ? (
                <a
                  href={payload.portalUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-dr-blue-light hover:underline"
                >
                  Manage billing in Stripe
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CodeExample({ apiKey }: { apiKey: string }) {
  const example = `curl -s https://yournewhandle.com/api/v1/account \\
  -H "Authorization: Bearer ${apiKey}"`;

  return (
    <pre className="api-code-block overflow-x-auto rounded-xl border border-dr-border bg-[rgb(8_12_20/0.85)] p-3 text-[11px] leading-relaxed text-emerald-200/90">
      <code>{example}</code>
    </pre>
  );
}
