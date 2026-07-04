import { NextResponse } from "next/server";
import { API_DOC_ENDPOINTS, API_VERSION } from "@/lib/api/docs-spec";
import { isApiEnabled } from "@/lib/api/keys";
import { PLATFORM_COUNT } from "@/lib/platforms-registry";

export async function GET() {
  return NextResponse.json({
    name: "yournewhandle API",
    version: API_VERSION,
    platformCount: PLATFORM_COUNT,
    documentation: "/developers",
    endpoints: API_DOC_ENDPOINTS.map((endpoint) => ({
      method: endpoint.method,
      path: endpoint.path,
      title: endpoint.title,
      auth: endpoint.auth,
    })),
    apiEnabled: isApiEnabled(),
  });
}
