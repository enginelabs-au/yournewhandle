import type { CheckStatus } from "@/lib/types";

export type SocialCheckResult = {
  platform: string;
  target: string;
  status: CheckStatus;
  message?: string;
  deepLink?: string;
};

export function validateGithubUsername(handle: string): string | null {
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(handle)) {
    return "Invalid GitHub username format";
  }
  if (handle.startsWith("-") || handle.endsWith("-")) {
    return "GitHub username cannot start or end with hyphen";
  }
  return null;
}

export function validateTwitterUsername(handle: string): string | null {
  if (!/^[a-zA-Z0-9_]{4,15}$/.test(handle)) {
    return "X handles must be 4–15 chars (letters, numbers, underscore)";
  }
  return null;
}

export function validateTelegramUsername(handle: string): string | null {
  if (!/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(handle)) {
    return "Telegram handles must start with a letter and be 5–32 chars";
  }
  return null;
}

export async function checkGithub(
  handle: string,
  signal: AbortSignal,
): Promise<SocialCheckResult> {
  const validationError = validateGithubUsername(handle);
  if (validationError) {
    return {
      platform: "GitHub",
      target: handle,
      status: "error",
      message: validationError,
      deepLink: `https://github.com/${handle}`,
    };
  }

  try {
    const response = await fetch(
      `/api/check-github?handle=${encodeURIComponent(handle)}`,
      { signal },
    );

    if (!response.ok) {
      return {
        platform: "GitHub",
        target: handle,
        status: "error",
        message: "GitHub check request failed",
        deepLink: `https://github.com/${handle}`,
      };
    }

    return (await response.json()) as SocialCheckResult;
  } catch {
    return {
      platform: "GitHub",
      target: handle,
      status: "error",
      message: "GitHub check failed",
      deepLink: `https://github.com/${handle}`,
    };
  }
}

export function checkTwitter(handle: string): SocialCheckResult {
  const validationError = validateTwitterUsername(handle);
  return {
    platform: "X (Twitter)",
    target: handle,
    status: validationError ? "error" : "verify",
    message: validationError ?? "Deep-link verification required",
    deepLink: `https://x.com/${handle}`,
  };
}

export function checkTelegram(handle: string): SocialCheckResult {
  const validationError = validateTelegramUsername(handle);
  return {
    platform: "Telegram",
    target: handle,
    status: validationError ? "error" : "verify",
    message: validationError ?? "Deep-link verification required",
    deepLink: `https://t.me/${handle}`,
  };
}

export async function checkSocials(
  handle: string,
  signal: AbortSignal,
): Promise<SocialCheckResult[]> {
  const [github] = await Promise.all([checkGithub(handle, signal)]);
  return [github, checkTwitter(handle), checkTelegram(handle)];
}
