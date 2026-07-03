import { NextResponse } from "next/server";
import type { GenerationParams } from "@/lib/types";
import {
  buildGeminiSystemPrompt,
  buildGeminiUserPrompt,
} from "@/lib/engine/gemini-prompt";
import { resolveGenerationParams } from "@/lib/engine/resolve-params";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function handlePattern(minLen: number, maxLen: number): RegExp {
  const minBody = Math.max(1, minLen - 1);
  const maxBody = Math.max(minBody, maxLen - 1);
  return new RegExp(`^[a-z][a-z0-9]{${minBody},${maxBody}}$`);
}

function parseSuggestions(
  text: string,
  count: number,
  minLen: number,
  maxLen: number,
  prefix: string,
  suffix: string,
): string[] {
  const pattern = handlePattern(minLen, maxLen);
  const seen = new Set<string>();
  const results: string[] = [];

  for (const raw of text.split(/\n|,/)) {
    let line = raw.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (!line) {
      continue;
    }
    if (prefix && !line.startsWith(prefix.toLowerCase())) {
      line = prefix.toLowerCase() + line;
    }
    if (suffix && !line.endsWith(suffix.toLowerCase())) {
      line = line + suffix.toLowerCase();
    }
    if (
      pattern.test(line) &&
      line.length >= minLen &&
      line.length <= maxLen &&
      !seen.has(line)
    ) {
      seen.add(line);
      results.push(line);
    }
    if (results.length >= count) {
      break;
    }
  }

  return results;
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

  console.error("[polish-handle] Gemini API error:", code, apiMessage.slice(0, 300));

  return {
    message: "Could not reach the AI service. Try again shortly.",
    status: 502,
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI generation is temporarily unavailable." },
      { status: 503 },
    );
  }

  let body: {
    prompt?: string;
    params?: GenerationParams;
    referenceHandle?: string | null;
    count?: number;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const userPrompt = body.prompt?.trim();
  if (!userPrompt || userPrompt.length < 3) {
    return NextResponse.json(
      { error: "Describe what kind of handle you want (at least 3 characters)." },
      { status: 400 },
    );
  }

  if (!body.params) {
    return NextResponse.json(
      { error: "Generation settings are required." },
      { status: 400 },
    );
  }

  const params = resolveGenerationParams(body.params);
  const count = Math.min(
    params.batchSize,
    Math.max(3, Math.min(12, body.count ?? params.batchSize)),
  );
  const referenceHandle = body.referenceHandle?.trim().toLowerCase() || null;

  const systemInstruction = buildGeminiSystemPrompt(params);
  const userMessage = buildGeminiUserPrompt(
    userPrompt,
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
            temperature: 0.95,
            maxOutputTokens: 512,
          },
        }),
      },
    );
  } catch (error) {
    console.error("[polish-handle] Gemini fetch failed:", error);
    return NextResponse.json(
      { error: "Could not reach the AI service. Try again shortly." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    let errorBody: GeminiErrorBody = {};
    try {
      errorBody = (await response.json()) as GeminiErrorBody;
    } catch {
      // ignore parse failure
    }
    const mapped = mapGeminiError(errorBody);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const rawText =
    data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ??
    "";

  const suggestions = parseSuggestions(
    rawText,
    count,
    params.minLen,
    params.maxLen,
    params.prefix,
    params.suffix,
  );

  if (suggestions.length === 0) {
    return NextResponse.json(
      { error: "No valid handles returned. Try a different description." },
      { status: 502 },
    );
  }

  return NextResponse.json({ suggestions });
}
