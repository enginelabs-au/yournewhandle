#!/usr/bin/env node
/**
 * Generates src/lib/platforms-registry.generated.ts from NickCheckr services manifest.
 * Run: node scripts/generate-platforms-registry.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const servicesPath = path.join(
  root,
  "src/lib/checker/nick-checkr/data/services.ts",
);
const outPath = path.join(root, "src/lib/platforms-registry.generated.ts");

const servicesSource = fs.readFileSync(servicesPath, "utf8");
const entryRegex =
  /\{\s*name:\s*'([^']+)',\s*url:\s*'([^']+)',\s*category:\s*'([^']+)'/g;

const services = [];
for (const match of servicesSource.matchAll(entryRegex)) {
  if (match[3] === "Domain Names") {
    continue;
  }
  services.push({ name: match[1], url: match[2], category: match[3] });
}

/** Lower = more popular (shown first). */
const POPULARITY_BY_ID = {
  instagram: 1,
  facebook: 2,
  youtube: 3,
  tiktok: 4,
  twitter: 5,
  x: 5,
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
  soundcloud: 30,
  tumblr: 31,
  vimeo: 32,
  gitlab: 33,
  "stack-overflow": 34,
  "dev-community": 35,
  npm: 36,
  "docker-hub": 37,
  replit: 38,
  codepen: 39,
  "hugging-face": 40,
  kick: 41,
  xbox: 42,
  minecraft: 43,
  chess: 44,
  "chess-com": 44,
  lichess: 45,
  lastfm: 46,
  "last-fm": 46,
  flickr: 47,
  gravatar: 48,
  aboutme: 49,
  "about-me": 49,
  matrix: 50,
};

const ICON_BY_ID = {
  instagram: "instagram",
  facebook: "facebook",
  youtube: "youtube",
  tiktok: "tiktok",
  twitter: "x",
  x: "x",
  discord: "discord",
  snapchat: "snapchat",
  reddit: "reddit",
  pinterest: "pinterest",
  telegram: "telegram",
  twitch: "twitch",
  github: "github",
  spotify: "spotify",
  threads: "threads",
  roblox: "roblox",
  steam: "steam",
  slack: "slack",
  bluesky: "bluesky",
  medium: "medium",
  substack: "substack",
  patreon: "patreon",
  mastodon: "mastodon",
  linktree: "linktree",
  notion: "notion",
  figma: "figma",
  behance: "behance",
  dribbble: "dribbble",
  soundcloud: "soundcloud",
  tumblr: "tumblr",
  vimeo: "vimeo",
  gitlab: "gitlab",
  npm: "npm",
  docker: "docker",
  "docker-hub": "docker",
  replit: "replit",
  "hugging-face": "huggingface",
  lichess: "lichess",
  flickr: "flickr",
  gravatar: "gravatar",
  "about-me": "aboutdotme",
  matrix: "matrix",
  vk: "vk",
  wordpress: "wordpress",
  bandcamp: "bandcamp",
  kick: "kick",
  ethereum: "ethereum",
  bitcoin: "bitcoin",
  paypal: "paypal",
  ebay: "ebay",
  etsy: "etsy",
  shopify: "shopify",
  tiktok: "tiktok",
};

const COLOR_BY_ICON = {
  instagram: "#E4405F",
  facebook: "#0866FF",
  youtube: "#FF0000",
  tiktok: "#000000",
  x: "#FFFFFF",
  discord: "#5865F2",
  snapchat: "#FFFC00",
  reddit: "#FF4500",
  pinterest: "#BD081C",
  telegram: "#26A5E4",
  twitch: "#9146FF",
  github: "#FFFFFF",
  spotify: "#1DB954",
  threads: "#FFFFFF",
  roblox: "#FFFFFF",
  steam: "#FFFFFF",
  slack: "#4A154B",
  bluesky: "#0085FF",
  medium: "#FFFFFF",
  substack: "#FF6719",
  patreon: "#FF424D",
  mastodon: "#6364FF",
  linktree: "#43E660",
  notion: "#FFFFFF",
  figma: "#F24E1E",
  gitlab: "#FC6D26",
  npm: "#CB3837",
  docker: "#2496ED",
};

function toId(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function visitUrlFromTemplate(urlTemplate) {
  try {
    const sample = urlTemplate.replace(/\{\}/g, "");
    const parsed = new URL(sample.startsWith("http") ? sample : `https://${sample}`);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return urlTemplate.split("{}")[0] ?? urlTemplate;
  }
}

function abbrFromName(name) {
  const words = name.replace(/[^a-zA-Z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function hashColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 55% 45%)`;
}

const seenIds = new Set();
const platforms = [];

for (const service of services) {
  let id = toId(service.name);
  if (seenIds.has(id)) {
    id = `${id}-${platforms.length}`;
  }
  seenIds.add(id);

  const iconSlug = ICON_BY_ID[id] ?? ICON_BY_ID[toId(service.name)] ?? undefined;
  const color = (iconSlug && COLOR_BY_ICON[iconSlug]) || hashColor(service.name);
  const popularity = POPULARITY_BY_ID[id] ?? 200 + platforms.length;

  platforms.push({
    id,
    name: service.name,
    nickCheckrService: service.name,
    category: service.category,
    urlTemplate: service.url,
    visitUrl: visitUrlFromTemplate(service.url),
    wired: true,
    color,
    abbr: abbrFromName(service.name),
    iconSlug,
    popularity,
  });
}

platforms.sort((a, b) => a.popularity - b.popularity || a.name.localeCompare(b.name));

const categories = [...new Set(platforms.map((p) => p.category))].sort();

const header = `// AUTO-GENERATED by scripts/generate-platforms-registry.mjs — do not edit manually.
// Source: src/lib/checker/nick-checkr/data/services.ts (${platforms.length} platforms)

import type { PlatformDefinition } from "@/lib/platforms-registry.types";

export const GENERATED_PLATFORM_DEFINITIONS: PlatformDefinition[] = [
`;

const body = platforms
  .map((p) => {
    const fields = [
      `id: ${JSON.stringify(p.id)}`,
      `name: ${JSON.stringify(p.name)}`,
      `nickCheckrService: ${JSON.stringify(p.nickCheckrService)}`,
      `category: ${JSON.stringify(p.category)}`,
      `urlTemplate: ${JSON.stringify(p.urlTemplate)}`,
      `visitUrl: ${JSON.stringify(p.visitUrl)}`,
      `wired: true`,
      `color: ${JSON.stringify(p.color)}`,
      `abbr: ${JSON.stringify(p.abbr)}`,
      p.iconSlug ? `iconSlug: ${JSON.stringify(p.iconSlug)}` : null,
      `popularity: ${p.popularity}`,
    ].filter(Boolean);
    return `  { ${fields.join(", ")} },`;
  })
  .join("\n");

const footer = `];

export const GENERATED_PLATFORM_CATEGORIES = ${JSON.stringify(categories, null, 2)} as const;
`;

fs.writeFileSync(outPath, header + body + "\n" + footer);
console.log(`Wrote ${platforms.length} platforms to ${outPath}`);
console.log(`Categories: ${categories.length}`);
