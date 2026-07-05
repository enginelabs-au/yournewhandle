"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function ApiBillingPortal() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not open billing portal.");
      }

      window.location.href = data.url;
    } catch (portalError) {
      setError(
        portalError instanceof Error
          ? portalError.message
          : "Billing portal failed.",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email used at checkout"
        className="flex-1 rounded-xl border border-dr-border bg-[rgb(8_12_20/0.85)] px-3 py-2.5 text-xs text-zinc-100 outline-none ring-cyan-500/40 focus:ring-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="dr-all-tools-btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        Manage billing
      </button>
      {error ? <p className="w-full text-[11px] text-rose-300">{error}</p> : null}
    </form>
  );
}
