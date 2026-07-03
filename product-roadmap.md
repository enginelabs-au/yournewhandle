🛠️ System Specification: yournewhandle (The Aesthetic Identity Engine)

Role for AI Coding Agent: Act as a senior principal software engineer. Your task is to implement this complete frontend application precisely to these specifications.

🎯 1. Core Thesis & Brand Positioning

Existing username generators create high-entropy secure strings that look like unreadable passwords (e.g., x7#vP9_k) or generic, clumsy dictionary combinations (e.g., AuraTech_Base_2026).

yournewhandle is the aesthetic opposite. It is a curated, phonetic, and algorithmic identity tool built to generate readable, memorable, pronounceable handles that are instantly cross-checked for real-time availability across domains, emails, socials, and crypto namespaces. The primary concern is Linguistic Aesthetic - curated, phonetic, rhythmic generation that builds brand-new, pronounceable word-like handles. To stand out, you must double down on extreme customization and phonetic styling. Your moat is not the checking database (anyone can build a checker API); your moat is the Aesthetic Logic Engine.

Core Feature Blueprint (The Minimal Viable Moat):

The Pronunciation Filter (Syllable Engine): Instead of picking random characters, your engine constructs syllables using custom phonetic rules (Onset + Nucleus + Coda assembly) so the output always sounds like a real, memorable word (e.g., zoft, frin, keld).

Granular Constraint Controls: Allow users to set precise structural parameters:

Exact character length.

Allowed/blocked specific vowels or consonants.

Syllable count limits (e.g., "Must be exactly two syllables").

Prefix and suffix anchoring (e.g., "Must end with a soft consonant").

Simultaneous Cross-Checking: As candidates are generated, they are immediately cross-checked against standard TLD domains (.com, .ai) and core platform APIs (GitHub, X, Telegram) so the user only interacts with available assets.

Expand the Syllable Engine to include multi-syllable compound words (combining two short, phonetic pseudo-words, e.g., ZoftKeld).

Refine the CSS/UI to match a sleek, minimal, premium utility layout.

Integrate affiliate domain lookup parameters (like NameSilo or Namecheap API links) on the domain availability tabs. If a user likes a generated handle and buys the .com or .ai, you automatically receive a commission.

SEO Subtitle/H1 Formula:

yournewhandle // Generate memorable, pronounceable usernames that aren't taken.

---

## 1.1 Target User & Success Criteria (Pre-Planning)

| Dimension | Definition |
|-----------|------------|
| Primary user | Creators, indie hackers, and brand-namers who want a pronounceable handle before registering domains/socials |
| Secondary user | Creators exploring dictionary-style phrase handles (BIP-39 fusion) |
| MVP success | User generates ≥10 candidates in one session, clicks one, and sees checker results within 3s on broadband |
| Moat validation | ≥70% of generated phonetic outputs are user-rated "pronounceable" in informal testing (manual QA checklist) |
| Monetization (MVP) | Affiliate deep-links on available domains only; no payment processing in v1 |
| Out of scope (v1) | User accounts, saved presets sync, server-side generation, WHOIS API, Twitter/X live API, ENS/crypto namespace checks |

---

## 1.2 Locked Architecture Decisions ✅ (Confirmed 2026-06-23)

| Decision | Locked choice | Notes |
|----------|---------------|-------|
| Framework | **Next.js 14+ App Router** | Confirmed by stakeholder |
| State management | **React Context + `useReducer`** for generation params; local component state for checker results | — |
| Settings persistence | **`localStorage`** keyed `ynh:params:v1` | — |
| Generation location | **100% client-side Web Workers** for batch generation | — |
| Checker execution | **Client-side fetches** with concurrency cap | — |
| Dictionary source | **Curated inline word lists** (~500 roots + BIP-39 subset) | — |
| Affiliate registrar | **Namecheap only** | Env: `NEXT_PUBLIC_NAMECHEAP_AFF`; NameSilo deferred post-MVP |
| MVP language set | **English, Norse, Latin, Japanese** | Full phoneme pools in Phase 1 — not stubs |
| Batch size | **24** candidates per Generate | Max cap 50 if raised later via UI |

---

💻 2. Unified Tech Stack

Your coding agent must initialize and run the app with this modern, high-performance, client-side stack:

Framework: **Next.js 14+ (App Router)** with TypeScript. *(Locked — see §1.2.)*

Styling: Tailwind CSS (Dark Mode default, with a sleek, low-friction Cyberpunk/SaaS dashboard vibe).

Icons: Lucide-react.

Animations: Framer Motion (smooth, high-end transitions on generation loops).

DNS Resolution: Google Public DNS JSON API (for client-side CORS-friendly domain lookups).

### 2.1 Dependency Pin List (Phase 1)

| Package | Purpose |
|---------|---------|
| `next`, `react`, `react-dom`, `typescript` | Core framework |
| `tailwindcss`, `postcss`, `autoprefixer` | Styling |
| `framer-motion` | Card enter/exit, generate pulse |
| `lucide-react` | Icons |
| `@types/*` | TypeScript defs |

Optional Phase 4+: `zod` for param validation, `clsx` + `tailwind-merge` for class composition.

### 2.2 Design Tokens (Tailwind Extension)

| Token | Value | Usage |
|-------|-------|-------|
| `bg-base` | `#0a0a0f` | Page background |
| `bg-panel` | `#12121a` | Left/right panes |
| `border-subtle` | `#2a2a3a` | Panel dividers |
| `accent-cyan` | `#00e5ff` | Primary actions, available badges |
| `accent-magenta` | `#ff00aa` | Mode active state |
| `status-available` | `#22c55e` | Green checker |
| `status-taken` | `#ef4444` | Red checker |
| `status-unknown` | `#eab308` | Warning / manual verify |
| Font | `Inter` or `Geist Sans` | UI copy |
| Font mono | `JetBrains Mono` | Generated handles, console |

Dark mode only for MVP. No light-mode toggle in v1.

### 2.3 Proposed Directory Structure

```
src/
  app/
    layout.tsx          # Root layout, fonts, metadata
    page.tsx            # Dashboard (split-screen)
    globals.css
  components/
    matrix/             # Left pane controls
    inspector/          # Right pane results + checker
    ui/                 # Shared buttons, sliders, badges
  lib/
    engine/
      phonetic.ts       # CVC syllable engine
      dictionary.ts     # Word lists + hybrid weighting
      password.ts       # crypto.getRandomValues generator
      constraints.ts    # Length, prefix/suffix, filters
      compound.ts       # Multi-syllable compound assembler
    checker/
      domains.ts        # Google DNS A-record lookup
      socials.ts        # GitHub + format validators
      email.ts          # MX + Gravatar heuristic
      footprint.ts      # Search deep-link builder
      orchestrator.ts   # Parallel run + debounce
    phonemes/
      index.ts          # Pool registry
      english.ts
      norse.ts
      latin.ts
      japanese.ts       # Romaji pools
    types.ts
    storage.ts          # localStorage param persistence
  workers/
    generate.worker.ts  # Batch candidate generation
```

---

🎨 3. Sleek Dashboard Layout (UX Spec)

The dashboard operates on a balanced, single-page, split-screen layout designed to minimize user click-friction.

```
+---------------------------------------------------------------------------------+
|                                 YOURNEWHANDLE                                   |
+---------------------------------------+-----------------------------------------+
|                                       |                                         |
|  LEFT PANE: THE PARAMETER MATRIX      |  RIGHT PANE: EXECUTION & INSPECTOR      |
|                                       |                                         |
|  1. Mode Selection Toggles            |  1. Active Candidate Stack (Grid)       |
|     - Phonetic Word-Like              |     - Interactive selection cards       |
|     - Dict Fusion (BIP-39 style)      |                                         |
|                                       |     - Direct input checker              |
|  2. Advanced Granular Sliders         |                                         |
|     - Character Length Constraints    |  3. Multi-Threaded Check Console        |
|     - Entropy Percentage              |     - Socials (GitHub, Twitter, TG)     |
|     - Dictionary Word Weighting       |     - Domains (.com, .ai, .xyz)         |
|                                       |     - Email Address MX Checks           |
|  3. Language Fusion Panel             |                                         |
|     - English, Norse, Latin, etc.     |  4. Web Footprint Analyzer             |
|                                       |     - Google, DDG, GitHub Code links    |
|  4. Characters & Symbol Filters       |                                         |
+---------------------------------------+-----------------------------------------+
```

### 3.1 Layout & Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| `≥1024px` | 40/60 split: Matrix left, Inspector right |
| `768–1023px` | Stacked: Matrix collapses to accordion sections on top |
| `<768px` | Single column; sticky "Generate" FAB at bottom |

### 3.2 Component Inventory

| Component | Location | Behavior |
|-----------|----------|----------|
| `ModeToggleGroup` | Matrix §1 | Exclusive radio; switches engine + visible sliders |
| `LengthRangeSlider` | Matrix §2 | Dual-thumb or min/max inputs, 3–20, step 1 |
| `DictionaryWeightSlider` | Matrix §2 | 0–100%, visible in Dict Fusion + Phonetic hybrid |
| `SyllableCountControl` | Matrix §2 | Exact count (1–4) or range min/max |
| `LanguageFusionPanel` | Matrix §3 | Multi-select languages + weight per language (must sum to 100%) |
| `CharFilterPanel` | Matrix §4 | Allow/block vowels, consonants, symbols; prefix/suffix inputs |
| `GenerateButton` | Matrix footer | Triggers worker; disabled while generating |
| `CandidateGrid` | Inspector §1 | Responsive 2–4 col grid; default batch size **24** |
| `CandidateCard` | Inspector §1 | Handle text, copy btn, click → select + run checks |
| `InspectorInput` | Inspector §2 | Manual handle entry; same validation as generated |
| `CheckerPanel` | Inspector §3 | Tabbed or accordion: Domains / Socials / Email |
| `FootprintLinks` | Inspector §4 | External links open new tab |
| `CheckStatusBadge` | Shared | `available` \| `taken` \| `unknown` \| `verify` \| `loading` \| `error` |

### 3.3 Interaction Flow

1. User adjusts params → auto-save to `localStorage` (debounced 500ms).
2. User clicks **Generate** → worker returns N candidates → cards animate in (stagger 30ms).
3. User clicks a card → card highlights → orchestrator runs all checker threads in parallel.
4. Checker results stream into panel (each thread updates independently).
5. Available domain rows show **Register via Namecheap** affiliate button.

### 3.4 Empty & Loading States

| State | UI |
|-------|-----|
| No generation yet | Inspector shows ghost cards + hint: "Tune the matrix, then Generate" |
| Generating | Skeleton cards + pulsing accent on Generate btn |
| Checker running | Per-row spinner; partial results render as they arrive |
| All checks failed (network) | Yellow banner with Retry; individual row error tooltips |

---

⚙️ 4. Feature Specifications & Algorithmic Logic

A. Core Engine Mode 1: Phonetic "Word-Like" Synthesizer

Instead of picking raw random characters, this engine compiles readable words by mapping phonetic rules using the consonant-vowel-consonant (CVC) paradigm.

Phoneme Databases:

Onsets: b, c, d, f, g, h, j, k, l, m, n, p, r, s, t, v, w, y, z, ch, sh, th, pl, gr, cl, dr, fr, pr, sp, st, fl

Nuclei: a, e, i, o, u, ae, ea, io, ai, oo, ou

Codas: t, d, k, g, p, s, m, n, r, l, th, sh, ck, nt, nd

Language Selection & Fusion Logic: Allow users to choose languages (e.g., Norse, Latin, Japanese, English).

Agent Implementation: Map distinct phoneme pools to each language. For a 50% Norse / 50% Japanese fusion, alternate syllable assembly by grabbing an onset from the Norse pool (e.g., th, gr, sk) and a nucleus/coda from the Japanese pool (e.g., u, a, o, ki, to).

### 4.A.1 Syllable Assembly Algorithm (Detailed)

```
function buildSyllable(langPools, constraints):
  onset  = weightedRandom(langPools.onsets filtered by blocked chars)
  nucleus = weightedRandom(langPools.nuclei filtered by allowed vowels)
  coda   = weightedRandom(langPools.codas OR "" for open syllables)
  syllable = onset + nucleus + coda
  if syllable violates min/max per-syllable length: retry (max 10 attempts)
  return syllable

function buildWord(params):
  syllables = []
  for i in 0..targetSyllableCount-1:
    pool = selectPoolForSyllable(i, languageFusionWeights)  // round-robin by weight
    syllables.push(buildSyllable(pool, params))
  word = join(syllables)
  word = applyPrefixSuffix(params.prefix, params.suffix, word)
  word = fitToLengthRange(word, params.minLen, params.maxLen)  // see 4.A.4
  return word
```

**Open syllables:** 20% probability of empty coda (config constant `OPEN_SYLLABLE_RATE`).

**Soft consonant suffix constraint:** When enabled, force final coda ∈ `{l, n, m, r, s}`.

### 4.A.2 Language Phoneme Pools (Minimum Viable)

Each language file exports `{ onsets, nuclei, codas, digraphs? }`. MVP pools:

| Language | Onset flavor (examples) | Notes |
|----------|-------------------------|-------|
| English | Base spec list | Default pool |
| Norse | sk, th, gr, dr, fr, kn, hv | Favor consonant clusters |
| Latin | tr, cr, pr, cl, fl, sc | Classical feel; nuclei include `ae`, `oe` |
| Japanese | k, s, t, n, h, m, y, r, w + CV pairs (ka, shi, tsu) | Romaji; no `l` onsets |

**Fusion rule:** For weights `[Norse:50, Japanese:50]`, syllable index `i` uses language `i % 2` mapped to weighted order. For 3 languages at 40/30/30, use cumulative weight bands on `random()` per syllable.

### 4.A.3 Compound Word Mode (ZoftKeld)

| Param | Behavior |
|-------|----------|
| Trigger | Toggle "Compound" or auto when `syllableCount >= 2` and mode = Phonetic |
| Structure | `[PartA][PartB]` where each part is 1–2 syllables |
| Casing | TitleCase join for display; lowercase for DNS checks |
| Separator | None (default) or `-` if user enables "hyphenate compound" |

Algorithm: generate PartA and PartB independently with half the target char budget each, then concatenate and re-run `fitToLengthRange`.

### 4.A.4 Length Constraint Resolution

When assembled word length ∉ `[minLen, maxLen]`:

1. **Too long:** Drop final codas → drop final syllable → truncate last nucleus (in order; max 3 trim steps).
2. **Too short:** Append extra open syllable (onset+nucleus only) up to 2 times.
3. **Still invalid after 3 retries:** Discard candidate; do not surface to user.

For ticker mode (`minLen=3, maxLen=4`): bypass multi-syllable; use single CVC or CV; uppercase optional display flag.

### 4.A.5 Deduplication & Batch Generation

- Maintain `Set<string>` for current batch; reject duplicates.
- Worker generates until `batchSize` unique candidates or `maxAttempts = batchSize * 5`.
- Normalize to lowercase for dedup; display with user-selected casing preference (lower | Title | UPPER).

---

B. Core Engine Mode 2: Dictionary-Weighting & Word-Chain Fusion

This mode is optimized for generating combinations of real words or a precise blend of real words and synthesized phonetics.

Granular Variable Slider (Dictionary Weight): Range from 0% to 100%.

100% Dictionary: Yields pure BIP-39 style high-entropy phrase fusions (e.g., fridge-octopus-finite or leverage-tequila).

0% Dictionary: Yields pure synthesized phonetic pseudo-words (e.g., keld, zoft).

Hybrid (e.g., 30% Dictionary): Calculated by characters or components. If character length constraint is 10 characters, 3 characters (30%) are selected from a real root dictionary (e.g., cat, run, neo), while the remaining 7 characters are generated via the phonetic synthesizer (e.g., catfrinkle).

### 4.B.1 Dictionary Weight Semantics (Clarified)

| Weight | Output pattern | Algorithm |
|--------|----------------|-----------|
| 100% | `word-word-word` or `wordwordword` | Pick 2–3 roots from dictionary; join with `-` if total len > 12 |
| 0% | Pure phonetic | Delegate to Mode 1 engine |
| 1–99% hybrid | **Character-budget split** | `dictChars = floor(targetLen * weight/100)`; pick root(s) whose combined length ≤ dictChars; fill remainder with phonetic synthesizer; merge without spaces |

**Dictionary tiers:**

- `roots-short.txt`: 1–4 char roots (~200 words: cat, neo, run, flux, …)
- `roots-medium.txt`: 5–8 chars (~300 words)
- `bip39-subset.json`: 256 curated BIP-39 words for phrase mode (not full 2048 for bundle size)

**Phrase mode (100%):** Sample 2–3 words; shuffle order; hyphenate if `entropy > 50%` slider (maps to word count 3 vs 2).

---

C. ~~Core Engine Mode 3: Password Generator~~ *(removed — product pivot: handles/usernames only)*

---

D. Advanced Constraint Metrics (The Ticker Tuner)

Allows users to clamp output sizes to absolute bounds:

Length Slider Constraints: Step interval of 1, min 3, max 20. Setting a range of 3 to 4 triggers optimization for crypto-style tickers (e.g., $ZOFT, $ALU).

Symbol/Anchor Locks: Allow users to set a mandatory starting character (prefix) or ending character (suffix) that the generator must respect during processing.

### 4.D.1 Constraint Application Order

1. Prefix lock (must start with)
2. Suffix lock (must end with)
3. Allowed/blocked character filter (applied per phoneme pick)
4. Length min/max
5. Syllable count

**Conflict handling:** If prefix + suffix + minLen impossible, show inline Matrix error: "Constraints unsatisfiable" and disable Generate.

---

### 4.E Shared Type Definitions

```typescript
type GenerationMode = "phonetic" | "dictionary";

type CheckStatus = "idle" | "loading" | "available" | "taken" | "unknown" | "verify" | "error";

interface GenerationParams {
  mode: GenerationMode;
  minLen: number;
  maxLen: number;
  syllableCount: { min: number; max: number }; // exact when min === max
  dictionaryWeight: number; // 0-100
  entropy: number; // 0-100, affects phrase word count
  languageWeights: Record<LanguageId, number>; // sum 100
  compound: boolean;
  prefix: string;
  suffix: string;
  allowedVowels: string[];
  blockedConsonants: string[];
  batchSize: number; // default 24
  casing: "lower" | "title" | "upper";
}

interface Candidate {
  id: string;
  handle: string;
  normalized: string; // lowercase for checks
  mode: GenerationMode;
}

interface CheckerResult {
  target: string;
  status: CheckStatus;
  message?: string;
  deepLink?: string;
  checkedAt?: number;
}
```

---

🔍 5. Real-Time Checker Suite (Multi-Threaded Validation)

When a candidate handle is clicked (or manually typed in the Inspector console), the system triggers three distinct checking threads.

Thread 1: Domain Registry DNS Resolution

Target TLDs: .com, .ai, .xyz (Customizable).

Agent Fetch Strategy: Since client-side code cannot query raw Port 43 WHOIS servers due to CORS blocks, perform an async fetch() to the public Google DNS JSON API:
https://dns.google/resolve?name=${name}.${tld}&type=A

If the DNS API returns a status of 3 (NXDomain), mark the domain as Available (green indicator).

If it returns a status of 0 with active answers, mark it as Taken (red indicator).

Any other status returns a warning/inquire badge linked to a registrar lookup deep link.

Thread 2: Social & Web3 Platform Namespaces

GitHub: Perform a direct API call: https://api.github.com/users/${name}. Status 404 indicates Available.

Twitter (X): Since Twitter blocks direct queries, validate using string length rules (4 to 15 characters, alphanumeric and underscores only). If valid, show a "Deep-link verification required" badge pointing directly to https://x.com/${name}.

Telegram: Check string constraints (minimum 5 characters, no symbols except underscores). Provide deep-link verification pointing to https://t.me/${name}.

Thread 3: Email Address MX Validation

Mechanism: Check if the handle is valid for standard corporate or personal email creation (e.g., handle@gmail.com or hello@handle.com).

Agent Query Strategy: Use the DNS JSON API to verify if the domain for the target email host has valid MX (Mail Exchanger) records configured, alongside checking Gravatar API availability checks to flag if the address is globally registered.

### 5.1 Checker Orchestrator Spec

```
onCandidateSelect(handle):
  cancel prior AbortController
  debounce 300ms
  parallel limit = 6 concurrent fetches

  run Thread1 (domains) — one fetch per TLD, parallel
  run Thread2 (socials) — GitHub fetch + format validators
  run Thread3 (email) — see 5.4
  run Footprint — sync link builder, no fetch
```

### 5.2 Domain Checker — Edge Cases & Limits

| Scenario | Status | UI |
|----------|--------|-----|
| DNS Status 3 (NXDOMAIN) | `available` | Green + affiliate CTA |
| DNS Status 0 + Answer | `taken` | Red |
| DNS Status 0, no Answer | `unknown` | Yellow + registrar link |
| HTTP error / timeout (5s) | `error` | Retry icon |
| Invalid hostname chars | `error` | Inline validation message |

**Important limitation (document in UI tooltip):** NXDOMAIN ≠ guaranteed registrable. Registry reserved names, premium tiers, and TLD-specific rules are not detected. Label as "Likely available (DNS)".

**Custom TLD UI:** Settings chip row in Checker panel; user toggles from preset list `[.com, .ai, .xyz, .dev, .io]`; max 5 active.

**Affiliate link template (Namecheap — locked):**

```
https://www.namecheap.com/domains/registration/results/?domain={handle}.{tld}&aff={NEXT_PUBLIC_NAMECHEAP_AFF}
```

Store affiliate ID in `NEXT_PUBLIC_NAMECHEAP_AFF` (Vercel env at deploy).

### 5.3 Social Checker — Detailed

| Platform | Live check? | Validation rules | Available | Taken | Verify |
|----------|-------------|------------------|-----------|-------|--------|
| GitHub | Yes (REST) | `[a-zA-Z0-9-]`, 1–39 chars, no leading/trailing `-` | 404 | 200 | 403 rate limit |
| X (Twitter) | No | `^[a-zA-Z0-9_]{4,15}$` | — | — | Always → deep link |
| Telegram | No | `^[a-zA-Z][a-zA-Z0-9_]{4,31}$` | — | — | Always → deep link |

**GitHub rate limit:** Unauthenticated 60 req/hr/IP. Mitigation: cache `{handle: result}` in session memory for 10 min; show remaining quota in dev console only.

### 5.4 Email Checker — Corrected Logic

Email checks are **not** about whether `handle@gmail.com` exists (impossible client-side without Google API). Split into two rows:

| Row | What it checks | Method |
|-----|----------------|--------|
| `{handle}@gmail.com` | Gravatar heuristic | `GET https://www.gravatar.com/avatar/{md5(email)}?d=404` — 404 ⇒ likely unused; 200 ⇒ in use |
| `{handle}@{handle}.com` | MX on owned domain | Only meaningful if `{handle}.com` DNS available; if domain taken, show "N/A — domain taken" |
| `hello@{handle}.com` | Same MX check | Requires user owns domain; show verify badge |

**MX fetch:** `https://dns.google/resolve?name={domain}&type=MX` — answers present ⇒ mail configured on domain (for owned-domain row).

### 5.5 Web Footprint Analyzer (Inspector §4)

Build URLs only; no scraping:

| Link | URL pattern |
|------|-------------|
| Google | `https://www.google.com/search?q="{handle}"` |
| DuckDuckGo | `https://duckduckgo.com/?q="{handle}"` |
| GitHub Code | `https://github.com/search?q={handle}&type=code` |

---

🚀 6. Agent Implementation Roadmap

### Phase 0: Planning Gate ✅ Complete

- [x] Framework: **Next.js App Router**
- [x] Affiliate: **Namecheap** (`NEXT_PUBLIC_NAMECHEAP_AFF`)
- [x] Languages: **English, Norse, Latin, Japanese** (full pools)
- [x] Batch size: **24** per Generate
- [ ] Review checker limitation copy with stakeholder *(optional before launch; copy drafted in §5.2)*

---

### Phase 1: Environment Initialization & Setup

- [x] `create-next-app` with TypeScript, Tailwind, App Router, `src/` dir
- [x] Configure Tailwind theme tokens (§2.2)
- [x] Add fonts (Geist or Inter + JetBrains Mono)
- [x] Set up base layout: metadata, SEO H1/subtitle (§1)
- [x] Create directory scaffold (§2.3)
- [x] Add `lib/types.ts` with core interfaces (§4.E)
- [x] Populate full phoneme pool files: English, Norse, Latin, Japanese (§4.A.2)
- [x] Add `lib/storage.ts` with param load/save
- [x] **Verify:** `npm run dev` renders empty split-screen shell

---

### Phase 2: Logic Core (Algorithms)

#### 2a — Phonetic Engine

- [x] `buildSyllable()` with onset/nucleus/coda + open syllable rate
- [x] `buildWord()` with syllable count + language fusion
- [x] `fitToLengthRange()` trim/pad logic (§4.A.4)
- [x] Prefix/suffix + char filter integration (§4.D.1)
- [x] `compound.ts` PartA/PartB merge (§4.A.3)
- [ ] Unit-test vectors: fixed seed tests for reproducibility (optional `seedrandom` dev-only)

#### 2b — Dictionary Engine

- [x] Bundle word lists (§4.B.1)
- [x] 100% phrase mode with entropy-driven word count
- [x] Hybrid character-budget merge
- [x] Fallback to phonetic when dictionary fill impossible

#### 2c — Password Engine *(removed — product pivot: handles/usernames only)*

- [x] ~~Charset builder~~ — **cancelled**
- [x] ~~Symbol whitelist~~ — **cancelled**
- [x] ~~Ambiguous char toggle~~ — **cancelled**

#### 2d — Generation Worker

- [x] `generate.worker.ts` batch loop with dedup (§4.A.5)
- [x] Main thread hook `useGenerateCandidates()`
- [x] **Verify:** Generate 24 unique handles across phonetic + dictionary modes

---

### Phase 3: Parameter Matrix UI

- [x] `ModeToggleGroup` with conditional slider visibility
- [x] Length range slider (3–20)
- [x] Syllable count control
- [x] Dictionary weight + entropy sliders
- [x] Language fusion panel with weight sum validation (=100%)
- [x] Char filter: vowel/consonant toggles, prefix/suffix inputs
- [x] Constraint conflict detector → inline error (§4.D.1)
- [x] Wire all controls to `GenerationParams` + localStorage
- [x] **Verify:** Refresh preserves settings; invalid constraints block Generate

---

### Phase 4: Inspector & Checker Console

#### 4a — Results UI

- [x] `CandidateGrid` + `CandidateCard` with Framer Motion stagger
- [x] Copy-to-clipboard on card action
- [x] `InspectorInput` for manual handle entry
- [x] Selected candidate highlight state

#### 4b — Checker Backend (Client)

- [x] `domains.ts` — Google DNS A-record per TLD
- [x] `socials.ts` — GitHub 404 + format validators
- [x] `email.ts` — Gravatar + MX logic (§5.4)
- [x] `footprint.ts` — link builder
- [x] `orchestrator.ts` — abort, debounce, concurrency cap (§5.1)
- [x] Session cache for GitHub results

#### 4c — Checker UI

- [x] `CheckerPanel` tabs with `CheckStatusBadge` per row
- [x] Affiliate CTAs on available domains (§5.2)
- [x] Tooltip for DNS limitation
- [x] TLD customization chips
- [x] Footprint link row
- [x] **Verify:** Select handle → all threads populate; cancel on rapid re-select

---

### Phase 5: Production Hardening

- [x] Responsive pass (§3.1): tablet + mobile accordion
- [x] Accessibility: keyboard nav for grid, ARIA on badges, focus rings
- [x] Error boundary on checker failures
- [x] `robots.txt`, `sitemap.xml`, Open Graph meta
- [x] Performance: lazy-load Framer Motion; worker code split
- [x] Rate-limit UX: friendly message when GitHub returns 403
- [x] Analytics hook placeholder (optional `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`)
- [x] Deploy to Vercel; set affiliate env vars *(affiliate ID: set in Vercel dashboard when ready)*
- [ ] **Verify:** Lighthouse mobile ≥85 performance; manual QA checklist (§7)

---

## 7. MVP QA Checklist

| # | Test | Expected |
|---|------|----------|
| 1 | Phonetic gen, 2 syllables, len 5–8 | All outputs pronounceable (manual) |
| 2 | Norse/JP 50/50 fusion | Alternating pool flavor visible |
| 3 | Dict hybrid 30% @ len 10 | ~3 dict chars + phonetic fill |
| 4 | Prefix `zo` lock | All handles start with `zo` |
| 5 | Ticker mode 3–4 | Short uppercase-friendly outputs |
| 6 | Domain check available name | Green badge + affiliate link |
| 7 | Domain check google.com | Red taken |
| 8 | GitHub check | 404/200 correctly mapped |
| 9 | Settings persist | Reload restores sliders |
| 10 | Mobile 375px | Usable single-column layout |

---

## 8. Known Limitations & Future Phases (Post-MVP)

| Limitation | v1 handling | Future |
|------------|-------------|--------|
| DNS ≠ WHOIS | Tooltip + "Likely available" | Server-side WHOIS proxy |
| X/TG no live API | Deep-link verify badge | Third-party API or scrape proxy |
| GitHub rate limit | Session cache | Authenticated proxy |
| No user accounts | localStorage only | Presets cloud sync |
| No crypto/ENS | Out of scope | Phase 6 namespace thread |
| BIP-39 full 2048 | 256-word subset | Full wordlist bundle |

---

## 9. Phase Summary (Original Checklist — Superseded by §6)

Phase 1: Environment Initialization & Setup — see §6 Phase 1

Phase 2: Complete the Logic Core — see §6 Phase 2

Phase 3: Build the Parameter Matrix UI — see §6 Phase 3

Phase 4: Build the Inspector & Checker Console — see §6 Phase 4

Phase 5: Production Hardening — see §6 Phase 5
