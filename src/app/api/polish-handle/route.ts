import { NextResponse } from "next/server";
import { runAiGeneration } from "@/lib/api/ai-generate";
import type { GenerationParams } from "@/lib/types";

export async function POST(request: Request) {
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

  if (!body.params) {
    return NextResponse.json(
      { error: "Generation settings are required." },
      { status: 400 },
    );
  }

  const result = await runAiGeneration({
    prompt: body.prompt ?? "",
    params: body.params,
    referenceHandle: body.referenceHandle,
    count: body.count,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const payload: { suggestions: string[]; source?: string } = {
    suggestions: result.suggestions,
  };
  if (result.source === "engine") {
    payload.source = "engine";
  }

  return NextResponse.json(payload);
}
