"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { normalizeHandleForCheck } from "@/lib/checker/constants";

type InspectorInputProps = {
  onSubmit: (handle: string) => void;
  disabled?: boolean;
};

export function InspectorInput({ onSubmit, disabled }: InspectorInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = normalizeHandleForCheck(value.trim());
    if (!normalized) return;
    onSubmit(normalized);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          aria-hidden
        />
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Type a handle to check…"
          disabled={disabled}
          className="w-full rounded-md border border-border-subtle bg-base/80 py-2 pl-9 pr-3 font-mono text-sm text-zinc-100 outline-none ring-accent-cyan/40 focus:ring-2 disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-4 py-2 text-sm font-medium text-accent-cyan transition hover:bg-accent-cyan/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Check
      </button>
    </form>
  );
}
