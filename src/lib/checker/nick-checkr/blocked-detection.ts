const GLOBAL_BLOCKED_MARKERS = [
  "Client Challenge",
  "Just a moment",
  "Please wait for verification",
  "cf-browser-verification",
  "Enable JavaScript and cookies to continue",
] as const;

export function detectBlockedResponse(
  serviceName: string,
  status: number,
  body: string,
): string | null {
  for (const marker of GLOBAL_BLOCKED_MARKERS) {
    if (body.includes(marker)) {
      return marker;
    }
  }

  if (serviceName === "TikTok" && status === 200 && body.length < 5_000) {
    return "TikTok WAF";
  }

  if (serviceName === "Figma" && status === 202) {
    return "Figma rate limit";
  }

  if (serviceName === "Chess.com" && status === 403) {
    return "Chess.com blocked";
  }

  if (serviceName === "Minecraft" && status === 403) {
    return "NameMC blocked";
  }

  if (
    (serviceName === "Instagram" || serviceName === "Facebook") &&
    status === 200 &&
    body.length < 50_000 &&
    !body.includes('"pageID":"httpErrorPage"') &&
    !body.includes("This content isn't available")
  ) {
    return "Meta blocked or rate limited";
  }

  return null;
}
