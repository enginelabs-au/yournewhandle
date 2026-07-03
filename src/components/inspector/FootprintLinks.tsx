"use client";

import type { FootprintLink } from "@/lib/checker/footprint";
import { ExternalLink } from "lucide-react";

type FootprintLinksProps = {
  links: FootprintLink[];
};

export function FootprintLinks({ links }: FootprintLinksProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle/60 bg-panel-elevated/40 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-accent-blue/40 hover:text-accent-blue hover:shadow-[0_0_8px_rgb(88_166_255_/_0.1)]"
        >
          {link.label}
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      ))}
    </div>
  );
}
