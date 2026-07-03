"use client";

import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { Candidate } from "@/lib/types";

type CandidateCardProps = {
  candidate: Candidate;
  selected: boolean;
  onSelect: (candidate: Candidate) => void;
  index: number;
};

export function CandidateCard({
  candidate,
  selected,
  onSelect,
  index,
}: CandidateCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(candidate.handle);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      className={`gen-candidate-card group flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 transition ${
        selected ? "gen-candidate-card-selected" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(candidate)}
        className={`min-w-0 flex-1 truncate text-left font-mono text-sm ${
          selected ? "gen-candidate-text-selected" : "text-zinc-200"
        }`}
      >
        {candidate.handle}
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className="btn-neon-copy inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5"
        aria-label={`Copy ${candidate.handle}`}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-status-available" aria-hidden />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" aria-hidden />
            Copy
          </>
        )}
      </button>
    </motion.div>
  );
}
