import type { PlatformCheckResult } from "@/lib/checker/report-types";
import type { CheckStatus } from "@/lib/types";

export type PlatformCategory =
  | "Social"
  | "Video"
  | "Coding"
  | "Gaming"
  | "Professional"
  | "Music"
  | "Messaging"
  | "Other";

export type PlatformDefinition = {
  id: string;
  name: string;
  category: PlatformCategory;
  visitUrl: string;
  wired: boolean;
  color: string;
  abbr: string;
  /** Simple Icons slug for cdn.simpleicons.org */
  iconSlug?: string;
};

type PlatformResultOverrides = Partial<
  Omit<PlatformCheckResult, "platformId" | "name" | "category" | "visitUrl" | "color" | "abbr" | "iconSlug">
> & { status?: CheckStatus };

export function platformCheckResult(
  platform: PlatformDefinition,
  overrides: PlatformResultOverrides = {},
): PlatformCheckResult {
  return {
    platformId: platform.id,
    name: platform.name,
    category: platform.category,
    visitUrl: platform.visitUrl,
    color: platform.color,
    abbr: platform.abbr,
    iconSlug: platform.iconSlug,
    status: overrides.status ?? "idle",
    message: overrides.message,
    latencyMs: overrides.latencyMs,
    profileUrl: overrides.profileUrl,
  };
}

export function platformIconUrl(slug: string, color: string): string {
  const hex = color.replace("#", "");
  return `https://cdn.simpleicons.org/${slug}/${hex}`;
}

/** Lower rank = more popular (shown and checked first). */
const PLATFORM_POPULARITY: Record<string, number> = {
  instagram: 1,
  facebook: 2,
  youtube: 3,
  tiktok: 4,
  twitter: 5,
  discord: 6,
  snapchat: 7,
  reddit: 8,
  pinterest: 9,
  linkedin: 10,
  telegram: 11,
  twitch: 12,
  github: 13,
  spotify: 14,
  threads: 15,
  roblox: 16,
  steam: 17,
  slack: 18,
  bluesky: 19,
  medium: 20,
  substack: 21,
  patreon: 22,
  mastodon: 23,
  linktree: 24,
  notion: 25,
  figma: 26,
  behance: 27,
  dribbble: 28,
  producthunt: 29,
  soundcloud: 30,
  tumblr: 31,
  vimeo: 32,
  gitlab: 33,
  stackoverflow: 34,
  devto: 35,
  npm: 36,
  dockerhub: 37,
  replit: 38,
  codepen: 39,
  huggingface: 40,
  kick: 41,
  xbox: 42,
  minecraft: 43,
  chess: 44,
  lichess: 45,
  lastfm: 46,
  flickr: 47,
  gravatar: 48,
  aboutme: 49,
  matrix: 50,
};

/** 50 platforms — superset of DNS Robot's 30 with extras for creators & devs. */
const PLATFORM_DEFINITIONS: PlatformDefinition[] = [
  { id: "discord", name: "Discord", category: "Messaging", visitUrl: "https://discord.com", wired: false, color: "#5865F2", abbr: "DC", iconSlug: "discord" },
  { id: "telegram", name: "Telegram", category: "Messaging", visitUrl: "https://t.me", wired: true, color: "#26A5E4", abbr: "TG", iconSlug: "telegram" },
  { id: "slack", name: "Slack", category: "Messaging", visitUrl: "https://slack.com", wired: false, color: "#4A154B", abbr: "SL", iconSlug: "slack" },
  { id: "matrix", name: "Matrix", category: "Messaging", visitUrl: "https://matrix.org", wired: false, color: "#000000", abbr: "MX", iconSlug: "matrix" },
  { id: "twitter", name: "X / Twitter", category: "Social", visitUrl: "https://x.com", wired: true, color: "#FFFFFF", abbr: "X", iconSlug: "x" },
  { id: "instagram", name: "Instagram", category: "Social", visitUrl: "https://instagram.com", wired: false, color: "#E4405F", abbr: "IG", iconSlug: "instagram" },
  { id: "tiktok", name: "TikTok", category: "Social", visitUrl: "https://tiktok.com", wired: false, color: "#000000", abbr: "TT", iconSlug: "tiktok" },
  { id: "reddit", name: "Reddit", category: "Social", visitUrl: "https://reddit.com", wired: false, color: "#FF4500", abbr: "RD", iconSlug: "reddit" },
  { id: "snapchat", name: "Snapchat", category: "Social", visitUrl: "https://snapchat.com", wired: false, color: "#FFFC00", abbr: "SC", iconSlug: "snapchat" },
  { id: "mastodon", name: "Mastodon", category: "Social", visitUrl: "https://mastodon.social", wired: false, color: "#6364FF", abbr: "MA", iconSlug: "mastodon" },
  { id: "bluesky", name: "Bluesky", category: "Social", visitUrl: "https://bsky.app", wired: false, color: "#0085FF", abbr: "BS", iconSlug: "bluesky" },
  { id: "threads", name: "Threads", category: "Social", visitUrl: "https://threads.net", wired: false, color: "#FFFFFF", abbr: "TH", iconSlug: "threads" },
  { id: "pinterest", name: "Pinterest", category: "Social", visitUrl: "https://pinterest.com", wired: false, color: "#BD081C", abbr: "PI", iconSlug: "pinterest" },
  { id: "facebook", name: "Facebook", category: "Social", visitUrl: "https://facebook.com", wired: false, color: "#0866FF", abbr: "FB", iconSlug: "facebook" },
  { id: "linkedin", name: "LinkedIn", category: "Professional", visitUrl: "https://linkedin.com", wired: false, color: "#0A66C2", abbr: "LI", iconSlug: "linkedin" },
  { id: "linktree", name: "Linktree", category: "Professional", visitUrl: "https://linktr.ee", wired: false, color: "#43E660", abbr: "LT", iconSlug: "linktree" },
  { id: "aboutme", name: "About.me", category: "Professional", visitUrl: "https://about.me", wired: false, color: "#0066CC", abbr: "AM", iconSlug: "aboutdotme" },
  { id: "dribbble", name: "Dribbble", category: "Professional", visitUrl: "https://dribbble.com", wired: false, color: "#EA4C89", abbr: "DR", iconSlug: "dribbble" },
  { id: "behance", name: "Behance", category: "Professional", visitUrl: "https://behance.net", wired: false, color: "#1769FF", abbr: "BE", iconSlug: "behance" },
  { id: "producthunt", name: "Product Hunt", category: "Professional", visitUrl: "https://producthunt.com", wired: false, color: "#DA552F", abbr: "PH", iconSlug: "producthunt" },
  { id: "youtube", name: "YouTube", category: "Video", visitUrl: "https://youtube.com", wired: false, color: "#FF0000", abbr: "YT", iconSlug: "youtube" },
  { id: "twitch", name: "Twitch", category: "Video", visitUrl: "https://twitch.tv", wired: false, color: "#9146FF", abbr: "TW", iconSlug: "twitch" },
  { id: "kick", name: "Kick", category: "Video", visitUrl: "https://kick.com", wired: false, color: "#53FC18", abbr: "KK", iconSlug: "kick" },
  { id: "vimeo", name: "Vimeo", category: "Video", visitUrl: "https://vimeo.com", wired: false, color: "#1AB7EA", abbr: "VM", iconSlug: "vimeo" },
  { id: "github", name: "GitHub", category: "Coding", visitUrl: "https://github.com", wired: true, color: "#FFFFFF", abbr: "GH", iconSlug: "github" },
  { id: "gitlab", name: "GitLab", category: "Coding", visitUrl: "https://gitlab.com", wired: false, color: "#FC6D26", abbr: "GL", iconSlug: "gitlab" },
  { id: "devto", name: "Dev.to", category: "Coding", visitUrl: "https://dev.to", wired: false, color: "#FFFFFF", abbr: "DV", iconSlug: "devdotto" },
  { id: "stackoverflow", name: "Stack Overflow", category: "Coding", visitUrl: "https://stackoverflow.com", wired: false, color: "#F58025", abbr: "SO", iconSlug: "stackoverflow" },
  { id: "codepen", name: "CodePen", category: "Coding", visitUrl: "https://codepen.io", wired: false, color: "#FFFFFF", abbr: "CP", iconSlug: "codepen" },
  { id: "replit", name: "Replit", category: "Coding", visitUrl: "https://replit.com", wired: false, color: "#F26207", abbr: "RP", iconSlug: "replit" },
  { id: "dockerhub", name: "Docker Hub", category: "Coding", visitUrl: "https://hub.docker.com", wired: false, color: "#2496ED", abbr: "DK", iconSlug: "docker" },
  { id: "npm", name: "npm", category: "Coding", visitUrl: "https://npmjs.com", wired: false, color: "#CB3837", abbr: "NP", iconSlug: "npm" },
  { id: "huggingface", name: "Hugging Face", category: "Coding", visitUrl: "https://huggingface.co", wired: false, color: "#FFD21E", abbr: "HF", iconSlug: "huggingface" },
  { id: "steam", name: "Steam", category: "Gaming", visitUrl: "https://store.steampowered.com", wired: false, color: "#FFFFFF", abbr: "ST", iconSlug: "steam" },
  { id: "xbox", name: "Xbox", category: "Gaming", visitUrl: "https://xbox.com", wired: false, color: "#107C10", abbr: "XB", iconSlug: "xbox" },
  { id: "roblox", name: "Roblox", category: "Gaming", visitUrl: "https://roblox.com", wired: false, color: "#FFFFFF", abbr: "RB", iconSlug: "roblox" },
  { id: "chess", name: "Chess.com", category: "Gaming", visitUrl: "https://chess.com", wired: false, color: "#769656", abbr: "CH" },
  { id: "minecraft", name: "Minecraft", category: "Gaming", visitUrl: "https://minecraft.net", wired: false, color: "#62B47A", abbr: "MC" },
  { id: "lichess", name: "Lichess", category: "Gaming", visitUrl: "https://lichess.org", wired: false, color: "#FFFFFF", abbr: "LI", iconSlug: "lichess" },
  { id: "spotify", name: "Spotify", category: "Music", visitUrl: "https://open.spotify.com", wired: false, color: "#1DB954", abbr: "SP", iconSlug: "spotify" },
  { id: "soundcloud", name: "SoundCloud", category: "Music", visitUrl: "https://soundcloud.com", wired: false, color: "#FF5500", abbr: "SC", iconSlug: "soundcloud" },
  { id: "lastfm", name: "Last.fm", category: "Music", visitUrl: "https://last.fm", wired: false, color: "#D51007", abbr: "LF", iconSlug: "lastdotfm" },
  { id: "medium", name: "Medium", category: "Other", visitUrl: "https://medium.com", wired: false, color: "#FFFFFF", abbr: "MD", iconSlug: "medium" },
  { id: "substack", name: "Substack", category: "Other", visitUrl: "https://substack.com", wired: false, color: "#FF6719", abbr: "SS", iconSlug: "substack" },
  { id: "patreon", name: "Patreon", category: "Other", visitUrl: "https://patreon.com", wired: false, color: "#FF424D", abbr: "PA", iconSlug: "patreon" },
  { id: "tumblr", name: "Tumblr", category: "Other", visitUrl: "https://tumblr.com", wired: false, color: "#36465D", abbr: "TB", iconSlug: "tumblr" },
  { id: "flickr", name: "Flickr", category: "Other", visitUrl: "https://flickr.com", wired: false, color: "#FF0084", abbr: "FL", iconSlug: "flickr" },
  { id: "gravatar", name: "Gravatar", category: "Other", visitUrl: "https://gravatar.com", wired: false, color: "#1E8CBE", abbr: "GR", iconSlug: "gravatar" },
  { id: "figma", name: "Figma", category: "Professional", visitUrl: "https://figma.com", wired: false, color: "#F24E1E", abbr: "FG", iconSlug: "figma" },
  { id: "notion", name: "Notion", category: "Other", visitUrl: "https://notion.so", wired: false, color: "#FFFFFF", abbr: "NO", iconSlug: "notion" },
];

export const PLATFORM_REGISTRY: PlatformDefinition[] = [...PLATFORM_DEFINITIONS].sort(
  (a, b) =>
    (PLATFORM_POPULARITY[a.id] ?? 999) - (PLATFORM_POPULARITY[b.id] ?? 999),
);

export const PLATFORM_COUNT = PLATFORM_REGISTRY.length;

export const FILTER_TABS: { id: PlatformCategory | "All"; label: string }[] = [
  { id: "All", label: "All" },
  { id: "Social", label: "Social" },
  { id: "Messaging", label: "Messaging" },
  { id: "Video", label: "Video" },
  { id: "Coding", label: "Coding" },
  { id: "Gaming", label: "Gaming" },
  { id: "Professional", label: "Pro" },
  { id: "Music", label: "Music" },
  { id: "Other", label: "Other" },
];

export function countPlatformsByCategory(
  platforms: { category: string }[],
): Record<string, number> {
  const counts: Record<string, number> = { All: platforms.length };
  for (const p of platforms) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }
  return counts;
}
