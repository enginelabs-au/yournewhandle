"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type MatrixAccordionProps = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  nested?: boolean;
  children: ReactNode;
};

export function MatrixAccordion({
  title,
  subtitle,
  defaultOpen = false,
  nested = false,
  children,
}: MatrixAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={
        nested
          ? "matrix-accordion-nested rounded-md border border-dr-border/40 bg-dr-panel/20"
          : "matrix-accordion rounded-lg border border-dr-border/60 bg-dr-panel-2/30"
      }
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full items-start justify-between gap-2 text-left ${
          nested ? "px-2.5 py-2" : "px-3 py-2.5"
        }`}
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <span
            className={`block font-semibold uppercase tracking-wide text-dr-muted ${
              nested ? "text-[10px]" : "text-[11px]"
            }`}
          >
            {title}
          </span>
          {!open && subtitle ? (
            <span className="mt-0.5 block truncate text-[11px] font-normal normal-case tracking-normal text-zinc-400">
              {subtitle}
            </span>
          ) : null}
        </div>
        <ChevronDown
          className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-dr-muted transition ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          className={`space-y-3 border-t border-dr-border/40 ${
            nested ? "px-2.5 pb-2.5 pt-2" : "px-3 pb-3 pt-2"
          }`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
