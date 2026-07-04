import { NextResponse } from "next/server";
import {
  authenticateApiRequest,
  withRateLimitHeaders,
} from "@/lib/api/auth";
import { parseGenerationBody } from "@/lib/api/parse-generation-body";
import { generateBatch } from "@/lib/engine/generate";
import { platformLengthConflict } from "@/lib/engine/resolve-params";

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
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

  const conflict = platformLengthConflict(parsed);
  if (conflict) {
    return NextResponse.json(
      { error: { code: "invalid_request", message: conflict } },
      { status: 400 },
    );
  }

  const handles = generateBatch(parsed);

  const response = NextResponse.json({
    count: handles.length,
    handles: handles.map((candidate) => ({
      handle: candidate.handle,
      normalized: candidate.normalized,
      mode: candidate.mode,
    })),
  });

  return withRateLimitHeaders(response, auth.rateLimit);
}
