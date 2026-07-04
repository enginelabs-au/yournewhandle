import type { GenerationParams } from "@/lib/types";
import { generateBatch } from "@/lib/engine/generate";
import {
  buildGeminiSystemPrompt,
  buildGeminiUserPrompt,
} from "@/lib/engine/gemini-prompt";
import { resolveGenerationParams } from "@/lib/engine/resolve-params";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export type AiGenerateInput = {
  prompt: string;
  params: GenerationParams;
  referenceHandle?: string | null;
  count?: number;
};

export type AiGenerateResult =
  | { ok: true; suggestions: string[]; source: "gemini" | "engine" }
  | { ok: false; error: string; status: number };

function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function unwrapModelText(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:[\w-]*\n)?([\s\S]*?)```/);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return trimmed;
}

function stripLineDecorators(line: string): string {
  return line
    .trim()
    .replace(/^[\s>*#]+/, "")
    .replace(/^\d+[\.\)\:\-]\s*/, "")
    .replace(/^[-*•]+\s*/, "")
    .trim();
}

function normalizeHandleToken(raw: string): string {
  return raw.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function isValidHandle(
  handle: string,
  minLen: number,
  maxLen: number,
): boolean {
  if (handle.length < minLen || handle.length > maxLen) {
    return false;
  }
  return /^[a-z][a-z0-9]*$/.test(handle);
}

function applyAffixes(
  handle: string,
  prefix: string,
  suffix: string,
): string {
  let result = handle;
  if (prefix && !result.startsWith(prefix.toLowerCase())) {
    result = prefix.toLowerCase() + result;
  }
  if (suffix && !result.endsWith(suffix.toLowerCase())) {
    result = result + suffix.toLowerCase();
  }
  return result;
}

function extractHandleCandidates(text: string, minLen: number, maxLen: number): string[] {
  const unwrapped = unwrapModelText(text);
  const candidates: string[] = [];
  const seen = new Set<string>();

  const push = (token: string) => {
    const normalized = normalizeHandleToken(token);
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    candidates.push(normalized);
  };

  for (const rawLine of unwrapped.split(/\n/)) {
    const line = stripLineDecorators(rawLine);
    if (!line || /^here are|^output|^handles|^suggestions?/i.test(line)) {
      continue;
    }

    for (const part of line.split(/[,;|]/)) {
      const cleaned = stripLineDecorators(part);
      if (cleaned) {
        push(cleaned);
      }
    }
  }

  const minBody = Math.max(0, minLen - 1);
  const maxBody = Math.max(minBody, maxLen - 1);
  const scanPattern = new RegExp(
    `[a-z][a-z0-9]{${minBody},${maxBody}}`,
    "gi",
  );
  for (const match of unwrapped.matchAll(scanPattern)) {
    push(match[0]!);
  }

  return candidates;
}

function parseSuggestions(
  text: string,
  count: number,
  minLen: number,
  maxLen: number,
  prefix: string,
  suffix: string,
): string[] {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const candidate of extractHandleCandidates(text, minLen, maxLen)) {
    const handle = applyAffixes(candidate, prefix, suffix);

    if (!isValidHandle(handle, minLen, maxLen) || seen.has(handle)) {
      continue;
    }

    seen.add(handle);
    results.push(handle);

    if (results.length >= count) {
      break;
    }
  }

  return results;
}

function fallbackSuggestions(params: GenerationParams, count: number): string[] {
  return generateBatch({
    ...params,
    batchSize: count,
    seed: `ai-fallback-${Date.now()}`,
  })
    .map((candidate) => candidate.normalized)
    .slice(0, count);
}

type GeminiErrorBody = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

function mapGeminiError(body: GeminiErrorBody): { message: string; status: number } {
  const code = body.error?.code;
  const apiMessage = body.error?.message ?? "";

  if (code === 429 || body.error?.status === "RESOURCE_EXHAUSTED") {
    return {
      message:
        "AI rate limit reached. Wait a minute and try again, or check your Gemini API quota.",
      status: 429,
    };
  }

  if (code === 401 || code === 403) {
    return {
      message: "AI generation is temporarily unavailable.",
      status: 503,
    };
  }

  if (code === 404) {
    return {
      message: "AI model unavailable. Try again shortly.",
      status: 503,
    };
  }

  if (code === 503 || code === 500) {
    return {
      message: "The AI service is busy. Try again in a few seconds.",
      status: 503,
    };
  }

  console.error("[ai-generate] Gemini API error:", code, apiMessage.slice(0, 300));

  return {
    message: "Could not reach the AI service. Try again shortly.",
    status: 502,
  };
}

export async function runAiGeneration(input: AiGenerateInput): Promise<AiGenerateResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "AI generation is temporarily unavailable.",
      status: 503,
    };
  }

  const userPrompt = input.prompt.trim();
  if (userPrompt.length < 3) {
    return {
      ok: false,
      error: "Describe what kind of handle you want (at least 3 characters).",
      status: 400,
    };
  }

  const params = resolveGenerationParams(input.params);
  const count = Math.min(
    params.batchSize,
    Math.max(3, Math.min(12, input.count ?? params.batchSize)),
  );
  const referenceHandle = input.referenceHandle?.trim().toLowerCase() || null;

  const systemInstruction = buildGeminiSystemPrompt(params);
  const userMessage = buildGeminiUserPrompt(
    userPrompt,
    params,
    referenceHandle,
    count,
  );

  const model = geminiModel();
  let response: Response;

  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1024,
          },
        }),
      },
    );
  } catch (error) {
    console.error("[ai-generate] Gemini fetch failed:", error);
    return {
      ok: false,
      error: "Could not reach the AI service. Try again shortly.",
      status: 502,
    };
  }

  if (!response.ok) {
    let errorBody: GeminiErrorBody = {};
    try {
      errorBody = (await response.json()) as GeminiErrorBody;
    } catch {
      // ignore parse failure
    }
    const mapped = mapGeminiError(errorBody);
    return { ok: false, error: mapped.message, status: mapped.status };
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    promptFeedback?: { blockReason?: string };
  };

  const rawText =
    data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ??
    "";

  if (!rawText.trim()) {
    const fallback = fallbackSuggestions(params, count);
    if (fallback.length > 0) {
      return { ok: true, suggestions: fallback, source: "engine" };
    }

    return {
      ok: false,
      error: "The AI returned no text. Try a different description.",
      status: 502,
    };
  }

  let suggestions = parseSuggestions(
    rawText,
    count,
    params.minLen,
    params.maxLen,
    params.prefix,
    params.suffix,
  );

  if (suggestions.length === 0) {
    suggestions = fallbackSuggestions(params, count);
    if (suggestions.length > 0) {
      return { ok: true, suggestions, source: "engine" };
    }

    return {
      ok: false,
      error: "No valid handles returned. Try a different description.",
      status: 502,
    };
  }

  return { ok: true, suggestions, source: "gemini" };
}
