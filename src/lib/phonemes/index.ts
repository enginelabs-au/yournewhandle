import type { LanguageId, PhonemePool } from "@/lib/types";
import { LANGUAGE_IDS } from "@/lib/types";
import { englishPool } from "./english";
import { japanesePool } from "./japanese";
import { latinPool } from "./latin";
import { norsePool } from "./norse";

export { englishPool } from "./english";
export { norsePool } from "./norse";
export { latinPool } from "./latin";
export { japanesePool } from "./japanese";

export const phonemeRegistry: Record<LanguageId, PhonemePool> = {
  english: englishPool,
  norse: norsePool,
  latin: latinPool,
  japanese: japanesePool,
};

export { LANGUAGE_IDS };

export function getPool(id: LanguageId): PhonemePool {
  return phonemeRegistry[id];
}
