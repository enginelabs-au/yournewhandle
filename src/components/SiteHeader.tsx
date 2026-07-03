import { Sparkles, Zap } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle/80 bg-base/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-cyan/30 bg-gradient-to-br from-accent-purple/20 to-accent-cyan/10 shadow-[0_0_12px_rgb(0_229_255_/_0.15)]"
            aria-hidden
          >
            <Zap className="h-4 w-4 text-accent-cyan" />
          </div>
          <div>
            <p className="font-mono text-sm font-bold tracking-tight text-zinc-50 sm:text-base">
              your<span className="gradient-text-subtle">newhandle</span>
            </p>
            <p className="hidden text-[10px] uppercase tracking-widest text-zinc-500 sm:block">
              Handle generator &amp; availability checker
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="rounded-full border border-accent-purple/30 bg-accent-purple/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-purple">
            Generator
          </span>
          <span className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-cyan">
            Checker
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle/60 bg-panel-elevated/50 px-2.5 py-0.5 text-[10px] text-zinc-500">
            <Sparkles className="h-3 w-3 text-accent-magenta" aria-hidden />
            RDAP + DNS
          </span>
        </div>
      </div>
    </header>
  );
}
