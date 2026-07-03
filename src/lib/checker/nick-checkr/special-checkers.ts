import { Impit } from "impit";
import {
  AvailabilityStatus,
  TimeoutError,
  type CheckResult,
} from "@/lib/checker/nick-checkr/abstract-service";

const TIMEOUT_MS = 10_000;
const REDDIT_MIN_INTERVAL_MS = 2_500;
const impit = new Impit({ browser: "chrome" });

let redditNextAllowedAt = 0;
let redditQueue: Promise<void> = Promise.resolve();

let redditOAuthToken: { value: string; expiresAt: number } | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForRedditSlot(): Promise<void> {
  redditQueue = redditQueue.then(async () => {
    const now = Date.now();
    const waitMs = Math.max(0, redditNextAllowedAt - now);
    if (waitMs > 0) {
      await sleep(waitMs);
    }
    redditNextAllowedAt = Date.now() + REDDIT_MIN_INTERVAL_MS;
  });
  await redditQueue;
}

async function fetchWithTimeout(
  url: string,
  init?: Parameters<Impit["fetch"]>[1],
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await impit.fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError(TIMEOUT_MS);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkTikTok(nick: string): Promise<CheckResult> {
  const profileUrl = `https://www.tiktok.com/@${nick}`;
  const url = `https://www.tiktok.com/oembed?url=${encodeURIComponent(profileUrl)}`;
  const response = await fetchWithTimeout(url);
  const body = await response.text();

  if (response.status === 200 && body.includes('"author_url"')) {
    return { status: AvailabilityStatus.Taken };
  }

  if (
    response.status === 400 &&
    (body.includes('"code":400') || body.includes('"code": 400'))
  ) {
    return { status: AvailabilityStatus.Available };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: `TikTok oembed HTTP ${response.status}`,
  };
}

export async function checkThreads(nick: string): Promise<CheckResult> {
  const response = await fetchWithTimeout(`https://www.threads.com/@${nick}`, {
    redirect: "manual",
    headers: {
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (response.status === 301 || response.status === 302) {
    const location = response.headers.get("location") ?? "";
    if (location.includes("/login")) {
      return { status: AvailabilityStatus.Available };
    }
  }

  if (response.status === 200) {
    const body = await response.text();
    if (body.includes('"username"') || body.length > 100_000) {
      return { status: AvailabilityStatus.Taken };
    }
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: `Threads HTTP ${response.status}`,
  };
}

function parseRedditRss(nick: string, status: number, body: string): CheckResult | null {
  if (
    status === 200 &&
    body.includes("<feed") &&
    (body.includes(`term="u_${nick}"`) ||
      body.includes(`/user/${nick}/`) ||
      body.includes(`label="u/${nick}"`))
  ) {
    return { status: AvailabilityStatus.Taken };
  }

  if (status === 404) {
    return { status: AvailabilityStatus.Available };
  }

  return null;
}

async function getRedditOAuthToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return null;
  }

  const now = Date.now();
  if (redditOAuthToken && redditOAuthToken.expiresAt > now + 60_000) {
    return redditOAuthToken.value;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "yournewhandle/1.0",
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!payload.access_token) {
    return null;
  }

  redditOAuthToken = {
    value: payload.access_token,
    expiresAt: now + (payload.expires_in ?? 3600) * 1000,
  };

  return payload.access_token;
}

async function checkRedditOAuth(nick: string): Promise<CheckResult | null> {
  const token = await getRedditOAuthToken();
  if (!token) {
    return null;
  }

  const response = await fetch(`https://oauth.reddit.com/user/${nick}/about`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "yournewhandle/1.0",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (response.status === 404) {
    return { status: AvailabilityStatus.Available };
  }

  if (response.ok) {
    const payload = (await response.json()) as { data?: { id?: string } };
    if (payload.data?.id) {
      return { status: AvailabilityStatus.Taken };
    }
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: `Reddit OAuth HTTP ${response.status}`,
  };
}

async function fetchRedditRss(nick: string): Promise<{ status: number; body: string }> {
  await waitForRedditSlot();
  const response = await fetchWithTimeout(
    `https://www.reddit.com/user/${nick}/.rss`,
    {
      headers: {
        "User-Agent": "WhatsMyName/1.0",
        Accept: "application/atom+xml, application/xml, text/xml, */*",
      },
    },
  );
  return { status: response.status, body: await response.text() };
}

export async function checkReddit(nick: string): Promise<CheckResult> {
  let rss = await fetchRedditRss(nick);
  let parsed = parseRedditRss(nick, rss.status, rss.body);
  if (parsed) {
    return parsed;
  }

  if (rss.status === 429) {
    await sleep(REDDIT_MIN_INTERVAL_MS);
    rss = await fetchRedditRss(nick);
    parsed = parseRedditRss(nick, rss.status, rss.body);
    if (parsed) {
      return parsed;
    }
  }

  const oauthResult = await checkRedditOAuth(nick);
  if (oauthResult) {
    return oauthResult;
  }

  if (rss.status === 429 || rss.status === 403) {
    return {
      status: AvailabilityStatus.Error,
      errorDetail: "Reddit rate limited",
    };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: `Reddit RSS HTTP ${rss.status}`,
  };
}

const SPECIAL_CHECKERS: Record<
  string,
  (nick: string) => Promise<CheckResult>
> = {
  TikTok: checkTikTok,
  Threads: checkThreads,
  Reddit: checkReddit,
};

export function getSpecialChecker(
  serviceName: string,
): ((nick: string) => Promise<CheckResult>) | undefined {
  return SPECIAL_CHECKERS[serviceName];
}
