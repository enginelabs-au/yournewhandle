import { PLATFORM_COUNT } from "@/lib/platforms-registry";

export const API_VERSION = "1.0.0";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://yournewhandle.com";

export const API_V1_PREFIX = `${API_BASE_URL}/api/v1`;

export type ApiDocSection = {
  id: string;
  title: string;
  description?: string;
};

export type ApiDocEndpoint = {
  id: string;
  sectionId: string;
  method: "GET" | "POST";
  path: string;
  title: string;
  summary: string;
  auth: boolean;
  requestBody?: string;
  responseBody: string;
  curl: string;
  notes?: string[];
};

export const API_DOC_SECTIONS: ApiDocSection[] = [
  {
    id: "overview",
    title: "Overview",
    description:
      "Programmatic access to yournewhandle generation and username availability checks across social platforms.",
  },
  {
    id: "authentication",
    title: "Authentication",
    description: "All paid endpoints require a Bearer API key in the Authorization header.",
  },
  {
    id: "plans",
    title: "Plans & limits",
    description:
      "Subscribe via Stripe Checkout to receive your API key. Starter, Pro, and Enterprise tiers with per-minute and daily quotas.",
  },
  {
    id: "rate-limits",
    title: "Rate limits",
    description: "Quota headers on every authenticated response.",
  },
  {
    id: "errors",
    title: "Errors",
    description: "Structured error payloads with machine-readable codes.",
  },
  {
    id: "endpoints",
    title: "Endpoints",
    description: "REST JSON API under /api/v1.",
  },
];

export const API_DOC_ENDPOINTS: ApiDocEndpoint[] = [
  {
    id: "info",
    sectionId: "endpoints",
    method: "GET",
    path: "/api/v1",
    title: "API info",
    summary: "Public metadata — version, platform count, documentation links.",
    auth: false,
    responseBody: `{
  "name": "yournewhandle API",
  "version": "${API_VERSION}",
  "platformCount": ${PLATFORM_COUNT},
  "documentation": "${API_BASE_URL}/developers",
  "authenticated": false
}`,
    curl: `curl -s ${API_V1_PREFIX}`,
  },
  {
    id: "account",
    sectionId: "endpoints",
    method: "GET",
    path: "/api/v1/account",
    title: "Account & usage",
    summary: "Returns your plan, label, and current rate-limit consumption.",
    auth: true,
    responseBody: `{
  "key": { "id": "ynh_live…abcd", "label": "Production", "plan": "pro" },
  "limits": {
    "requestsPerMinute": 120,
    "requestsPerDay": 25000,
    "maxBatchHandles": 20,
    "maxBatchPlatforms": 400,
    "allowDeepCheck": true,
    "allowAiGenerate": true,
    "maxGenerateBatch": 48
  },
  "usage": {
    "minuteUsed": 4,
    "dayUsed": 182,
    "tracking": "redis"
  }
}`,
    curl: `curl -s ${API_V1_PREFIX}/account \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  },
  {
    id: "platforms",
    sectionId: "endpoints",
    method: "GET",
    path: "/api/v1/platforms",
    title: "List platforms",
    summary: `Returns all ${PLATFORM_COUNT} wired platforms with ids, categories, and nick-checkr service names.`,
    auth: true,
    responseBody: `{
  "count": ${PLATFORM_COUNT},
  "platforms": [
    {
      "id": "instagram",
      "name": "Instagram",
      "category": "Popular",
      "service": "Instagram",
      "wired": true,
      "minLength": 1,
      "maxLength": 30
    }
  ]
}`,
    curl: `curl -s ${API_V1_PREFIX}/platforms \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  },
  {
    id: "generate",
    sectionId: "endpoints",
    method: "POST",
    path: "/api/v1/generate",
    title: "Generate handles",
    summary:
      "Phonetic and dictionary engine — same parameters as the web studio matrix.",
    auth: true,
    requestBody: `{
  "minLen": 4,
  "maxLen": 12,
  "batchSize": 12,
  "dictionaryWeight": 85,
  "compound": true,
  "mode": "phonetic",
  "seed": "optional-reproducible-seed"
}`,
    responseBody: `{
  "count": 12,
  "handles": [
    { "handle": "velocraft", "normalized": "velocraft", "mode": "phonetic" }
  ]
}`,
    curl: `curl -s -X POST ${API_V1_PREFIX}/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"minLen":4,"maxLen":10,"batchSize":6,"compound":true}'`,
    notes: [
      "Accepts any GenerationParams field from the web app (languageWeights, blueprint, affixTier, etc.).",
      "batchSize is capped by your plan's maxGenerateBatch.",
    ],
  },
  {
    id: "check",
    sectionId: "endpoints",
    method: "POST",
    path: "/api/v1/check",
    title: "Check one platform",
    summary: "Check username availability on a single platform by service name or platform id.",
    auth: true,
    requestBody: `{
  "handle": "velocraft",
  "platformId": "instagram"
}`,
    responseBody: `{
  "handle": "velocraft",
  "platformId": "instagram",
  "service": "Instagram",
  "status": "available",
  "message": "Username available",
  "profileUrl": "https://instagram.com/velocraft",
  "cached": false
}`,
    curl: `curl -s -X POST ${API_V1_PREFIX}/check \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"handle":"velocraft","platformId":"instagram"}'`,
    notes: [
      "Use platformId from GET /platforms, or pass service directly (NickCheckr service name).",
      "status is one of: available, taken, unknown, error.",
    ],
  },
  {
    id: "check-batch",
    sectionId: "endpoints",
    method: "POST",
    path: "/api/v1/check/batch",
    title: "Batch check",
    summary: "Check multiple handles across many platforms in one request.",
    auth: true,
    requestBody: `{
  "handles": ["velocraft", "neonforge"],
  "mode": "light",
  "platformIds": ["instagram", "github", "tiktok"]
}`,
    responseBody: `{
  "mode": "light",
  "handleCount": 2,
  "platformCount": 3,
  "results": [
    {
      "handle": "velocraft",
      "platformId": "instagram",
      "status": "available",
      "message": "Username available"
    }
  ]
}`,
    curl: `curl -s -X POST ${API_V1_PREFIX}/check/batch \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"handles":["velocraft"],"mode":"light"}'`,
    notes: [
      "mode: light (top 50 popular) or deep (full catalog). Deep requires Pro or Enterprise.",
      "Omit platformIds to check all platforms in the selected mode.",
    ],
  },
  {
    id: "ai-generate",
    sectionId: "endpoints",
    method: "POST",
    path: "/api/v1/ai/generate",
    title: "AI generate",
    summary: "Natural-language handle suggestions powered by Gemini with engine fallback.",
    auth: true,
    requestBody: `{
  "prompt": "short futuristic creator handle, easy to say",
  "referenceHandle": "velocraft",
  "count": 8,
  "minLen": 4,
  "maxLen": 14
}`,
    responseBody: `{
  "count": 8,
  "suggestions": ["novastream", "pulseforge"],
  "source": "gemini"
}`,
    curl: `curl -s -X POST ${API_V1_PREFIX}/ai/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"futuristic gaming handle","count":6,"minLen":4,"maxLen":12}'`,
    notes: ["Requires Pro or Enterprise plan.", "source is gemini or engine when AI output is empty."],
  },
];

export const API_ERROR_CODES = [
  { code: "unauthorized", status: 401, description: "Missing or invalid API key." },
  { code: "api_disabled", status: 503, description: "No API keys configured on this deployment." },
  { code: "rate_limit_exceeded", status: 429, description: "Minute or daily quota exhausted." },
  { code: "plan_forbidden", status: 403, description: "Feature not included in your plan." },
  { code: "invalid_request", status: 400, description: "Malformed JSON or validation failure." },
];

export const API_NAV_GROUPS = [
  {
    title: "Getting started",
    links: [
      { label: "Overview", href: "/developers#overview" },
      { label: "API Key", href: "/developers#plans" },
      { label: "Authentication", href: "/developers#authentication" },
      { label: "Plans", href: "/developers#plans" },
      { label: "Rate limits", href: "/developers#rate-limits" },
      { label: "Errors", href: "/developers#errors" },
    ],
  },
  {
    title: "Generate",
    links: [
      { label: "POST /generate", href: "/developers#generate" },
      { label: "POST /ai/generate", href: "/developers#ai-generate" },
    ],
  },
  {
    title: "Check",
    links: [
      { label: "GET /platforms", href: "/developers#platforms" },
      { label: "POST /check", href: "/developers#check" },
      { label: "POST /check/batch", href: "/developers#check-batch" },
    ],
  },
  {
    title: "Account",
    links: [{ label: "GET /account", href: "/developers#account" }],
  },
];
