import { Impit } from "impit";
import {
  AvailabilityStatus,
  TimeoutError,
  type CheckResult,
} from "@/lib/checker/nick-checkr/abstract-service";
import { detectBlockedResponse } from "@/lib/checker/nick-checkr/blocked-detection";

const TIMEOUT_MS = 10_000;
const REDDIT_MIN_INTERVAL_MS = 3_000;
const REDDIT_USER_AGENT = "yournewhandle/1.0 (by /u/yournewhandle)";
const impit = new Impit({ browser: "chrome" });

/** Public web app id used by Instagram's logged-out web_profile_info endpoint. */
const INSTAGRAM_WEB_APP_ID = "936619743392459";

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

async function fetchPlainWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new TimeoutError(TIMEOUT_MS);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function extractHtmlTitle(body: string): string | null {
  return body.match(/<title[^>]*>([^<]+)/i)?.[1]?.trim() ?? null;
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

function parseInstagramHtml(body: string, status: number): CheckResult {
  const blocked = detectBlockedResponse("Instagram", status, body);
  if (blocked) {
    return { status: AvailabilityStatus.Error, errorDetail: blocked };
  }

  if (body.includes('"pageID":"httpErrorPage"')) {
    return { status: AvailabilityStatus.Available };
  }

  if (body.includes("PolarisProfilePage") && body.includes('"username"')) {
    return { status: AvailabilityStatus.Taken };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: "Instagram check inconclusive",
  };
}

export async function checkInstagram(nick: string): Promise<CheckResult> {
  const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(nick)}`;
  const apiResponse = await fetchWithTimeout(apiUrl, {
    headers: {
      Accept: "*/*",
      "X-IG-App-ID": INSTAGRAM_WEB_APP_ID,
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const apiBody = await apiResponse.text();

  if (apiResponse.status === 404) {
    return { status: AvailabilityStatus.Available };
  }

  if (apiResponse.status === 200) {
    try {
      const payload = JSON.parse(apiBody) as {
        data?: { user?: { username?: string } };
      };
      if (payload.data?.user?.username) {
        return { status: AvailabilityStatus.Taken };
      }
    } catch {
      // fall through to HTML fallback
    }
  }

  const apiBlocked = detectBlockedResponse("Instagram", apiResponse.status, apiBody);
  if (apiBlocked) {
    return { status: AvailabilityStatus.Error, errorDetail: apiBlocked };
  }

  const htmlResponse = await fetchWithTimeout(`https://www.instagram.com/${nick}/`, {
    headers: { "Accept-Language": "en-US,en;q=0.9" },
  });
  const htmlBody = await htmlResponse.text();
  return parseInstagramHtml(htmlBody, htmlResponse.status);
}

function extractFacebookTitle(body: string): string | null {
  return body.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? null;
}

function facebookUnavailableMarkers(body: string): boolean {
  return (
    body.includes("This content isn't available") ||
    body.includes("This content isn\\u0027t available") ||
    body.includes("This page isn't available") ||
    body.includes("This page isn\\u0027t available") ||
    body.includes("Page Not Found") ||
    body.includes("page you requested cannot be displayed")
  );
}

/** Non-zero profile id embedded in Meta's boot payload. */
function facebookProfileUserId(body: string): string | null {
  const quoted = body.match(/"userID":"(\d+)"/);
  if (quoted?.[1] && quoted[1] !== "0") {
    return quoted[1];
  }
  return null;
}

function facebookHasRealProfile(body: string): boolean {
  const profileUserId = facebookProfileUserId(body);
  if (profileUserId) {
    return true;
  }

  if (
    body.includes("ProfileCometHeaderQuery") &&
    body.includes("profile_header")
  ) {
    return true;
  }

  if (body.includes("profile_header") && body.includes("cover_photo")) {
    return true;
  }

  const title = extractFacebookTitle(body);
  if (
    title &&
    title !== "Facebook" &&
    !title.startsWith("Log in") &&
    !title.includes("Error")
  ) {
    return true;
  }

  return false;
}

function parseFacebookHtml(body: string, status: number): CheckResult {
  const blocked = detectBlockedResponse("Facebook", status, body);
  if (blocked) {
    return { status: AvailabilityStatus.Error, errorDetail: blocked };
  }

  if (facebookUnavailableMarkers(body) || status === 404) {
    return { status: AvailabilityStatus.Available };
  }

  if (facebookHasRealProfile(body)) {
    return { status: AvailabilityStatus.Taken };
  }

  if (/"userID":0\b/.test(body) && !body.includes("profile_header")) {
    return { status: AvailabilityStatus.Available };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: "Facebook check inconclusive",
  };
}

function facebookRedirectImpliesTaken(
  location: string,
  nick: string,
  profileUrl: string,
): boolean {
  if (!location) {
    return false;
  }

  if (
    location.includes("login.php") &&
    facebookLoginRedirectTargetsProfile(location, nick)
  ) {
    return true;
  }

  try {
    const resolved = new URL(location, profileUrl);
    if (!resolved.hostname.includes("facebook.com")) {
      return false;
    }

    const segment = resolved.pathname.replace(/\/$/, "").split("/").filter(Boolean)[0];
    if (segment && segment.toLowerCase() === nick.toLowerCase()) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

function facebookLoginRedirectTargetsProfile(
  location: string,
  nick: string,
): boolean {
  try {
    const next = new URL(location, "https://www.facebook.com").searchParams.get("next");
    if (!next) {
      return false;
    }
    const path = new URL(next, "https://www.facebook.com").pathname.replace(/\/$/, "");
    return path === `/${nick}` || path.endsWith(`/${nick}`);
  } catch {
    return false;
  }
}

export async function checkFacebook(nick: string): Promise<CheckResult> {
  const url = `https://www.facebook.com/${encodeURIComponent(nick)}`;
  const headers = { "Accept-Language": "en-US,en;q=0.9" };

  const manual = await fetchWithTimeout(url, {
    redirect: "manual",
    headers,
  });

  if (manual.status === 301 || manual.status === 302) {
    const location = manual.headers.get("location") ?? "";
    if (facebookRedirectImpliesTaken(location, nick, url)) {
      return { status: AvailabilityStatus.Taken };
    }
  }

  if (manual.status === 404) {
    return { status: AvailabilityStatus.Available };
  }

  const response =
    manual.status === 200
      ? manual
      : await fetchWithTimeout(url, { headers });

  const body = await response.text();
  const parsed = parseFacebookHtml(body, response.status);
  if (parsed.status !== AvailabilityStatus.Error) {
    return parsed;
  }

  // Some datacenter responses omit markers on www; try mobile HTML once.
  const mobileUrl = `https://m.facebook.com/${encodeURIComponent(nick)}`;
  const mobile = await fetchWithTimeout(mobileUrl, { headers });
  const mobileBody = await mobile.text();
  return parseFacebookHtml(mobileBody, mobile.status);
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
      "User-Agent": REDDIT_USER_AGENT,
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

async function checkRedditUsernameAvailable(
  nick: string,
  token: string,
): Promise<CheckResult | null> {
  const params = new URLSearchParams({ user: nick });
  const response = await fetch(
    `https://oauth.reddit.com/api/username_available?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": REDDIT_USER_AGENT,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    return {
      status: AvailabilityStatus.Error,
      errorDetail: `Reddit OAuth HTTP ${response.status}`,
    };
  }

  const payload = (await response.json()) as boolean | { available?: boolean };
  const available =
    typeof payload === "boolean" ? payload : payload.available === true;

  return {
    status: available
      ? AvailabilityStatus.Available
      : AvailabilityStatus.Taken,
  };
}

async function checkRedditOAuth(nick: string): Promise<CheckResult | null> {
  const token = await getRedditOAuthToken();
  if (!token) {
    return null;
  }

  const availability = await checkRedditUsernameAvailable(nick, token);
  if (
    availability &&
    availability.status !== AvailabilityStatus.Error
  ) {
    return availability;
  }

  const response = await fetch(`https://oauth.reddit.com/user/${nick}/about`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": REDDIT_USER_AGENT,
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

  return availability;
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
  const oauthResult = await checkRedditOAuth(nick);
  if (oauthResult && oauthResult.status !== AvailabilityStatus.Error) {
    return oauthResult;
  }

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

  if (oauthResult) {
    return oauthResult;
  }

  if (rss.status === 429 || rss.status === 403) {
    return {
      status: AvailabilityStatus.Error,
      errorDetail: "Reddit rate limited — add REDDIT_CLIENT_ID/SECRET for reliable checks",
    };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: `Reddit RSS HTTP ${rss.status}`,
  };
}

export async function checkDiscord(nick: string): Promise<CheckResult> {
  const response = await fetchPlainWithTimeout(
    "https://discord.com/api/v9/unique-username/username-attempt-unauthed",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: nick }),
    },
  );
  const payload = (await response.json()) as {
    taken?: boolean;
    code?: number;
    message?: string;
  };

  if (payload.taken === false) {
    return { status: AvailabilityStatus.Available };
  }
  if (payload.taken === true) {
    return { status: AvailabilityStatus.Taken };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: payload.message ?? "Discord username check failed",
  };
}

export async function checkMatrix(nick: string): Promise<CheckResult> {
  const response = await fetchPlainWithTimeout(
    `https://matrix.org/_matrix/client/v3/profile/@${encodeURIComponent(nick)}:matrix.org/displayname`,
    { headers: { Accept: "application/json" } },
  );
  const body = await response.text();

  if (response.status === 404 && body.includes("M_NOT_FOUND")) {
    return { status: AvailabilityStatus.Available };
  }
  if (response.ok) {
    return { status: AvailabilityStatus.Taken };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: `Matrix HTTP ${response.status}`,
  };
}

export async function checkHackerNews(nick: string): Promise<CheckResult> {
  const response = await fetchPlainWithTimeout(
    `https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(nick)}.json`,
    { headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    return {
      status: AvailabilityStatus.Error,
      errorDetail: `Hacker News HTTP ${response.status}`,
    };
  }

  const payload = (await response.json()) as { id?: string } | null;
  if (payload === null) {
    return { status: AvailabilityStatus.Available };
  }
  if (payload.id) {
    return { status: AvailabilityStatus.Taken };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: "Hacker News check inconclusive",
  };
}

export async function checkPyPI(nick: string): Promise<CheckResult> {
  const response = await fetchWithTimeout(
    `https://pypi.org/simple/${encodeURIComponent(nick)}/`,
    { headers: { Accept: "text/html" } },
  );
  const body = await response.text();

  if (response.status === 404 || body.includes("404 Not Found")) {
    return { status: AvailabilityStatus.Available };
  }

  if (
    body.includes("pypi:repository-version") ||
    body.includes(`Links for ${nick}`)
  ) {
    return { status: AvailabilityStatus.Taken };
  }

  const blocked = detectBlockedResponse("PyPI", response.status, body);
  if (blocked) {
    return { status: AvailabilityStatus.Error, errorDetail: blocked };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: "PyPI check inconclusive",
  };
}

export async function checkMinecraft(nick: string): Promise<CheckResult> {
  const response = await fetchPlainWithTimeout(
    `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(nick)}`,
    { headers: { Accept: "application/json" } },
  );

  if (response.status === 404) {
    return { status: AvailabilityStatus.Available };
  }
  if (response.ok) {
    return { status: AvailabilityStatus.Taken };
  }
  if (response.status === 429) {
    return {
      status: AvailabilityStatus.Error,
      errorDetail: "Minecraft API rate limited",
    };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: `Minecraft API HTTP ${response.status}`,
  };
}

export async function checkMedium(nick: string): Promise<CheckResult> {
  const response = await fetchWithTimeout(`https://medium.com/@${encodeURIComponent(nick)}`, {
    headers: { "Accept-Language": "en-US,en;q=0.9" },
  });
  const body = await response.text();

  const blocked = detectBlockedResponse("Medium", response.status, body);
  if (blocked) {
    return { status: AvailabilityStatus.Error, errorDetail: blocked };
  }

  if (
    body.includes("Out of nothing, something.") ||
    body.includes("404")
  ) {
    return { status: AvailabilityStatus.Available };
  }

  const title = extractHtmlTitle(body);
  if (!title || title === "Medium" || title.startsWith("Medium: Error")) {
    return { status: AvailabilityStatus.Available };
  }
  if (title.includes("Medium")) {
    return { status: AvailabilityStatus.Taken };
  }

  if (response.status === 404) {
    return { status: AvailabilityStatus.Available };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: "Medium check inconclusive",
  };
}

export async function checkSubstack(nick: string): Promise<CheckResult> {
  const response = await fetchWithTimeout(`https://${encodeURIComponent(nick)}.substack.com`, {
    redirect: "manual",
    headers: { "Accept-Language": "en-US,en;q=0.9" },
  });

  if (response.status === 404) {
    return { status: AvailabilityStatus.Available };
  }

  const body =
    response.status === 200 || response.status === 403
      ? await response.text()
      : "";

  if (body.includes("Not Found") || body.includes("not found")) {
    return { status: AvailabilityStatus.Available };
  }

  if (response.ok) {
    return { status: AvailabilityStatus.Taken };
  }

  if (response.status === 403 && body.length > 0) {
    return { status: AvailabilityStatus.Taken };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: `Substack HTTP ${response.status}`,
  };
}

export async function checkNotion(nick: string): Promise<CheckResult> {
  const response = await fetchPlainWithTimeout(
    `https://${encodeURIComponent(nick)}.notion.site`,
    { headers: { "Accept-Language": "en-US,en;q=0.9" } },
  );
  const body = await response.text();

  if (response.status === 404) {
    return { status: AvailabilityStatus.Available };
  }

  const title = extractHtmlTitle(body);
  if (
    title === "Notion" &&
    body.length <= 20_000 &&
    body.includes("notion-html")
  ) {
    return { status: AvailabilityStatus.Available };
  }

  if (response.ok) {
    return { status: AvailabilityStatus.Taken };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: `Notion HTTP ${response.status}`,
  };
}

export async function checkReplit(nick: string): Promise<CheckResult> {
  const response = await fetchWithTimeout(`https://replit.com/@${encodeURIComponent(nick)}`, {
    headers: { "Accept-Language": "en-US,en;q=0.9" },
  });
  const body = await response.text();
  const title = extractHtmlTitle(body);

  if (response.status === 404 || title?.includes("404 - Replit")) {
    return { status: AvailabilityStatus.Available };
  }

  if (title?.includes("Sign Up - Replit")) {
    return { status: AvailabilityStatus.Available };
  }

  if (body.includes('"username"') && body.toLowerCase().includes(nick.toLowerCase())) {
    return { status: AvailabilityStatus.Taken };
  }

  if (response.ok) {
    return { status: AvailabilityStatus.Taken };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: "Replit check inconclusive",
  };
}

export async function checkSpotify(nick: string): Promise<CheckResult> {
  const response = await fetchPlainWithTimeout(
    `https://open.spotify.com/user/${encodeURIComponent(nick)}`,
    { headers: { "Accept-Language": "en-US,en;q=0.9" } },
  );
  const body = await response.text();
  const title = extractHtmlTitle(body);

  if (
    response.status === 404 ||
    title === "Page not found" ||
    body.includes("Page not found")
  ) {
    return { status: AvailabilityStatus.Available };
  }

  if (
    title?.includes(" on Spotify") ||
    body.includes('property="og:type" content="profile"')
  ) {
    return { status: AvailabilityStatus.Taken };
  }

  return {
    status: AvailabilityStatus.Error,
    errorDetail: "Spotify check inconclusive",
  };
}

const SPECIAL_CHECKERS: Record<
  string,
  (nick: string) => Promise<CheckResult>
> = {
  Instagram: checkInstagram,
  Facebook: checkFacebook,
  TikTok: checkTikTok,
  Threads: checkThreads,
  Reddit: checkReddit,
  Discord: checkDiscord,
  Matrix: checkMatrix,
  "Hacker News": checkHackerNews,
  PyPI: checkPyPI,
  Minecraft: checkMinecraft,
  Medium: checkMedium,
  Substack: checkSubstack,
  Notion: checkNotion,
  Replit: checkReplit,
  Spotify: checkSpotify,
};

export function getSpecialChecker(
  serviceName: string,
): ((nick: string) => Promise<CheckResult>) | undefined {
  return SPECIAL_CHECKERS[serviceName];
}
