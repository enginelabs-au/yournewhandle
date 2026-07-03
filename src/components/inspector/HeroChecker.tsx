"use client";

import { useState } from "react";
import { User, Search } from "lucide-react";
import { normalizeHandleForCheck } from "@/lib/checker/constants";

type HeroCheckerProps = {
  onSubmit: (handle: string) => void;
  selectedHandle: string | null;
  disabled?: boolean;
};

export function HeroChecker({
  onSubmit,
  selectedHandle,
  disabled,
}: HeroCheckerProps) {
  const [value, setValue] = useState(selectedHandle ?? "");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = normalizeHandleForCheck(value.trim());
    if (!normalized) return;
    onSubmit(normalized);
  };

  return (
    <section className="neon-card mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-blue/30 bg-accent-blue/10">
          <User className="h-5 w-5 text-accent-blue" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
            <span className="gradient-text">Username</span>{" "}
            <span className="text-zinc-100">Availability Checker</span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Generate pronounceable handles, then check domains, socials, and email
            footprint in one pass.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <User
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <input
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter a handle to check…"
            disabled={disabled}
            className="neon-input w-full rounded-xl py-3.5 pl-11 pr-4 font-mono text-base sm:text-lg disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="btn-neon-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold sm:min-w-[140px]"
        >
          <Search className="h-4 w-4" aria-hidden />
          Check
        </button>
      </form>

      {selectedHandle ? (
        <p className="mt-3 font-mono text-xs text-zinc-500">
          Results for{" "}
          <span className="text-accent-cyan">@{selectedHandle}</span>
        </p>
      ) : null}
    </section>
  );
}
