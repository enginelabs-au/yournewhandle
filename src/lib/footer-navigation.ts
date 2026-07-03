import type { PlatformCategory } from "@/lib/platforms-registry";
import { PLATFORM_REGISTRY } from "@/lib/platforms-registry";

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterColumn = {
  id: string;
  title: string;
  accent: "cyan" | "purple" | "blue" | "green" | "orange" | "amber";
  icon: "search" | "sparkles" | "users" | "video" | "code" | "music";
  links: FooterLink[];
  viewAllHref: string;
};

export const FOOTER_UTILITY_LINKS: FooterLink[] = [
  { label: "Username Checker", href: "/#checker" },
  { label: "Handle Generator", href: "/#generator" },
  { label: "How It Works", href: "/#checker" },
  { label: "Platform List", href: "/#results" },
];

export const FOOTER_SOCIAL_LINKS: FooterLink[] = [
  { label: "X / Twitter", href: "https://x.com", external: true },
  { label: "GitHub", href: "https://github.com", external: true },
  { label: "Bluesky", href: "https://bsky.app", external: true },
  { label: "Telegram", href: "https://t.me", external: true },
  { label: "Mastodon", href: "https://mastodon.social", external: true },
];

function platformsInCategory(category: PlatformCategory, limit = 5): FooterLink[] {
  return PLATFORM_REGISTRY.filter((p) => p.category === category)
    .slice(0, limit)
    .map((p) => ({
      label: p.name,
      href: p.visitUrl,
      external: true,
    }));
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: "check",
    title: "Check Tools",
    accent: "cyan",
    icon: "search",
    viewAllHref: "/#checker",
    links: [
      { label: "Username Checker", href: "/#checker" },
      { label: "Availability Search", href: "/#checker" },
      { label: "Platform Results", href: "/#results" },
      { label: "Export JSON / CSV", href: "/#checker" },
      { label: "Live Status Grid", href: "/#results" },
    ],
  },
  {
    id: "generate",
    title: "Generate Tools",
    accent: "purple",
    icon: "sparkles",
    viewAllHref: "/#generator",
    links: [
      { label: "Handle Generator", href: "/#generator" },
      { label: "Phonetic Engine", href: "/#generator" },
      { label: "Dictionary Fusion", href: "/#generator" },
      { label: "Batch Output", href: "/#generator" },
      { label: "Length & Blend Controls", href: "/#generator" },
    ],
  },
  {
    id: "social",
    title: "Social Platforms",
    accent: "blue",
    icon: "users",
    viewAllHref: "/#checker",
    links: platformsInCategory("Social"),
  },
  {
    id: "video-gaming",
    title: "Video & Gaming",
    accent: "green",
    icon: "video",
    viewAllHref: "/#checker",
    links: [
      ...platformsInCategory("Video", 3),
      ...platformsInCategory("Gaming", 2),
    ],
  },
  {
    id: "coding-pro",
    title: "Coding & Pro",
    accent: "orange",
    icon: "code",
    viewAllHref: "/#checker",
    links: [
      ...platformsInCategory("Coding", 3),
      ...platformsInCategory("Professional", 2),
    ],
  },
  {
    id: "music-more",
    title: "Music & More",
    accent: "amber",
    icon: "music",
    viewAllHref: "/#checker",
    links: [
      ...platformsInCategory("Music", 2),
      ...platformsInCategory("Messaging", 2),
      ...platformsInCategory("Other", 1),
    ],
  },
];
