"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Code2, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { API_NAV_GROUPS, API_V1_PREFIX } from "@/lib/api/docs-spec";

export function ApiNavMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const onDevelopersPage = pathname.startsWith("/developers");

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`dr-all-tools-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
          onDevelopersPage || open ? "dr-all-tools-btn-active" : ""
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Code2 className="h-3.5 w-3.5" aria-hidden />
        <span>API</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="dr-mega-menu absolute right-0 top-[calc(100%+0.5rem)] z-[60] w-[min(92vw,520px)] rounded-2xl border p-4 shadow-2xl">
          <div className="mb-3 flex items-start justify-between gap-3 border-b border-dr-border pb-3">
            <div>
              <p className="text-sm font-semibold text-zinc-100">yournewhandle API</p>
              <p className="mt-0.5 text-[11px] text-dr-muted">
                Generate handles &amp; check availability programmatically
              </p>
            </div>
            <Link
              href="/developers#plans"
              onClick={() => setOpen(false)}
              className="dr-badge-new shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide transition-opacity hover:opacity-90"
            >
              API Key
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {API_NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-dr-muted">
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="dr-mega-link block rounded-lg px-2 py-1.5 text-xs text-zinc-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-dr-border pt-3">
            <code className="truncate text-[10px] text-dr-muted">{API_V1_PREFIX}</code>
            <Link
              href="/developers"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 text-xs font-medium text-dr-blue-light hover:underline"
            >
              Full documentation
              <ExternalLink className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
