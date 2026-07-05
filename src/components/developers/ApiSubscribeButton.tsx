"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { ApiPlan } from "@/lib/api/plans";

type ApiSubscribeButtonProps = {
  plan: ApiPlan;
  label: string;
  className?: string;
};

export function ApiSubscribeButton({
  plan,
  label,
  className = "btn-pipeline mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold",
}: ApiSubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      window.location.href = data.url;
    } catch (subscribeError) {
      setError(
        subscribeError instanceof Error
          ? subscribeError.message
          : "Checkout failed.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Redirecting…
          </>
        ) : (
          label
        )}
      </button>
      {error ? <p className="mt-2 text-[11px] text-rose-300">{error}</p> : null}
    </div>
  );
}
