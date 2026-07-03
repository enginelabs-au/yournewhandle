"use client";

import type { GenerationParams } from "@/lib/types";
import {
  CONSONANT_OPTIONS,
  VOWEL_OPTIONS,
} from "@/lib/matrix-validation";
import {
  TextInputField,
  ToggleChip,
} from "@/components/ui/matrix-controls";

type CharFilterPanelProps = {
  params: GenerationParams;
  onChange: (patch: Partial<GenerationParams>) => void;
};

export function CharFilterPanel({ params, onChange }: CharFilterPanelProps) {
  const toggleVowel = (vowel: string) => {
    const set = new Set(params.allowedVowels);
    if (set.has(vowel)) {
      set.delete(vowel);
    } else {
      set.add(vowel);
    }
    onChange({ allowedVowels: [...set] });
  };

  const toggleBlockedConsonant = (consonant: string) => {
    const set = new Set(params.blockedConsonants);
    if (set.has(consonant)) {
      set.delete(consonant);
    } else {
      set.add(consonant);
    }
    onChange({ blockedConsonants: [...set] });
  };

  return (
    <div className="space-y-4 rounded-lg border border-dr-border bg-dr-panel-2/40 p-3">
        <div className="space-y-2">
          <span className="text-sm font-medium text-zinc-200">Allowed vowels</span>
          <div className="flex flex-wrap gap-1.5">
            {VOWEL_OPTIONS.map((vowel) => (
              <ToggleChip
                key={vowel}
                label={vowel}
                active={params.allowedVowels.includes(vowel)}
                onClick={() => toggleVowel(vowel)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-zinc-200">
            Blocked consonants
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CONSONANT_OPTIONS.map((consonant) => (
              <ToggleChip
                key={consonant}
                label={consonant}
                active={params.blockedConsonants.includes(consonant)}
                onClick={() => toggleBlockedConsonant(consonant)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextInputField
            id="prefix"
            label="Prefix lock"
            value={params.prefix}
            placeholder="zo"
            onChange={(prefix) =>
              onChange({ prefix: prefix.toLowerCase().replace(/[^a-z]/g, "") })
            }
          />
          <TextInputField
            id="suffix"
            label="Suffix lock"
            value={params.suffix}
            placeholder="ft"
            onChange={(suffix) =>
              onChange({ suffix: suffix.toLowerCase().replace(/[^a-z]/g, "") })
            }
          />
        </div>
    </div>
  );
}
