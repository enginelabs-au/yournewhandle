import { NextResponse } from "next/server";
import { runAiGeneration } from "@/lib/api/ai-generate";
import {
  authenticateApiRequest,
  withRateLimitHeaders,
} from "@/lib/api/auth";
import { parseGenerationBody } from "@/lib/api/parse-generation-body";

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  if (!auth.limits.allowAiGenerate) {
    return NextResponse.json(
      {
        error: {
          code: "plan_forbidden",
          message: "AI generation requires a Pro or Enterprise plan.",
        },
      },
      { status: 403 },
    );
  }

  let body: {
    prompt?: string;
    referenceHandle?: string | null;
    count?: number;
    [key: string]: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Invalid JSON body." } },
      { status: 400 },
    );
  }

  const parsed = parseGenerationBody(body, auth.limits.maxGenerateBatch);
  if ("error" in parsed) {
    return NextResponse.json(
      { error: { code: "invalid_request", message: parsed.error } },
      { status: 400 },
    );
  }

  const result = await runAiGeneration({
    prompt: body.prompt ?? "",
    params: parsed,
    referenceHandle: body.referenceHandle,
    count: body.count,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: { code: "upstream_error", message: result.error } },
      { status: result.status },
    );
  }

  const response = NextResponse.json({
    count: result.suggestions.length,
    suggestions: result.suggestions,
    source: result.source,
  });

  return withRateLimitHeaders(response, auth.rateLimit);
}
