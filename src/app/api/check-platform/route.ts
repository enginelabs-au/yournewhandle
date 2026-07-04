import { NextResponse } from "next/server";
import { checkPlatformService } from "@/lib/api/check-service";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle")?.trim().toLowerCase();
  const service = searchParams.get("service");

  if (!handle || !service) {
    return NextResponse.json(
      { error: "Missing handle or service" },
      { status: 400 },
    );
  }

  const outcome = await checkPlatformService(handle, service);

  if ("error" in outcome) {
    return NextResponse.json({ error: outcome.error }, { status: outcome.status });
  }

  return NextResponse.json(
    { status: outcome.status, message: outcome.message },
    { headers: { "X-Cache": outcome.cached ? "HIT" : "MISS" } },
  );
}
